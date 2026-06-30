/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CREDIT_FACILITY_SIZE_ABOVE2POINT5M_POINT,
  CREDIT_FACILITY_SIZE_ABOVE2POINT5M_WEIGHT,
  CREDIT_FACILITY_SIZE_BELOW1M_POINT,
  CREDIT_FACILITY_SIZE_BELOW1M_WEIGHT,
  CREDIT_FACILITY_SIZE_FROM1M_TO2POINT5M_POINT,
  CREDIT_FACILITY_SIZE_FROM1M_TO2POINT5M_WEIGHT,
  DSGIR_ABOVE45_POINT,
  DSGIR_ABOVE45_WEIGHT,
  DSGIR_BELOW40_POINT,
  DSGIR_BELOW40_WEIGHT,
  DSGIR_FROM40_TO45_POINT,
  DSGIR_FROM40_TO45_WEIGHT,
  OPERATION_OF_INSTITUTION_ABOVE10YEARS_POINT,
  OPERATION_OF_INSTITUTION_ABOVE10YEARS_WEIGHT,
  OPERATION_OF_INSTITUTION_BELOW5YEARS_POINT,
  OPERATION_OF_INSTITUTION_BELOW5YEARS_WEIGHT,
  OPERATION_OF_INSTITUTION_FROM5_TO10YEARS_POINT,
  OPERATION_OF_INSTITUTION_FROM5_TO10YEARS_WEIGHT,
  PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFI_POINT,
  PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFI_WEIGHT,
  PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFIS_POINT,
  PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFIS_WEIGHT,
  PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_US_POINT,
  PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_US_WEIGHT,
  SATISFACTORY_PERFORMANCE_ABOVE3YRS_POINT,
  SATISFACTORY_PERFORMANCE_ABOVE3YRS_WEIGHT,
  SATISFACTORY_PERFORMANCE_BELOW1YR_POINT,
  SATISFACTORY_PERFORMANCE_BELOW1YR_WEIGHT,
  SATISFACTORY_PERFORMANCE_FROM1_TO3YRS_POINT,
  SATISFACTORY_PERFORMANCE_FROM1_TO3YRS_WEIGHT,
  SOURCE_OF_INCOME_FIXED_INCOME_POINT,
  SOURCE_OF_INCOME_FIXED_INCOME_WEIGHT,
  SOURCE_OF_INCOME_MIXED_INCOME_POINT,
  SOURCE_OF_INCOME_MIXED_INCOME_WEIGHT,
  SOURCE_OF_INCOME_SALARY_RENT_BUSINESS_POINT,
  SOURCE_OF_INCOME_SALARY_RENT_BUSINESS_WEIGHT,
} from 'src/common/enums';
import { CreditParameters } from '../dto/credit-score.dto';

export const CREDIT_PARAMETERS: CreditParameters = {
  creditFacilitySize: {
    below1M: {
      weight: CREDIT_FACILITY_SIZE_BELOW1M_WEIGHT,
      point: CREDIT_FACILITY_SIZE_BELOW1M_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    from1MTo2point5M: {
      weight: CREDIT_FACILITY_SIZE_FROM1M_TO2POINT5M_WEIGHT,
      point: CREDIT_FACILITY_SIZE_FROM1M_TO2POINT5M_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    above2point5M: {
      weight: CREDIT_FACILITY_SIZE_ABOVE2POINT5M_WEIGHT,
      point: CREDIT_FACILITY_SIZE_ABOVE2POINT5M_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
  },

  dsgir: {
    below40: {
      weight: DSGIR_BELOW40_WEIGHT,
      point: DSGIR_BELOW40_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    from40To45: {
      weight: DSGIR_FROM40_TO45_WEIGHT,
      point: DSGIR_FROM40_TO45_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    above45: {
      weight: DSGIR_ABOVE45_WEIGHT,
      point: DSGIR_ABOVE45_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
  },

  operationOfInstitution: {
    above10Years: {
      weight: OPERATION_OF_INSTITUTION_ABOVE10YEARS_WEIGHT,
      point: OPERATION_OF_INSTITUTION_ABOVE10YEARS_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    from5To10Years: {
      weight: OPERATION_OF_INSTITUTION_FROM5_TO10YEARS_WEIGHT,
      point: OPERATION_OF_INSTITUTION_FROM5_TO10YEARS_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    below5Years: {
      weight: OPERATION_OF_INSTITUTION_BELOW5YEARS_WEIGHT,
      point: OPERATION_OF_INSTITUTION_BELOW5YEARS_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
  },

  satisfactoryPerformance: {
    above3yrs: {
      weight: SATISFACTORY_PERFORMANCE_ABOVE3YRS_WEIGHT,
      point: SATISFACTORY_PERFORMANCE_ABOVE3YRS_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    from1To3yrs: {
      weight: SATISFACTORY_PERFORMANCE_FROM1_TO3YRS_WEIGHT,
      point: SATISFACTORY_PERFORMANCE_FROM1_TO3YRS_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    below1yr: {
      weight: SATISFACTORY_PERFORMANCE_BELOW1YR_WEIGHT,
      point: SATISFACTORY_PERFORMANCE_BELOW1YR_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
  },

  parentsBorrowingsWithBFIs: {
    borrowingFromUs: {
      weight: PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_US_WEIGHT,
      point: PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_US_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    borrowingFromOtherBFI: {
      weight: PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFI_WEIGHT,
      point: PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFI_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    borrowingFromOtherBFIs: {
      weight: PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFIS_WEIGHT,
      point: PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFIS_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
  },

  sourceOfIncome: {
    fixedIncome: {
      weight: SOURCE_OF_INCOME_FIXED_INCOME_WEIGHT,
      point: SOURCE_OF_INCOME_FIXED_INCOME_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    salaryRentBusiness: {
      weight: SOURCE_OF_INCOME_SALARY_RENT_BUSINESS_WEIGHT,
      point: SOURCE_OF_INCOME_SALARY_RENT_BUSINESS_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
    mixedIncome: {
      weight: SOURCE_OF_INCOME_MIXED_INCOME_WEIGHT,
      point: SOURCE_OF_INCOME_MIXED_INCOME_POINT,
      get weightScore() {
        return this.weight * this.point;
      },
    },
  },
};

export enum CreditGrade {
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  NA = 'NA',
}

export const LOW_RISK_THRESHOLD = 50;
export const MODERATE_RISK_THRESHOLD = 60;
export const MEDIUM_RISK_THRESHOLD = 70;
export const MEDIUM_HIGH_RISK_THRESHOLD = 80;
export const HIGH_RISK_THRESHOLD = 90;
export const VERY_HIGH_RISK_THRESHOLD = 95;
export const VERY_VERY_HIGH_RISK_THRESHOLD = 98;
export const EXTREMELY_HIGH_RISK_THRESHOLD = 100;

export enum RiskCategory {
  LOW = 'LOW_RISK',
  MODERATE = 'MODERATE_RISK',
  MEDIUM = 'MEDIUM_RISK',
  MEDIUM_HIGH = 'MEDIUM_HIGH_RISK',
  HIGH = 'HIGH_RISK',
  VERY_HIGH = 'VERY_HIGH_RISK',
  VERY_VERY_HIGH = 'VERY_VERY_HIGH_RISK',
  EXTREMELY_HIGH = 'EXTREMELY_HIGH_RISK',
}
