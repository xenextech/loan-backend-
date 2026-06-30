import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

@Injectable()
export class AgreementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAgreementDto, email: string) {
    const { college, document, student, certifications, qr } = dto;

    return this.prisma.agreement.create({
      select: {
        id: true,
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
        // College
        collegeName:        college.collegeName,
        collegeAddress:     college.collegeAddress,
        collegeRegNo:       college.collegeRegNo,
        collegeAffiliation: college.collegeAffiliation,
        collegePhone:       college.collegePhone,
        collegeEmail:       college.collegeEmail,
        collegeWebsite:     college.collegeWebsite,
        logoUrl:            college.logoUrl,
        // Document
        refNo:        document.refNo,
        issuedDateAD: document.issuedDateAD,
        issuedDateBS: document.issuedDateBS,
        // Student
        studentFullName: student.studentFullName,
        tuRollNo:        student.tuRollNo,
        enrollmentNo:    student.enrollmentNo,
        programName:     student.programName,
        currentYear:     student.currentYear,
        currentSemester: student.currentSemester,
        academicYearBS:  student.academicYearBS,
        studentStatus:   student.studentStatus,
        // Certifications
        isEnrolled:       certifications.isEnrolled,
        hasBacklogs:      certifications.hasBacklogs,
        disciplinaryHold: certifications.disciplinaryHold,
        feeDueRs:         certifications.feeDueRs ?? 0,
        // QR
        qrToken:     qr?.qrToken,
        qrVerifyUrl: qr?.qrVerifyUrl,
      },
    });
  }

  async findAll(email: string) {
    return this.prisma.agreement.findMany({
      where: { createdByEmail: email },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
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
    });
  }

  async findOne(id: string, email: string) {
    const record = await this.prisma.agreement.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Agreement not found');
    if (record.createdByEmail !== email) throw new ForbiddenException();
    return record;
  }

  async update(id: string, dto: UpdateAgreementDto, email: string) {
    await this.findOne(id, email);
    const { college, document, student, certifications, qr } = dto;

    return this.prisma.agreement.update({
      where: { id },
      data: {
        ...(college?.collegeName        && { collegeName:        college.collegeName }),
        ...(college?.collegeAddress     && { collegeAddress:     college.collegeAddress }),
        ...(college?.collegeRegNo       && { collegeRegNo:       college.collegeRegNo }),
        ...(college?.collegeAffiliation && { collegeAffiliation: college.collegeAffiliation }),
        ...(college?.collegePhone       && { collegePhone:       college.collegePhone }),
        ...(college?.collegeEmail       && { collegeEmail:       college.collegeEmail }),
        ...(college?.collegeWebsite     && { collegeWebsite:     college.collegeWebsite }),
        ...(college?.logoUrl            !== undefined && { logoUrl: college.logoUrl }),
        ...(document?.refNo        && { refNo:        document.refNo }),
        ...(document?.issuedDateAD && { issuedDateAD: document.issuedDateAD }),
        ...(document?.issuedDateBS && { issuedDateBS: document.issuedDateBS }),
        ...(student?.studentFullName  && { studentFullName:  student.studentFullName }),
        ...(student?.tuRollNo         && { tuRollNo:         student.tuRollNo }),
        ...(student?.enrollmentNo     && { enrollmentNo:     student.enrollmentNo }),
        ...(student?.programName      && { programName:      student.programName }),
        ...(student?.currentYear      && { currentYear:      student.currentYear }),
        ...(student?.currentSemester  && { currentSemester:  student.currentSemester }),
        ...(student?.academicYearBS   && { academicYearBS:   student.academicYearBS }),
        ...(student?.studentStatus    && { studentStatus:    student.studentStatus }),
        ...(certifications?.isEnrolled       !== undefined && { isEnrolled:       certifications.isEnrolled }),
        ...(certifications?.hasBacklogs      !== undefined && { hasBacklogs:      certifications.hasBacklogs }),
        ...(certifications?.disciplinaryHold !== undefined && { disciplinaryHold: certifications.disciplinaryHold }),
        ...(certifications?.feeDueRs         !== undefined && { feeDueRs:         certifications.feeDueRs }),
        ...(qr?.qrToken     !== undefined && { qrToken:     qr.qrToken }),
        ...(qr?.qrVerifyUrl !== undefined && { qrVerifyUrl: qr.qrVerifyUrl }),
      },
    });
  }

  async remove(id: string, email: string) {
    await this.findOne(id, email);
    await this.prisma.agreement.delete({ where: { id } });
    return { deleted: true };
  }
}
