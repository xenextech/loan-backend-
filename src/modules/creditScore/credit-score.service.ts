/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreditParameters,
  CreditScoreResponseDto,
} from './dto/credit-score.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  RiskCategory,
  CreditGrade,
  LOW_RISK_THRESHOLD,
  MODERATE_RISK_THRESHOLD,
  MEDIUM_RISK_THRESHOLD,
  MEDIUM_HIGH_RISK_THRESHOLD,
  HIGH_RISK_THRESHOLD,
} from '../creditScore/constant/credit-parameters.constant';
import { CREDIT_PARAMETERS } from './constant/credit-parameters.constant';

@Injectable()
export class CreditScoreService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly creditParameters = CREDIT_PARAMETERS;

  calculate(request: {
    totalWeight: number;
    totalWeightScore: number;
  }): CreditScoreResponseDto {
    const percentage =
      request.totalWeight === 0
        ? 0
        : Number(
            ((request.totalWeightScore / request.totalWeight) * 100).toFixed(2),
          );

    return {
      overall: {
        score: request.totalWeightScore,
        weight: request.totalWeight,
        percentage,
        grade: this.getGrade(percentage),
        riskCategory: this.getRiskRating(percentage).riskCategory,
      },
    };
  }
  async calculateByApplicationId(
    applicationId: string,
  ): Promise<CreditScoreResponseDto> {
    const application: any = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }
    const selected: Array<string> = [
      'creditFacilitySize.below1M',
      'dsgir.from40To45',
      'operationOfInstitution.above10Years',
      'satisfactoryPerformance.from1To3yrs',
      'parentsBorrowingsWithBFIs.borrowingFromUs',
      'sourceOfIncome.mixedIncome',
    ];
    const request = this.buildScoreRequest(selected, this.creditParameters);

    return this.calculate(request);
  }

  /**
   * Convert your application data into CreditScoreRequest
   */
  //   private buildScoreRequest(
  //     application: Prisma.LoanApplicationGetPayload<{
  //       include: {
  //         user: true;
  //         studyInformation: true;
  //         loanInformation: true;
  //         documents: true;
  //       };
  //     }>,
  //   ): CreditScoreRequest {
  //     // const documents = application?.documents;
  //     // const hasCitizenship =
  //     //   documents?.some((d) => d.documentType === 'IDENTITY_FRONT') &&
  //     //   documents?.some((d) => d.documentType === 'IDENTITY_BACK');
  //     // const hasAcademicRecord = documents?.some(
  //     //   (d) => d.documentType === 'ACADEMIC_RECORD',
  //     // );
  //     // const hasFeeStructure = documents?.some(
  //     //   (d) => d.documentType === 'FEE_STRUCTURE',
  //     // );
  //     // const hasApplicantPhoto = documents?.some(
  //     //   (d) => d.documentType === 'APPLICANT_PHOTO',
  //     // );
  //     // const scoreLoanAmount = (salary: number) => {
  //     //   if (salary >= 100000) return 10;
  //     //   if (salary >= 50000) return 8;
  //     //   if (salary >= 30000) return 5;
  //     //   return 0;
  //     // };
  //     // const scoreExpectedSalary = (salary: number) => {
  //     //   if (salary >= 100000) return 10;
  //     //   if (salary >= 50000) return 8;
  //     //   if (salary >= 30000) return 5;
  //     //   return 0;
  //     // };
  //     // const scoreEducationType = (studyType: string | undefined | null) => {
  //     //   if (studyType === 'UG') return 10;
  //     //   if (studyType === 'PG') return 8;
  //     //   return 0;
  //     // };
  //     // const scoreEducationBoard = (studyBoard: string | null) => {
  //     //   if (studyBoard === 'UG') return 10;
  //     //   if (studyBoard === 'PG') return 8;
  //     //   return 0;
  //     // };
  //     // const scoreEducationDuration = (studyDuration: string | null) => {
  //     //   if (studyDuration === 'UG') return 10;
  //     //   if (studyDuration === 'PG') return 8;
  //     //   return 0;
  //     // };
  //     // const scoreGender = (gender: string | null) => {
  //     //   if (gender === 'MALE') return 10;
  //     //   if (gender === 'FEMALE') return 8;
  //     //   if (gender === 'OTHER') return 8;
  //     //   return 0;
  //     // };
  //     // const weightLoanAmount = (salary: number) => {
  //     //   if (salary >= 100000) return 10;
  //     //   if (salary >= 50000) return 8;
  //     //   if (salary >= 30000) return 5;
  //     //   return 0;
  //     // };
  //     // const weightExpectedSalary = (salary: number) => {
  //     //   if (salary >= 100000) return 10;
  //     //   if (salary >= 50000) return 8;
  //     //   if (salary >= 30000) return 5;
  //     //   return 0;
  //     // };
  //     // const weightEducationType = (studyType: string | undefined | null) => {
  //     //   if (studyType === 'UG') return 10;
  //     //   if (studyType === 'PG') return 8;
  //     //   return 0;
  //     // };
  //     // const weightEducationBoard = (studyBoard: string | null) => {
  //     //   if (studyBoard === 'UG') return 10;
  //     //   if (studyBoard === 'PG') return 8;
  //     //   return 0;
  //     // };
  //     // const weightEducationDuration = (studyDuration: string | null) => {
  //     //   if (studyDuration === 'UG') return 10;
  //     //   if (studyDuration === 'PG') return 8;
  //     //   return 0;
  //     // };
  //     // const weightGender = (gender: string | null) => {
  //     //   if (gender === 'MALE') return 10;
  //     //   if (gender === 'FEMALE') return 8;
  //     //   if (gender === 'OTHER') return 8;
  //     //   return 0;
  //     // };
  //     // return {
  //     //   student: {
  //     //     fullName: {
  //     //       value: application.fullName,
  //     //       score: application.fullName ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //     email: {
  //     //       value: application.email,
  //     //       score: application.email ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //     phoneNumber: {
  //     //       value: application.phoneNumber,
  //     //       score: application.phoneNumber ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //     citizenship: {
  //     //       value: hasCitizenship,
  //     //       score: hasCitizenship ? 10 : 0,
  //     //       weight: 10,
  //     //     },
  //     //     academicRecord: {
  //     //       value: hasAcademicRecord,
  //     //       score: hasAcademicRecord ? 10 : 0,
  //     //       weight: 10,
  //     //     },
  //     //     loanAmount: {
  //     //       value: application.loanInformation?.loanAmount,
  //     //       score: scoreLoanAmount(
  //     //         Number(application.loanInformation?.loanAmount ?? 0),
  //     //       ),
  //     //       weight: weightLoanAmount(
  //     //         Number(application.loanInformation?.loanAmount ?? 0),
  //     //       ),
  //     //     },
  //     //     expectedSalary: {
  //     //       value: application.loanInformation?.expectedSalary,
  //     //       score: scoreExpectedSalary(
  //     //         Number(application.loanInformation?.expectedSalary ?? 0),
  //     //       ),
  //     //       weight: weightExpectedSalary(
  //     //         Number(application.loanInformation?.expectedSalary ?? 0),
  //     //       ),
  //     //     },
  //     //     educationType: {
  //     //       value: application.studyInformation?.studyType,
  //     //       score: scoreEducationType(application?.studyInformation?.studyType),
  //     //       weight: weightEducationType(application?.studyInformation?.studyType),
  //     //     },
  //     //     educationBoard: {
  //     //       value: scoreEducationBoard(
  //     //         application.studyInformation?.boardUniversity || null,
  //     //       ),
  //     //       score: scoreEducationDuration(
  //     //         application.studyInformation?.boardUniversity || null,
  //     //       ),
  //     //       weight: weightEducationBoard(
  //     //         application.studyInformation?.boardUniversity || null,
  //     //       ),
  //     //     },
  //     //     educationDuration: {
  //     //       value: scoreEducationDuration(
  //     //         application.studyInformation?.courseDuration || null,
  //     //       ),
  //     //       score: scoreEducationDuration(
  //     //         application.studyInformation?.courseDuration || null,
  //     //       ),
  //     //       weight: weightEducationDuration(
  //     //         application.studyInformation?.courseDuration || null,
  //     //       ),
  //     //     },
  //     //     feeStructure: {
  //     //       value: hasFeeStructure,
  //     //       score: hasFeeStructure ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //     gender: {
  //     //       value: application.gender,
  //     //       score: scoreGender(application.gender),
  //     //       weight: weightGender(application.gender),
  //     //     },
  //     //     applicantPhoto: {
  //     //       value: hasApplicantPhoto,
  //     //       score: hasApplicantPhoto ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //   },
  //     //   parent: {
  //     //     fatherName: {
  //     //       value: application.fatherName,
  //     //       score: application.fatherName ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //     motherName: {
  //     //       value: application.motherName,
  //     //       score: application.motherName ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //     grandFatherName: {
  //     //       value: application.grandfatherName,
  //     //       score: application.grandfatherName ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //     spouseName: {
  //     //       value: application.spouseName,
  //     //       score: application.spouseName ? 5 : 0,
  //     //       weight: application.spouseName ? 5 : 0,
  //     //     },
  //     //   },
  //     //   college: {
  //     //     university: {
  //     //       value: application.studyInformation?.boardUniversity,
  //     //       score: application.studyInformation?.boardUniversity ? 10 : 0,
  //     //       weight: 10,
  //     //     },
  //     //     courseName: {
  //     //       value: application.studyInformation?.courseName,
  //     //       score: application.studyInformation?.courseName ? 10 : 0,
  //     //       weight: 10,
  //     //     },
  //     //     duration: {
  //     //       value: application.studyInformation?.courseDuration,
  //     //       score: application.studyInformation?.courseDuration ? 5 : 0,
  //     //       weight: 5,
  //     //     },
  //     //   },
  //     // };

  //   }

  private buildScoreRequest(
    selected: Array<string>,
    creditParameters: CreditParameters,
  ): {
    totalWeight: number;
    totalWeightScore: number;
  } {
    let totalWeight = 0;
    let totalWeightScore = 0;

    for (const item of selected) {
      const [category, option] = item.split('.');

      if (!category || !option) {
        throw new Error(`Invalid selection format: "${item}"`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parameter = creditParameters[category]?.[option];

      if (!parameter) {
        throw new Error(
          `Invalid selection "${option}" for category "${category}"`,
        );
      }

      totalWeightScore += parameter.weightScore;
    }
    const allKeys = Object.entries(creditParameters).flatMap(
      ([category, options]) =>
        Object.keys(options).map((option) => `${category}.${option}`),
    );

    for (const item of allKeys) {
      const [category, option] = item.split('.');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parameter = creditParameters[category]?.[option];

      if (!parameter) {
        throw new Error(`Invalid selection "${item}"`);
      }

      totalWeight += parameter.weight;
    }

    return {
      totalWeight,
      totalWeightScore,
    };
  }

  /**
   * NRB Grade
   */
  private getGrade(percentage: number): string {
    if (percentage <= LOW_RISK_THRESHOLD) return CreditGrade.A1;
    if (percentage <= MODERATE_RISK_THRESHOLD) return CreditGrade.A2;
    if (percentage <= MEDIUM_RISK_THRESHOLD) return CreditGrade.A3;
    if (percentage <= MEDIUM_HIGH_RISK_THRESHOLD) return CreditGrade.A4;

    return CreditGrade.B;
  }
  private getRiskRating(percentage: number): {
    riskCategory: string;
  } {
    if (percentage <= LOW_RISK_THRESHOLD) {
      return {
        riskCategory: RiskCategory.LOW,
      };
    }

    if (percentage <= MODERATE_RISK_THRESHOLD) {
      return {
        riskCategory: RiskCategory.MODERATE,
      };
    }

    if (percentage <= MEDIUM_RISK_THRESHOLD) {
      return {
        riskCategory: RiskCategory.MEDIUM,
      };
    }

    if (percentage <= MEDIUM_HIGH_RISK_THRESHOLD) {
      return {
        riskCategory: RiskCategory.MEDIUM_HIGH,
      };
    }
    if (percentage <= HIGH_RISK_THRESHOLD) {
      return {
        riskCategory: RiskCategory.HIGH,
      };
    }

    return {
      riskCategory: RiskCategory.HIGH,
    };
  }
}
