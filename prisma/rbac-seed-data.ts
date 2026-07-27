import { PrismaClient, UserRole } from '@prisma/client';

// ─── Roles — one row per UserRole enum value, code kept identical so
// PermissionsGuard/PermissionsService can resolve a JWT's role straight to
// its configuration row (`Role.code === UserRole` value). ─────────────────
const ROLES: { code: UserRole; name: string; description: string }[] = [
  { code: UserRole.ADMIN, name: 'Administrator', description: 'Full platform control, including Role & Permission Management.' },
  { code: UserRole.STUDENT, name: 'Student', description: 'Applies for and tracks their own education loan.' },
  { code: UserRole.PARENT, name: 'Parent', description: "Verifies a student's application as guarantor/co-applicant." },
  { code: UserRole.COLLEGE, name: 'College', description: "Verifies a student's enrollment and issues offer/enrollment documents." },
  { code: UserRole.INITIATOR, name: 'Initiator', description: 'First-line loan officer who creates and prepares applications.' },
  { code: UserRole.SUPPORTER, name: 'Supporter', description: 'Reviews applications in the approval chain.' },
  { code: UserRole.CHECKER, name: 'Checker', description: 'Reviews applications in the approval chain (deprecated in favor of Credit Manager).' },
  { code: UserRole.APPROVER, name: 'Approver', description: 'Gives final approval on a loan application.' },
  { code: UserRole.CREDIT_MANAGER, name: 'Credit Manager', description: 'Configures final loan terms, generates legal documents, manages repayment.' },
];

// ─── Permissions — module/action matrix from the RBAC brief's Permission
// Categories, key = "<module_slug>.<action>". ──────────────────────────────
const PERMISSION_MODULES: { module: string; actions: string[] }[] = [
  { module: 'dashboard', actions: ['view_dashboard', 'view_analytics', 'view_widgets'] },
  { module: 'applications', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'export'] },
  { module: 'documents', actions: ['view', 'generate', 'upload', 'download', 'delete'] },
  { module: 'repayment', actions: ['view', 'configure', 'edit', 'override'] },
  { module: 'emi_schedule', actions: ['view', 'generate', 'download'] },
  { module: 'student_tracker', actions: ['view'] },
  { module: 'document_vault', actions: ['view', 'upload', 'download'] },
  { module: 'notifications', actions: ['view', 'send', 'delete'] },
  { module: 'reports', actions: ['view', 'export'] },
  { module: 'user_management', actions: ['view', 'create', 'update', 'delete'] },
  { module: 'role_management', actions: ['view', 'create', 'update', 'delete'] },
];

function permKey(module: string, action: string) {
  return `${module}.${action}`;
}

// ─── Menu catalog — mirrors the existing hardcoded NAV_GROUPS shape exactly
// (href is role-relative, prepended by useDashboardBasePath() client-side)
// so every current staff sidebar item maps 1:1 onto a MenuItem row. ───────
const MENU_ITEMS: {
  key: string;
  label: string;
  href: string;
  icon: string;
  groupLabel: string | null;
  order: number;
  isApiGuarded?: boolean;
}[] = [
  { key: 'dashboard', label: 'Dashboard', href: '', icon: 'LayoutDashboard', groupLabel: 'Overview', order: 0 },
  { key: 'applications', label: 'Applications', href: '/applications', icon: 'FileText', groupLabel: 'Lending', order: 1 },
  { key: 'approval-workflow', label: 'Approval Work Flow', href: '/approval', icon: 'GitBranch', groupLabel: 'Lending', order: 2 },
  { key: 'disbursement', label: 'Disbursement', href: '/disbursment', icon: 'Wallet', groupLabel: 'Lending', order: 3 },
  { key: 'emi-schedule', label: 'EMI Schedule', href: '/emi-schedule', icon: 'Calendar', groupLabel: 'Repayment', order: 4 },
  { key: 'repayment-monitoring', label: 'Repayment Monitoring', href: '/repayment-monitoring', icon: 'Activity', groupLabel: 'Repayment', order: 5 },
  { key: 'notifications', label: 'Inbox', href: '/notification', icon: 'Inbox', groupLabel: 'Repayment', order: 6 },
  { key: 'legal-documents', label: 'Legal Documents', href: '/legal-documents', icon: 'Scale', groupLabel: 'Document', order: 7 },
  { key: 'legal-document-vault', label: 'Legal Document Vault', href: '/legal-document-vault', icon: 'FileSignature', groupLabel: 'Document', order: 8 },
  { key: 'document-center', label: 'Document Center', href: '/document-center', icon: 'FolderOpen', groupLabel: 'Document', order: 9 },
  { key: 'document-vault', label: 'Document Vault', href: '/document-vault', icon: 'Archive', groupLabel: 'Document', order: 10, isApiGuarded: true },
  { key: 'insurance-checker', label: 'Insurance Checker', href: '/insurance-checker', icon: 'ShieldCheck', groupLabel: 'Document', order: 11 },
  { key: 'commission', label: 'Commission', href: '/commission', icon: 'Percent', groupLabel: 'Finance', order: 12 },
  { key: 'audit-ledger', label: 'Audit Ledger', href: '/audit-ledger', icon: 'History', groupLabel: 'Finance', order: 13 },
  { key: 'permissions', label: 'Role & Permission Management', href: '/permissions', icon: 'KeyRound', groupLabel: 'Administration', order: 14 },
];

