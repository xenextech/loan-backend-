-- Who confirmed clearance via the explicit complete-clearance action.
ALTER TABLE "loan_accounts" ADD COLUMN "clearedByUserId" TEXT;

-- Which role the Credit Manager assigned a Needs-Review loan to.
ALTER TABLE "loan_accounts" ADD COLUMN "reviewAssignedRole" "UserRole";
