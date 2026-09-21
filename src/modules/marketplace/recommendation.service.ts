import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CollegeService } from './college.service';
import { CourseCategory, DegreeLevel } from '../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../common/dto/pagination.dto';
import { RecommendCollegesQueryDto } from './dto/recommend-colleges-query.dto';

type CandidateCollege = Prisma.CollegeGetPayload<{
  include: { university: true; courses: true };
}>;
type CandidateCourse = CandidateCollege['courses'][number];

interface Target {
  province: string | null;
  district: string | null;
  category: CourseCategory | null;
  degreeLevel: DegreeLevel | null;
  courseNameFallback: string | null;
  budget: number | null;
  currentCollegeId: string | null;
}

interface CourseScore {
  points: number;
  reasons: string[];
}

// Rule-based match: no ML, every point is traceable to a human-readable
// reason string so the mobile app can show "why this college" chips.
function scoreCourse(course: CandidateCourse, target: Target): CourseScore {
  const reasons: string[] = [];
  let points = 0;

  if (target.category && course.category === target.category) {
    points += 40;
    reasons.push('Matches your course interest');
  } else if (target.courseNameFallback) {
    const tokens = target.courseNameFallback
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    const haystack =
      `${course.name} ${course.description ?? ''}`.toLowerCase();
    if (tokens.some((t) => haystack.includes(t))) {
      points += 20;
      reasons.push('Similar to your course of interest');
    }
  }

  if (target.degreeLevel && course.degreeLevel === target.degreeLevel) {
    points += 25;
    reasons.push('Same degree level');
  }

  if (target.budget != null) {
    const totalFee = Number(course.totalFee);
    if (totalFee <= target.budget) {
      points += 15;
      reasons.push('Within your budget');
    } else if (totalFee <= target.budget * 1.15) {
      points += 7;
      reasons.push('Close to your budget');
    }
  }

  if (course.isPopular) {
    points += 5;
    reasons.push('Popular course');
  }

  return { points, reasons };
}

function scoreCollege(
  college: CandidateCollege,
  target: Target,
): { points: number; reasons: string[] } {
  const reasons: string[] = [];
  let points = 0;

  if (target.province && eqInsensitive(college.province, target.province)) {
    points += 20;
    reasons.push('In your province');
    if (target.district && eqInsensitive(college.district, target.district)) {
      points += 10;
      reasons.push('In your district');
    }
  }

  if (college.isFeatured) {
    points += 10;
    reasons.push('Featured college');
  }

  return { points, reasons };
}

function eqInsensitive(a: string | null, b: string) {
  return !!a && a.toLowerCase() === b.toLowerCase();
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly collegeService: CollegeService,
  ) {}

  private async buildTarget(userId: string): Promise<Target | null> {
    const application = await this.prisma.loanApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        studyInformation: { include: { course: true } },
        loanInformation: true,
      },
    });
    if (!application) return null;

    const linkedCourse = application.studyInformation?.course ?? null;
    const budgetSource =
      application.loanInformation?.loanAmount ??
      application.studyInformation?.tuitionFee ??
      null;

    return {
      province: application.province,
      district: application.district,
      category: linkedCourse?.category ?? null,
      degreeLevel: linkedCourse?.degreeLevel ?? null,
      courseNameFallback: linkedCourse
        ? null
        : (application.studyInformation?.courseName ?? null),
      budget: budgetSource != null ? Number(budgetSource) : null,
      currentCollegeId: application.collegeId,
    };
  }

  async getRecommendations(
    userId: string,
    query: RecommendCollegesQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = paginate(page, limit);

    const target = await this.buildTarget(userId);

    const excludeCollegeId =
      target && !query.includeCurrentCollege ? target.currentCollegeId : null;

    const colleges = await this.prisma.college.findMany({
      where: {
        isActive: true,
        ...(excludeCollegeId && { id: { not: excludeCollegeId } }),
      },
      include: {
        university: true,
        courses: { where: { isActive: true }, orderBy: { tuitionFee: 'asc' } },
      },
    });

    const ranked = colleges.map((college) => {
      if (!target) {
        return {
          college,
          matchScore: 0,
          matchReasons: college.isFeatured ? ['Featured college'] : [],
          matchedCourse: null as CandidateCourse | null,
        };
      }

      const collegeScore = scoreCollege(college, target);
      let bestCourse: CandidateCourse | null = null;
      let bestCoursePoints = -1;
      let bestCourseReasons: string[] = [];

      for (const course of college.courses) {
        const { points, reasons } = scoreCourse(course, target);
        if (points > bestCoursePoints) {
          bestCoursePoints = points;
          bestCourse = course;
          bestCourseReasons = reasons;
        }
      }

      const hasCourses = college.courses.length > 0;
      const matchScore =
        collegeScore.points + (hasCourses ? Math.max(bestCoursePoints, 0) : 0);

      return {
        college,
        matchScore,
        matchReasons: [...collegeScore.reasons, ...bestCourseReasons],
        matchedCourse: hasCourses ? bestCourse : null,
      };
    });

    ranked.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (a.college.isFeatured !== b.college.isFeatured) {
        return a.college.isFeatured ? -1 : 1;
      }
      return a.college.name.localeCompare(b.college.name);
    });

    const total = ranked.length;
    const page$ = ranked.slice(skip, skip + take);

    const data = page$.map(({ college, matchScore, matchReasons, matchedCourse }) => ({
      ...this.collegeService.toCardResponse(college),
      matchScore,
      matchReasons,
      matchedCourse: matchedCourse
        ? {
            id: matchedCourse.id,
            name: matchedCourse.name,
            category: matchedCourse.category,
            degreeLevel: matchedCourse.degreeLevel,
            totalFee: Number(matchedCourse.totalFee),
          }
        : null,
    }));

    return buildPaginatedResponse(data, total, page, limit);
  }
}