// Reproduces today's *actual* hardcoded NAV_GROUPS per role exactly, so
// seeding this table changes zero visible behavior until an Admin edits it.
const STAFF_BASE_MENU = [
  'dashboard',
  'applications',
  'approval-workflow',
  'disbursement',
  'emi-schedule',
  'notifications',
  'document-center',
  'insurance-checker',
  'commission',
  'audit-ledger',
];
const ROLE_MENU_KEYS: Partial<Record<UserRole, string[]>> = {
  [UserRole.INITIATOR]: [...STAFF_BASE_MENU, 'legal-document-vault'],
  [UserRole.SUPPORTER]: [...STAFF_BASE_MENU, 'legal-document-vault'],
  [UserRole.CHECKER]: STAFF_BASE_MENU,
  [UserRole.APPROVER]: [...STAFF_BASE_MENU, 'legal-document-vault'],
  [UserRole.CREDIT_MANAGER]: [...STAFF_BASE_MENU, 'repayment-monitoring', 'legal-documents'],
  [UserRole.ADMIN]: ['dashboard', 'applications', 'permissions'],
  // STUDENT / PARENT / COLLEGE keep their own separate, unrelated sidebars —
  // intentionally left unconfigured (no rows) rather than force-fit into
  // this staff-oriented menu catalog.
};

// ─── Default permission grants — sensible starting point approximating
// current de-facto capability per role; genuinely new (no prior enforced
// equivalent existed), so these are Admin-adjustable defaults, not a
// behavior contract to preserve byte-for-byte like the menu mirror above. ──
const ROLE_PERMISSION_KEYS: Partial<Record<UserRole, string[]>> = {
  [UserRole.ADMIN]: PERMISSION_MODULES.flatMap((m) => m.actions.map((a) => permKey(m.module, a))),
  [UserRole.INITIATOR]: [
    'dashboard.view_dashboard',
    'applications.create', 'applications.read', 'applications.update', 'applications.export',
    'documents.view', 'documents.upload',
    'document_vault.view', 'document_vault.upload',
    'notifications.view',
  ],
  [UserRole.SUPPORTER]: [
    'dashboard.view_dashboard',
    'applications.read', 'applications.export',
    'documents.view',
    'document_vault.view',
    'notifications.view',
  ],
  [UserRole.CHECKER]: [
    'dashboard.view_dashboard',
    'applications.read', 'applications.export',
    'documents.view',
    'document_vault.view',
    'notifications.view',
  ],
  [UserRole.APPROVER]: [
    'dashboard.view_dashboard',
    'applications.read', 'applications.approve', 'applications.reject', 'applications.export',
    'documents.view',
    'document_vault.view',
    'notifications.view',
  ],
  [UserRole.CREDIT_MANAGER]: [
    'dashboard.view_dashboard', 'dashboard.view_analytics', 'dashboard.view_widgets',
    'applications.read', 'applications.export',
    'documents.view', 'documents.generate',
    'repayment.view', 'repayment.configure', 'repayment.edit', 'repayment.override',
    'emi_schedule.view', 'emi_schedule.generate', 'emi_schedule.download',
    'document_vault.view',
    'notifications.view', 'notifications.send',
    'reports.view', 'reports.export',
  ],
};

