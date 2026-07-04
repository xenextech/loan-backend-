import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfferLetterDto } from './dto/create-offer-letter.dto';
import { UpdateOfferLetterDto } from './dto/update-offer-letter.dto';

@Injectable()
export class OfferLetterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOfferLetterDto, email: string) {
    const {
      college,
      document,
      student,
      program,
      fees,
      conditions,
      signatories,
      qr,
    } = dto;

    return this.prisma.offerLetter.create({
      select: {
        id: true,
        refNo: true,
        collegeName: true,
        studentFullName: true,
        programName: true,
        issuedDateAD: true,
        issuedDateBS: true,
        qrToken: true,
        createdAt: true,
        updatedAt: true,
      },
      data: {
        createdByEmail: email,
        // College
        collegeName: college.collegeName,
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
        validUntilAD: document.validUntilAD,
        validUntilBS: document.validUntilBS,
        // Student
        studentFullName: student.studentFullName,
        studentDobAD: student.studentDobAD,
        studentDobBS: student.studentDobBS,
        citizenshipNumber: student.citizenshipNumber,
        fatherName: student.fatherName,
        motherName: student.motherName,
        permanentAddress: student.permanentAddress,
        district: student.district,
        province: student.province,
        // Program
        programName: program?.programName,
        programFullName: program?.programFullName,
        programAffiliation: program?.programAffiliation,
        durationYears: program?.durationYears,
        totalSemesters: program?.totalSemesters,
        creditHours: program?.creditHours,
        academicYearBS: program?.academicYearBS,
        intakeMonthBS: program?.intakeMonthBS,
        // Fees
        admissionFee: fees?.admissionFee,
        tuitionPerSem: fees?.tuitionPerSem,
        examFeePerSem: fees?.examFeePerSem,
        labFeePerSem: fees?.labFeePerSem,
        totalApprox: fees?.totalApprox,
        // JSON arrays
        conditions: conditions ?? [],
        signatories: (signatories ?? []) as unknown as Prisma.InputJsonValue,
        // QR
        qrToken: qr?.qrToken,
        qrVerifyUrl: qr?.qrVerifyUrl,
      },
    });
  }

  async findAll(email: string) {
    return this.prisma.offerLetter.findMany({
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
        qrToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, email: string) {
    const record = await this.prisma.offerLetter.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Offer letter not found');
    if (record.createdByEmail !== email) throw new ForbiddenException();
    return record;
  }

  async update(id: string, dto: UpdateOfferLetterDto, email: string) {
    await this.findOne(id, email);
    const {
      college,
      document,
      student,
      program,
      fees,
      conditions,
      signatories,
      qr,
    } = dto;

    return this.prisma.offerLetter.update({
      where: { id },
      data: {
        // College
        ...(college?.collegeName && { collegeName: college.collegeName }),
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
        // Document
        ...(document?.refNo && { refNo: document.refNo }),
        ...(document?.issuedDateAD && { issuedDateAD: document.issuedDateAD }),
        ...(document?.issuedDateBS && { issuedDateBS: document.issuedDateBS }),
        ...(document?.validUntilAD && { validUntilAD: document.validUntilAD }),
        ...(document?.validUntilBS && { validUntilBS: document.validUntilBS }),
        // Student
        ...(student?.studentFullName && {
          studentFullName: student.studentFullName,
        }),
        ...(student?.studentDobAD && { studentDobAD: student.studentDobAD }),
        ...(student?.studentDobBS && { studentDobBS: student.studentDobBS }),
        ...(student?.citizenshipNumber && {
          citizenshipNumber: student.citizenshipNumber,
        }),
        ...(student?.fatherName && { fatherName: student.fatherName }),
        ...(student?.motherName && { motherName: student.motherName }),
        ...(student?.permanentAddress && {
          permanentAddress: student.permanentAddress,
        }),
        ...(student?.district && { district: student.district }),
        ...(student?.province && { province: student.province }),
        // Program
        ...(program?.programName && { programName: program.programName }),
        ...(program?.programFullName && {
          programFullName: program.programFullName,
        }),
        ...(program?.programAffiliation && {
          programAffiliation: program.programAffiliation,
        }),
        ...(program?.durationYears && { durationYears: program.durationYears }),
        ...(program?.totalSemesters && {
          totalSemesters: program.totalSemesters,
        }),
        ...(program?.creditHours && { creditHours: program.creditHours }),
        ...(program?.academicYearBS && {
          academicYearBS: program.academicYearBS,
        }),
        ...(program?.intakeMonthBS && { intakeMonthBS: program.intakeMonthBS }),
        // Fees
        ...(fees?.admissionFee !== undefined && {
          admissionFee: fees.admissionFee,
        }),
        ...(fees?.tuitionPerSem !== undefined && {
          tuitionPerSem: fees.tuitionPerSem,
        }),
        ...(fees?.examFeePerSem !== undefined && {
          examFeePerSem: fees.examFeePerSem,
        }),
        ...(fees?.labFeePerSem !== undefined && {
          labFeePerSem: fees.labFeePerSem,
        }),
        ...(fees?.totalApprox !== undefined && {
          totalApprox: fees.totalApprox,
        }),
        // JSON arrays
        ...(conditions !== undefined && {
          conditions: conditions,
        }),
        ...(signatories !== undefined && {
          signatories: signatories as unknown as Prisma.InputJsonValue,
        }),
        // QR
        ...(qr?.qrToken !== undefined && { qrToken: qr.qrToken }),
        ...(qr?.qrVerifyUrl !== undefined && { qrVerifyUrl: qr.qrVerifyUrl }),
      },
    });
  }

  async remove(id: string, email: string) {
    await this.findOne(id, email);
    await this.prisma.offerLetter.delete({ where: { id } });
    return { deleted: true };
  }
}
