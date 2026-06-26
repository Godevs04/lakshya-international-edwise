export interface ServerActionDoc {
  name: string;
  summary: string;
  description?: string;
  /** JSON-schema-style request body properties */
  requestProperties?: Record<string, unknown>;
  required?: string[];
}

export interface ServerActionGroup {
  module: string;
  tag: string;
  actions: ServerActionDoc[];
}

export const SERVER_ACTION_NOTE =
  "Next.js Server Action invoked from the dashboard UI (RPC). Requires an authenticated session cookie unless noted as public.";

export const SERVER_ACTION_GROUPS: ServerActionGroup[] = [
  {
    module: "auth",
    tag: "Server Actions — Auth",
    actions: [
      { name: "registerAction", summary: "Register a new user account", requestProperties: { formData: { type: "object", description: "Registration FormData fields" } } },
      { name: "verifyOtpAction", summary: "Verify email OTP after registration", requestProperties: { email: { type: "string", format: "email" }, otp: { type: "string" } }, required: ["email", "otp"] },
      { name: "resendOtpAction", summary: "Resend registration OTP", requestProperties: { email: { type: "string", format: "email" } }, required: ["email"] },
      { name: "validateLoginAction", summary: "Validate credentials before sign-in", requestProperties: { email: { type: "string" }, password: { type: "string" } }, required: ["email", "password"] },
      { name: "forgotPasswordAction", summary: "Request password reset email", requestProperties: { email: { type: "string", format: "email" } }, required: ["email"] },
      { name: "resetPasswordAction", summary: "Reset password with token", requestProperties: { token: { type: "string" }, password: { type: "string" } }, required: ["token", "password"] },
      { name: "verifyEmailAction", summary: "Verify email address with token", requestProperties: { token: { type: "string" } }, required: ["token"] },
      { name: "getLoginFailureReasonAction", summary: "Resolve login failure reason after failed sign-in", requestProperties: { email: { type: "string", format: "email" } }, required: ["email"] },
    ],
  },
  {
    module: "dashboard",
    tag: "Server Actions — Dashboard",
    actions: [
      { name: "getOverviewDashboardAction", summary: "Load overview metrics, charts, and recent activity" },
    ],
  },
  {
    module: "analytics",
    tag: "Server Actions — Analytics",
    actions: [
      { name: "getAnalyticsDashboardAction", summary: "Load analytics dashboard aggregates and charts" },
    ],
  },
  {
    module: "students",
    tag: "Server Actions — Students",
    actions: [
      {
        name: "getStudents",
        summary: "Paginated student list with filters",
        requestProperties: {
          page: { type: "integer", minimum: 1 },
          pageSize: { type: "integer", minimum: 1, maximum: 100 },
          search: { type: "string" },
          status: { type: "string" },
          partnerId: { type: "string" },
          state: { type: "string" },
          college: { type: "string" },
          course: { type: "string" },
          bank: { type: "string" },
        },
      },
      { name: "getStudentById", summary: "Get student detail by MongoDB id", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "getStudentForEdit", summary: "Get student record for edit form", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "getAssignableUsers", summary: "List users assignable to students or tasks" },
      { name: "createStudentAction", summary: "Create a student", requestProperties: { formData: { type: "object" } } },
      { name: "createQuickStudentAction", summary: "Create a student with minimal fields", requestProperties: { formData: { type: "object" } } },
      { name: "createLeadAction", summary: "Create a lead (admission pipeline entry)", requestProperties: { formData: { type: "object" } } },
      { name: "updateStudentAction", summary: "Update a student", requestProperties: { id: { type: "string" }, formData: { type: "object" } }, required: ["id"] },
      { name: "deleteStudentAction", summary: "Delete a student", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "bulkUpdateStudentsAction", summary: "Bulk update student status or partner", requestProperties: { ids: { type: "array", items: { type: "string" } }, updates: { type: "object" } }, required: ["ids"] },
      { name: "addStudentNoteAction", summary: "Add a follow-up note to a student", requestProperties: { studentId: { type: "string" }, note: { type: "object" } }, required: ["studentId"] },
      { name: "addStudentDocumentAction", summary: "Attach a Google Drive document link to a student", requestProperties: { studentId: { type: "string" }, name: { type: "string" }, url: { type: "string", format: "uri" } }, required: ["studentId", "name", "url"] },
      { name: "removeStudentDocumentAction", summary: "Remove a document link from a student", requestProperties: { studentId: { type: "string" }, documentId: { type: "string" } }, required: ["studentId", "documentId"] },
      { name: "updateStudentApplicationStatusAction", summary: "Update student application pipeline status", requestProperties: { studentId: { type: "string" }, status: { type: "string" } }, required: ["studentId", "status"] },
      { name: "markStudentSentToBankAction", summary: "Mark student as sent to bank", requestProperties: { studentId: { type: "string" } }, required: ["studentId"] },
      { name: "setStudentPrimaryLenderAction", summary: "Set primary lender on a student", requestProperties: { studentId: { type: "string" }, lenderId: { type: "string" } }, required: ["studentId", "lenderId"] },
      { name: "addStudentLoanApplicationAction", summary: "Add a loan application to a student", requestProperties: { studentId: { type: "string" }, formData: { type: "object" } }, required: ["studentId"] },
      { name: "sendLoanApplicationToBankAction", summary: "Send loan application to bank", requestProperties: { studentId: { type: "string" }, applicationId: { type: "string" } }, required: ["studentId", "applicationId"] },
      { name: "updateLoanApplicationStatusAction", summary: "Update loan application status", requestProperties: { studentId: { type: "string" }, applicationId: { type: "string" }, status: { type: "string" } }, required: ["studentId", "applicationId", "status"] },
      { name: "updateLoanApplicationLanAction", summary: "Update loan application LAN number", requestProperties: { studentId: { type: "string" }, applicationId: { type: "string" }, lan: { type: "string" } }, required: ["studentId", "applicationId"] },
      { name: "updateStudentLoanDetailsAction", summary: "Update student loan disbursement details", requestProperties: { studentId: { type: "string" }, formData: { type: "object" } }, required: ["studentId"] },
      { name: "rejectLoanApplicationAction", summary: "Reject a loan application", requestProperties: { studentId: { type: "string" }, applicationId: { type: "string" }, reason: { type: "string" } }, required: ["studentId", "applicationId"] },
    ],
  },
  {
    module: "student-import",
    tag: "Server Actions — Student Import",
    actions: [
      { name: "getStudentImportTemplateAction", summary: "Download Excel import template (base64)" },
      { name: "importStudentsAction", summary: "Import students from uploaded Excel file", requestProperties: { formData: { type: "object", description: "Multipart FormData with file field" } } },
    ],
  },
  {
    module: "partners",
    tag: "Server Actions — Partners",
    actions: [
      {
        name: "getPartners",
        summary: "Paginated partner list",
        requestProperties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          search: { type: "string" },
          status: { type: "string" },
        },
      },
      { name: "getPartnerById", summary: "Partner detail", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "getPartnerForEdit", summary: "Partner for edit form", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "getPartnerStudents", summary: "Students linked to a partner", requestProperties: { partnerId: { type: "string" } }, required: ["partnerId"] },
      { name: "getPartnersList", summary: "Minimal partner list for selects" },
      { name: "createPartnerAction", summary: "Create partner", requestProperties: { formData: { type: "object" } } },
      { name: "updatePartnerAction", summary: "Update partner", requestProperties: { id: { type: "string" }, formData: { type: "object" } }, required: ["id"] },
      { name: "deletePartnerAction", summary: "Delete partner", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "getPartnerAnalytics", summary: "Partner analytics summary", requestProperties: { partnerId: { type: "string" } }, required: ["partnerId"] },
      { name: "getPartnersCommissionOverviewAction", summary: "Commission overview across partners", requestProperties: { status: { type: "string" } } },
      { name: "recordPartnerCommissionSettlementAction", summary: "Record partner-level commission settlement", requestProperties: { partnerId: { type: "string" }, formData: { type: "object" } }, required: ["partnerId"] },
      { name: "getPartnerCommissionLedgerAction", summary: "Partner commission ledger entries", requestProperties: { partnerId: { type: "string" }, month: { type: "string" } }, required: ["partnerId"] },
      { name: "recordStudentCommissionSettlementAction", summary: "Record student commission paid to partner", requestProperties: { partnerId: { type: "string" }, studentId: { type: "string" }, formData: { type: "object" } }, required: ["partnerId", "studentId"] },
      { name: "markStudentCommissionReceivedAction", summary: "Mark full pending commission as received", requestProperties: { partnerId: { type: "string" }, studentId: { type: "string" } }, required: ["partnerId", "studentId"] },
      { name: "markStudentCommissionSharedAction", summary: "Mark full pending partner share as paid", requestProperties: { partnerId: { type: "string" }, studentId: { type: "string" } }, required: ["partnerId", "studentId"] },
      { name: "recordStudentCommissionReceivedAction", summary: "Record partial commission received from bank", requestProperties: { partnerId: { type: "string" }, studentId: { type: "string" }, formData: { type: "object" } }, required: ["partnerId", "studentId"] },
      { name: "updateStudentCommissionRateAction", summary: "Update our or partner commission rate on a student", requestProperties: { partnerId: { type: "string" }, studentId: { type: "string" }, formData: { type: "object" } }, required: ["partnerId", "studentId"] },
      { name: "exportPartnerCommissionAction", summary: "Export partner commission data as CSV", requestProperties: { partnerId: { type: "string" } }, required: ["partnerId"] },
    ],
  },
  {
    module: "admissions",
    tag: "Server Actions — Admissions",
    actions: [
      {
        name: "getAdmissions",
        summary: "Paginated admissions list",
        requestProperties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          search: { type: "string" },
          status: { type: "string" },
        },
      },
      { name: "getAdmissionById", summary: "Admission detail by id", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "getAdmissionForEdit", summary: "Admission record for edit form", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "updateAdmissionAction", summary: "Update admission profile", requestProperties: { id: { type: "string" }, formData: { type: "object" } }, required: ["id"] },
      { name: "updateAdmissionRevenueAction", summary: "Update admission revenue fields", requestProperties: { id: { type: "string" }, formData: { type: "object" } }, required: ["id"] },
    ],
  },
  {
    module: "lenders",
    tag: "Server Actions — Lenders",
    actions: [
      { name: "getLendersAction", summary: "List all lenders" },
      { name: "getLenderOptionsAction", summary: "Minimal lender list for selects" },
      { name: "createLenderAction", summary: "Create a lender", requestProperties: { formData: { type: "object" } } },
      { name: "updateLenderAction", summary: "Update a lender", requestProperties: { id: { type: "string" }, formData: { type: "object" } }, required: ["id"] },
      { name: "deleteLenderAction", summary: "Delete a lender", requestProperties: { id: { type: "string" } }, required: ["id"] },
    ],
  },
  {
    module: "tasks",
    tag: "Server Actions — Tasks",
    actions: [
      { name: "getTaskSummary", summary: "Task counts by status" },
      {
        name: "getTasks",
        summary: "Paginated task list",
        requestProperties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          status: { type: "string" },
          assigneeId: { type: "string" },
        },
      },
      { name: "createTaskAction", summary: "Create a task", requestProperties: { formData: { type: "object" } } },
      { name: "updateTaskStatusAction", summary: "Update task status", requestProperties: { taskId: { type: "string" }, status: { type: "string" } }, required: ["taskId", "status"] },
      { name: "updateTaskAction", summary: "Update task details", requestProperties: { formData: { type: "object" } } },
      { name: "assignTaskToMeAction", summary: "Assign task to current user", requestProperties: { taskId: { type: "string" } }, required: ["taskId"] },
      { name: "deleteTaskAction", summary: "Delete a task", requestProperties: { id: { type: "string" } }, required: ["id"] },
    ],
  },
  {
    module: "applications",
    tag: "Server Actions — Applications",
    actions: [
      {
        name: "getApplications",
        summary: "Paginated applications pipeline",
        requestProperties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          search: { type: "string" },
          status: { type: "string" },
          partnerId: { type: "string" },
        },
      },
      { name: "updateApplicationStatusAction", summary: "Move application on Kanban board", requestProperties: { id: { type: "string" }, status: { type: "string" } }, required: ["id", "status"] },
      { name: "updateApplicationPriorityAction", summary: "Update application priority", requestProperties: { id: { type: "string" }, priority: { type: "string" } }, required: ["id", "priority"] },
    ],
  },
  {
    module: "reports",
    tag: "Server Actions — Reports",
    actions: [
      { name: "getReportAction", summary: "Generate report data", requestProperties: { type: { type: "string" }, filters: { type: "object" } } },
      { name: "exportReportCSVAction", summary: "Export report as CSV", requestProperties: { type: { type: "string" }, filters: { type: "object" } } },
      { name: "exportReportExcelAction", summary: "Export report as Excel", requestProperties: { type: { type: "string" }, filters: { type: "object" } } },
      { name: "exportReportPdfAction", summary: "Export report as PDF", requestProperties: { type: { type: "string" }, filters: { type: "object" } } },
    ],
  },
  {
    module: "audit",
    tag: "Server Actions — Audit",
    actions: [
      { name: "getAuditLogStats", summary: "Audit log summary statistics" },
      {
        name: "getAuditLogs",
        summary: "Paginated audit log entries",
        requestProperties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          resourceType: { type: "string" },
          actionGroup: { type: "string" },
          timeRange: { type: "string", enum: ["today", "week", "month", "all"] },
        },
      },
      { name: "exportAuditLogsAction", summary: "Export filtered audit logs as CSV", requestProperties: { resourceType: { type: "string" }, actionGroup: { type: "string" }, timeRange: { type: "string" } } },
    ],
  },
  {
    module: "settings",
    tag: "Server Actions — Settings & Users",
    actions: [
      { name: "getSettings", summary: "Load application settings" },
      { name: "updateSettingsAction", summary: "Update application settings", requestProperties: { formData: { type: "object" } } },
      { name: "getUsers", summary: "List all users" },
      { name: "getPendingUsers", summary: "List users awaiting approval" },
      { name: "approveUserAction", summary: "Approve pending user", requestProperties: { userId: { type: "string" }, role: { type: "string" } }, required: ["userId"] },
      { name: "rejectUserAction", summary: "Reject pending user", requestProperties: { userId: { type: "string" } }, required: ["userId"] },
      { name: "createUserAction", summary: "Create user from admin panel", requestProperties: { formData: { type: "object" } } },
      { name: "updateUserRoleAction", summary: "Change user role", requestProperties: { userId: { type: "string" }, role: { type: "string" } }, required: ["userId", "role"] },
      { name: "updateUserMenuPermissionsAction", summary: "Set per-user menu read/write access", requestProperties: { userId: { type: "string" }, useCustomPermissions: { type: "boolean" }, menuAccess: { type: "object" } }, required: ["userId"] },
      { name: "deleteUserAction", summary: "Delete user", requestProperties: { userId: { type: "string" } }, required: ["userId"] },
      { name: "getRoles", summary: "List available roles" },
      { name: "updateProfileAction", summary: "Update current user profile", requestProperties: { formData: { type: "object" } } },
      { name: "getUnreadNotificationCount", summary: "Unread notification badge count" },
    ],
  },
  {
    module: "notifications",
    tag: "Server Actions — Notifications",
    actions: [
      { name: "getNotificationsAction", summary: "List user notifications" },
      { name: "markNotificationReadAction", summary: "Mark one notification read", requestProperties: { id: { type: "string" } }, required: ["id"] },
      { name: "markAllNotificationsReadAction", summary: "Mark all notifications read" },
    ],
  },
  {
    module: "search",
    tag: "Server Actions — Search",
    actions: [
      { name: "globalSearchAction", summary: "Global search across students, partners, applications", requestProperties: { query: { type: "string" } }, required: ["query"] },
    ],
  },
  {
    module: "upload",
    tag: "Server Actions — Upload",
    actions: [
      { name: "getUploadSignatureAction", summary: "Cloudinary signed upload parameters", requestProperties: { folder: { type: "string" } } },
    ],
  },
];
