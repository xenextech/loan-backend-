import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { serializeDecimals } from '../../common/utils/serialize-decimals.util';
import { CreateEnrollmentCertificateDto } from './dto/create-enrollment-certificate.dto';
import { UpdateEnrollmentCertificateDto } from './dto/update-enrollment-certificate.dto';

const LINKED_APPLICATION_SELECT = {
  id: true,
  applicationNumber: true,
  userId: true,
  initiatorUserId: true,
  supporterUserId: true,
  checkerUserId: true,
  approverUserId: true,
} as const;

@Injectable()
export class EnrollmentCertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateEnrollmentCertificateDto, email: string) {
    const { applicationId, college, document, student, certifications, qr } =
      dto;

    const application = applicationId
      ? await this.prisma.loanApplication.findUnique({
          where: { id: applicationId },
          select: LINKED_APPLICATION_SELECT,
        })
      : null;
    if (applicationId && !application) {
      throw new NotFoundException('Linked application not found');
    }

    const record = await this.prisma.enrollmentCertificate.create({
      select: {
        id: true,
        applicationId: true,
        refNo: true,
        collegeName: true,
        studentFullName: true,
        programName: true,
        issuedDateAD: true,
        issuedDateBS: true,
        isEnrolled: true,
        qrToken: true,
        createdAt: true,
        updatedAt: true,
      },
      data: {
        createdByEmail: email,
        applicationId: application?.id,
        // College
        collegeName: college.collegeName,
        collegeCode: college.collegeCode,
        collegeAddress: college.collegeAddress,
        collegeRegNo: college.collegeRegNo,
        collegeAffiliation: college.collegeAffiliation,
        collegePhone: college.collegePhone,
        collegeEmail: college.collegeEmail,
        collegeWebsite: college.collegeWebsite,
        logoUrl: college.logoUrl,
        // Document
        refNo: document.refNo,
        issuedDateAD: document.issuedDateAD,
        issuedDateBS: document.issuedDateBS,
        // Student
        studentFullName: student.studentFullName,
        tuRollNo: student.tuRollNo,
        enrollmentNo: student.enrollmentNo,
        programName: student.programName,
        currentYear: student.currentYear,
        currentSemester: student.currentSemester,
        academicYearBS: student.academicYearBS,
        studentStatus: student.studentStatus,
        // Certifications
        isEnrolled: certifications.isEnrolled,
        hasBacklogs: certifications.hasBacklogs,
        disciplinaryHold: certifications.disciplinaryHold,
        feeDueRs: certifications.feeDueRs ?? 0,
        // QR
        qrToken: qr?.qrToken,
        qrVerifyUrl: qr?.qrVerifyUrl,
      },
    });

    if (application) {
      try {
        await this.notifications.notifyCollegeDocumentGenerated({
          application,
          documentLabel: 'Enrollment Certificate',
          collegeName: college.collegeName,
        });
      } catch {
        // Notification failures must never fail document generation.
      }
    }

    return record;
  }

  async findAll(email: string) {
    return this.prisma.enrollmentCertificate.findMany({
      where: { createdByEmail: email },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        refNo: true,
        collegeName: true,
        collegeCode: true,
        studentFullName: true,
        tuRollNo: true,
        programName: true,
        issuedDateAD: true,
        issuedDateBS: true,
        isEnrolled: true,
        qrToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, email: string) {
    const record = await this.prisma.enrollmentCertificate.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException('Enrollment certificate not found');
    if (record.createdByEmail !== email) throw new ForbiddenException();
    return serializeDecimals(record);
  }

  async update(id: string, dto: UpdateEnrollmentCertificateDto, email: string) {
    await this.findOne(id, email);
    const { college, document, student, certifications, qr } = dto;

    return this.prisma.enrollmentCertificate.update({
      where: { id },
      data: {
        ...(college?.collegeName && { collegeName: college.collegeName }),
        ...(college?.collegeCode && { collegeCode: college.collegeCode }),
        ...(college?.collegeAddress && {
          collegeAddress: college.collegeAddress,
        }),
        ...(college?.collegeRegNo && { collegeRegNo: college.collegeRegNo }),
        ...(college?.collegeAffiliation && {
          collegeAffiliation: college.collegeAffiliation,
        }),
        ...(college?.collegePhone && { collegePhone: college.collegePhone }),
        ...(college?.collegeEmail && { collegeEmail: college.collegeEmail }),
        ...(college?.collegeWebsite && {
          collegeWebsite: college.collegeWebsite,
        }),
        ...(college?.logoUrl !== undefined && { logoUrl: college.logoUrl }),
        ...(document?.refNo && { refNo: document.refNo }),
        ...(document?.issuedDateAD && { issuedDateAD: document.issuedDateAD }),
        ...(document?.issuedDateBS && { issuedDateBS: document.issuedDateBS }),
        ...(student?.studentFullName && {
          studentFullName: student.studentFullName,
        }),
        ...(student?.tuRollNo && { tuRollNo: student.tuRollNo }),
        ...(student?.enrollmentNo && { enrollmentNo: student.enrollmentNo }),
        ...(student?.programName && { programName: student.programName }),
        ...(student?.currentYear && { currentYear: student.currentYear }),
        ...(student?.currentSemester && {
          currentSemester: student.currentSemester,
        }),
        ...(student?.academicYearBS && {
          academicYearBS: student.academicYearBS,
        }),
        ...(student?.studentStatus && { studentStatus: student.studentStatus }),
        ...(certifications?.isEnrolled !== undefined && {
          isEnrolled: certifications.isEnrolled,
        }),
        ...(certifications?.hasBacklogs !== undefined && {
          hasBacklogs: certifications.hasBacklogs,
        }),
        ...(certifications?.disciplinaryHold !== undefined && {
          disciplinaryHold: certifications.disciplinaryHold,
        }),
        ...(certifications?.feeDueRs !== undefined && {
          feeDueRs: certifications.feeDueRs,
        }),
        ...(qr?.qrToken !== undefined && { qrToken: qr.qrToken }),
        ...(qr?.qrVerifyUrl !== undefined && { qrVerifyUrl: qr.qrVerifyUrl }),
      },
    });
  }

  async remove(id: string, email: string) {
    await this.findOne(id, email);
    await this.prisma.enrollmentCertificate.delete({ where: { id } });
    return { deleted: true };
  }
}
