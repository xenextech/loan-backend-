import { UserRole } from '../../common/enums';

// Internal credit-ops staff who can access the dashboard module — students,
// parents, and colleges never see these screens.
export const DASHBOARD_STAFF_ROLES = [
  UserRole.ADMIN,
  UserRole.INITIATOR,
  UserRole.SUPPORTER,
  UserRole.CHECKER,
  UserRole.CREDIT_MANAGER,
  UserRole.APPROVER,
];