// ─── Dashboard widgets — new configuration surface; no enforcement wired
// into dashboard pages yet (out of this task's scope), all visible by
// default so nothing regresses. ─────────────────────────────────────────
const WIDGETS = [
  { key: 'loan_statistics', label: 'Loan Statistics', description: 'Summary counts of applications by stage.' },
  { key: 'emi_summary', label: 'EMI Summary', description: 'Upcoming and overdue EMI counts.' },
  { key: 'repayment_chart', label: 'Repayment Chart', description: 'Collections trend over time.' },
  { key: 'notifications_widget', label: 'Notifications', description: 'Recent notification feed.' },
  { key: 'disbursement_summary', label: 'Disbursement Summary', description: 'Pending and completed disbursement counts.' },
];

export async function seedRbac(prisma: PrismaClient) {
  // Roles
  const roleByCode = new Map<string, { id: string }>();
  for (const r of ROLES) {
    const row = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: { code: r.code, name: r.name, description: r.description, isSystem: true },
    });
    roleByCode.set(r.code, row);
  }

  // Permissions
  const permissionByKey = new Map<string, { id: string }>();
  for (const m of PERMISSION_MODULES) {
    for (const action of m.actions) {
      const key = permKey(m.module, action);
      const row = await prisma.permission.upsert({
        where: { key },
        update: { module: m.module, action },
        create: { key, module: m.module, action },
      });
      permissionByKey.set(key, row);
    }
  }

  // Menu items
  const menuItemByKey = new Map<string, { id: string }>();
  for (const item of MENU_ITEMS) {
    const row = await prisma.menuItem.upsert({
      where: { key: item.key },
      update: {
        label: item.label,
        href: item.href,
        icon: item.icon,
        groupLabel: item.groupLabel,
        order: item.order,
        isApiGuarded: item.isApiGuarded ?? false,
      },
      create: {
        key: item.key,
        label: item.label,
        href: item.href,
        icon: item.icon,
        groupLabel: item.groupLabel,
        order: item.order,
        isApiGuarded: item.isApiGuarded ?? false,
      },
    });
    menuItemByKey.set(item.key, row);
  }

  // Widgets
  const widgetByKey = new Map<string, { id: string }>();
  for (const w of WIDGETS) {
    const row = await prisma.dashboardWidget.upsert({
      where: { key: w.key },
      update: { label: w.label, description: w.description },
      create: { key: w.key, label: w.label, description: w.description },
    });
    widgetByKey.set(w.key, row);
  }

  // Role ↔ Menu (explicit visible=true rows for every currently-visible
  // item — see PermissionsGuard's fail-open-on-no-row semantics)
  for (const [code, keys] of Object.entries(ROLE_MENU_KEYS)) {
    const role = roleByCode.get(code);
    if (!role || !keys) continue;
    for (const key of keys) {
      const menuItem = menuItemByKey.get(key);
      if (!menuItem) continue;
      await prisma.roleMenuItem.upsert({
        where: { roleId_menuItemId: { roleId: role.id, menuItemId: menuItem.id } },
        update: { visible: true },
        create: { roleId: role.id, menuItemId: menuItem.id, visible: true },
      });
    }
  }

  // Role ↔ Permission
  for (const [code, keys] of Object.entries(ROLE_PERMISSION_KEYS)) {
    const role = roleByCode.get(code);
    if (!role || !keys) continue;
    for (const key of keys) {
      const permission = permissionByKey.get(key);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  // Role ↔ Widgets — every staff role gets every widget visible by default
  const staffRoleCodes = [
    UserRole.ADMIN,
    UserRole.INITIATOR,
    UserRole.SUPPORTER,
    UserRole.CHECKER,
    UserRole.APPROVER,
    UserRole.CREDIT_MANAGER,
  ];
  for (const code of staffRoleCodes) {
    const role = roleByCode.get(code);
    if (!role) continue;
    for (const w of WIDGETS) {
      const widget = widgetByKey.get(w.key)!;
      await prisma.roleWidget.upsert({
        where: { roleId_widgetId: { roleId: role.id, widgetId: widget.id } },
        update: { visible: true },
        create: { roleId: role.id, widgetId: widget.id, visible: true },
      });
    }
  }

  console.log(
    `RBAC seed: ${ROLES.length} roles, ${permissionByKey.size} permissions, ${MENU_ITEMS.length} menu items, ${WIDGETS.length} widgets.`,
  );
}
