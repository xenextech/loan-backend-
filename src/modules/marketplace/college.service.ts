import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/slugify.util';
import { serializeCourseFees } from './course.service';
import { QueryCollegesDto } from './dto/query-colleges.dto';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';

// "6mo" / "1y" / "6mo–4y" style range for the marketplace card's quick
// stats — null when no active course has a durationMonths value set.
function formatDurationRange(monthsList: (number | null)[]): string | null {
  const values = monthsList.filter((m): m is number => m != null);
  if (!values.length) return null;
  const toLabel = (m: number) => {
    if (m < 12) return `${m}mo`;
    return m % 12 === 0 ? `${m / 12}y` : `${(m / 12).toFixed(1)}y`;
  };
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? toLabel(min) : `${toLabel(min)}–${toLabel(max)}`;
}

@Injectable()
export class CollegeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private buildCourseFilter(query: QueryCollegesDto): Prisma.CourseWhereInput {
    const courseWhere: Prisma.CourseWhereInput = { isActive: true };
    if (query.category) courseWhere.category = query.category;
    if (query.degreeLevel) courseWhere.degreeLevel = query.degreeLevel;
    if (query.duration) courseWhere.duration = query.duration;
    if (query.minFee !== undefined || query.maxFee !== undefined) {
      courseWhere.tuitionFee = {
        ...(query.minFee !== undefined && { gte: query.minFee }),
        ...(query.maxFee !== undefined && { lte: query.maxFee }),
      };
    }
    return courseWhere;
  }

  private toCardResponse(
    college: Prisma.CollegeGetPayload<{
      include: { university: true; courses: true };
    }>,
  ) {
    const activeCourses = college.courses.filter((c) => c.isActive);
    const startingTuition = activeCourses.length
      ? Math.min(...activeCourses.map((c) => Number(c.tuitionFee)))
      : null;
    return {
      id: college.id,
      name: college.name,
      slug: college.slug,
      description: college.description,
      logoUrl: college.logoUrl,
      bannerUrl: college.bannerUrl,
      address: college.address,
      province: college.province,
      district: college.district,
      municipality: college.municipality,
      university: college.university
        ? {
            id: college.university.id,
            name: college.university.name,
            shortName: college.university.shortName,
          }
        : null,
      startingTuition,
      durationRange: formatDurationRange(
        activeCourses.map((c) => c.durationMonths),
      ),
      courseCount: activeCourses.length,
      accreditation: college.accreditation,
      isFeatured: college.isFeatured,
      isActive: college.isActive,
    };
  }

  async findAll(query: QueryCollegesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = paginate(page, limit);

    const courseWhere = this.buildCourseFilter(query);
    const hasCourseFilter =
      query.category !== undefined ||
      query.degreeLevel !== undefined ||
      query.duration !== undefined ||
      query.minFee !== undefined ||
      query.maxFee !== undefined;

    const where: Prisma.CollegeWhereInput = {
      ...(!query.includeInactive && { isActive: true }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
      ...(query.province && {
        province: { equals: query.province, mode: 'insensitive' },
      }),
      ...(query.district && {
        district: { equals: query.district, mode: 'insensitive' },
      }),
      ...(query.universityId && { universityId: query.universityId }),
      ...(hasCourseFilter && { courses: { some: courseWhere } }),
    };

    const sortOrder = query.sortOrder ?? 'asc';
    const orderBy: Prisma.CollegeOrderByWithRelationInput =
      query.sortBy === 'createdAt'
        ? { createdAt: sortOrder }
        : { name: sortOrder };

    const [colleges, total] = await this.prisma.$transaction([
      this.prisma.college.findMany({
        where,
        include: {
          university: true,
          courses: {
            where: { isActive: true },
            orderBy: { tuitionFee: 'asc' },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.college.count({ where }),
    ]);

    let cards = colleges.map((c) => this.toCardResponse(c));
    if (query.sortBy === 'startingTuition') {
      cards = cards.sort((a, b) => {
        const diff = (a.startingTuition ?? 0) - (b.startingTuition ?? 0);
        return sortOrder === 'desc' ? -diff : diff;
      });
    }

    return buildPaginatedResponse(cards, total, page, limit);
  }

  async findOne(id: string) {
    const college = await this.prisma.college.findUnique({
      where: { id },
      include: {
        university: true,
        courses: { where: { isActive: true }, orderBy: { tuitionFee: 'asc' } },
      },
    });
    if (!college || !college.isActive) {
      throw new NotFoundException('College not found');
    }
    return { ...college, courses: college.courses.map(serializeCourseFees) };
  }

  // Cross-checks a marketplace-selected college+course pair against the
  // catalog before the applications module trusts them for prefill — the one
  // enforcement point that keeps a student from tampering with devtools-edited
  // college/course names while keeping a "valid-looking" id.
  async getPrefillData(collegeId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { college: { include: { university: true } } },
    });
    if (!course || !course.isActive || !course.college.isActive) {
      throw new NotFoundException('Selected course is unavailable');
    }
    if (course.collegeId !== collegeId) {
      throw new BadRequestException(
        'Course does not belong to the selected college',
      );
    }
    return {
      collegeId: course.college.id,
      collegeName: course.college.name,
      courseId: course.id,
      courseName: course.name,
      universityName: course.college.university?.name ?? null,
      duration: course.duration,
      tuitionFee: Number(course.tuitionFee),
      degreeLevel: course.degreeLevel,
      category: course.category,
    };
  }

  private async uniqueSlug(name: string, excludeId?: string) {
    const base = slugify(name) || 'college';
    let slug = base;
    let suffix = 1;
    // Small catalog — a plain existence check per attempt is simpler than a
    // dedicated collision-avoidance query and never runs more than a couple times.
    while (
      await this.prisma.college.findFirst({
        where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      })
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  async create(dto: CreateCollegeDto, actorUserId: string) {
    const slug = await this.uniqueSlug(dto.name);
    const college = await this.prisma.college.create({
      data: { ...dto, slug },
    });
    await this.audit.log(actorUserId, AuditAction.MARKETPLACE_COLLEGE_CREATED, {
      collegeId: college.id,
      name: college.name,
    });
    return college;
  }

  async update(id: string, dto: UpdateCollegeDto, actorUserId: string) {
    const existing = await this.prisma.college.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('College not found');

    const slug =
      dto.name && dto.name !== existing.name
        ? await this.uniqueSlug(dto.name, id)
        : undefined;

    const college = await this.prisma.college.update({
      where: { id },
      data: { ...dto, ...(slug && { slug }) },
    });
    await this.audit.log(actorUserId, AuditAction.MARKETPLACE_COLLEGE_UPDATED, {
      collegeId: id,
    });
    return college;
  }

  async remove(id: string, actorUserId: string) {
    const existing = await this.prisma.college.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('College not found');

    // Soft-delete only — LoanApplication.collegeId may reference this row for
    // historical applications, so it must never be hard-deleted.
    await this.prisma.college.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log(actorUserId, AuditAction.MARKETPLACE_COLLEGE_DELETED, {
      collegeId: id,
    });
    return { message: 'College deactivated' };
  }
}
