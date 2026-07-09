-- Staff display name, used to populate approval-stage name fields below.
ALTER TABLE "users" ADD COLUMN "fullName" TEXT;

-- Who acted at each approval stage (set from the authenticated user; the
-- corresponding *Name/*Date columns already existed).
ALTER TABLE "loan_applications" ADD COLUMN "initiatorUserId" TEXT;
ALTER TABLE "loan_applications" ADD COLUMN "supporterUserId" TEXT;
ALTER TABLE "loan_applications" ADD COLUMN "checkerUserId" TEXT;
ALTER TABLE "loan_applications" ADD COLUMN "approverUserId" TEXT;
