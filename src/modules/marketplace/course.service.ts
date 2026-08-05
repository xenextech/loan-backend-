import { Injectable, NotFoundException } from '@nestjs/common';
import { Course, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/slugify.util';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesAdminDto } from './dto/query-courses-admin.dto';

export function serializeCourseFees<
  T extends Pick<Course, 'tuitionFee' | 'admissionFee' | 'totalFee'>,
>(
  course: T,
): Omit<T, 'tuitionFee' | 'admissionFee' | 'totalFee'> & {
  tuitionFee: number;
  admissionFee: number | null;
  totalFee: number;
} {
  return {
    ...course,
    tuitionFee: Number(course.tuitionFee),
    admissionFee:
      course.admissionFee === null ? null : Number(course.admissionFee),
    totalFee: Number(course.totalFee),
  };
}

function toJsonInput(value: unknown): Prisma.InputJsonValue | undefined {
  return value === undefined
    ? undefined
    : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);
}

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { college: { include: { university: true } } },
    });
    if (!course || !course.isActive) {
      throw new NotFoundException('Course not found');
    }
    return serializeCourseFees(course);
  }

  async findRelated(courseId: string, limit = 8) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course || !course.isActive) return [];

    const includeCollege = {
      college: { include: { university: true } },
    } as const;

    const sameCategory = await this.prisma.course.findMany({
      where: {
        id: { not: courseId },
        category: course.category,
        isActive: true,
      },
      include: includeCollege,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    if (sameCategory.length >= limit) {
      return sameCategory.map(serializeCourseFees);
    }

    const excludeIds = [courseId, ...sameCategory.map((c) => c.id)];
    const sameDegree = await this.prisma.course.findMany({
      where: {
        id: { notIn: excludeIds },
        degreeLevel: course.degreeLevel,
        isActive: true,
      },
      include: includeCollege,
      orderBy: { createdAt: 'desc' },
      take: limit - sameCategory.length,
    });

    return [...sameCategory, ...sameDegree].map(serializeCourseFees);
  }

  // Admin catalog listing — courses joined with their college + university
  // (so the admin table can show "which college" without a second round
  // trip), unfiltered by isActive unless the caller opts out via
  // includeInactive, so a soft-deleted course can still be found/reactivated.
  async findAllForAdmin(query: QueryCoursesAdminDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = paginate(page, limit);

    const where: Prisma.CourseWhereInput = {
      ...(!query.includeInactive && { isActive: true }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
      ...(query.collegeId && { collegeId: query.collegeId }),
      ...(query.category && { category: query.category }),
      ...(query.degreeLevel && { degreeLevel: query.degreeLevel }),
    };

    const [courses, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        include: { college: { include: { university: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.course.count({ where }),
    ]);

    return buildPaginatedResponse(
      courses.map(serializeCourseFees),
      total,
      page,
      limit,
    );
  }

  private async uniqueSlug(
    collegeId: string,
    name: string,
    excludeId?: string,
  ) {
    const base = slugify(name) || 'course';
    let slug = base;
    let suffix = 1;
    while (
      await this.prisma.course.findFirst({
        where: {
          collegeId,
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      })
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  async create(dto: CreateCourseDto, actorUserId: string) {
    const college = await this.prisma.college.findUnique({
      where: { id: dto.collegeId },
    });
    if (!college) throw new NotFoundException('College not found');

    const slug = await this.uniqueSlug(dto.collegeId, dto.name);
    const course = await this.prisma.course.create({
      data: {
        ...dto,
        slug,
        careerOutcomes: toJsonInput(dto.careerOutcomes),
        curriculum: toJsonInput(dto.curriculum),
        feeBreakdown: toJsonInput(dto.feeBreakdown),
      },
    });
    await this.audit.log(actorUserId, AuditAction.MARKETPLACE_COURSE_CREATED, {
      courseId: course.id,
      collegeId: course.collegeId,
      name: course.name,
    });
    return serializeCourseFees(course);
  }

  async update(id: string, dto: UpdateCourseDto, actorUserId: string) {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Course not found');

    const slug =
      dto.name && dto.name !== existing.name
        ? await this.uniqueSlug(
            dto.collegeId ?? existing.collegeId,
            dto.name,
            id,
          )
        : undefined;

    const course = await this.prisma.course.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
        careerOutcomes: toJsonInput(dto.careerOutcomes),
        curriculum: toJsonInput(dto.curriculum),
        feeBreakdown: toJsonInput(dto.feeBreakdown),
      },
    });
    await this.audit.log(actorUserId, AuditAction.MARKETPLACE_COURSE_UPDATED, {
      courseId: id,
    });
    return serializeCourseFees(course);
  }

  async remove(id: string, actorUserId: string) {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Course not found');

    // Soft-delete only — StudyInformation.courseId may reference this row for
    // historical applications, so it must never be hard-deleted.
    await this.prisma.course.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log(actorUserId, AuditAction.MARKETPLACE_COURSE_DELETED, {
      courseId: id,
    });
    return { message: 'Course deactivated' };
  }
}
