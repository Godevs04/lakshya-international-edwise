import { getAuthUrl } from "@/lib/config/env";
import {
  SERVER_ACTION_GROUPS,
  SERVER_ACTION_NOTE,
  type ServerActionDoc,
} from "@/lib/openapi/server-actions-catalog";

type OpenApiPathItem = Record<string, unknown>;
type OpenApiDocument = Record<string, unknown>;

const COMMON_SCHEMAS = {
  ActionResult: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      error: { type: "string" },
      data: { type: "object", additionalProperties: true },
    },
    required: ["success"],
  },
  PaginatedResult: {
    type: "object",
    properties: {
      data: { type: "array", items: { type: "object" } },
      total: { type: "integer" },
      page: { type: "integer" },
      pageSize: { type: "integer" },
      totalPages: { type: "integer" },
    },
  },
  HealthResponse: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["ok", "degraded"] },
      timestamp: { type: "string", format: "date-time" },
      version: { type: "string" },
      checks: {
        type: "object",
        properties: {
          database: { type: "string" },
          environment: { type: "string" },
          smtp: { type: "string" },
          missingEnv: { type: "string" },
        },
      },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  },
};

function jsonResponse(description: string, schemaRef?: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: schemaRef ? { $ref: schemaRef } : { type: "object" },
      },
    },
  };
}

function serverActionRequestBody(action: ServerActionDoc) {
  if (!action.requestProperties) {
    return undefined;
  }

  return {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: action.requestProperties,
          required: action.required,
        },
      },
    },
  };
}

function buildServerActionPaths(): Record<string, OpenApiPathItem> {
  const paths: Record<string, OpenApiPathItem> = {};

  for (const group of SERVER_ACTION_GROUPS) {
    for (const action of group.actions) {
      const path = `/server-actions/${group.module}/${action.name}`;
      const requestBody = serverActionRequestBody(action);

      paths[path] = {
        post: {
          tags: [group.tag],
          summary: action.summary,
          description: [SERVER_ACTION_NOTE, action.description].filter(Boolean).join(" "),
          operationId: action.name,
          "x-next-server-action": true,
          security: [{ sessionCookie: [] }],
          ...(requestBody ? { requestBody } : {}),
          responses: {
            200: jsonResponse("Action result", "#/components/schemas/ActionResult"),
            401: jsonResponse("Unauthorized", "#/components/schemas/ErrorResponse"),
          },
        },
      };
    }
  }

  return paths;
}

function buildRestPaths(): Record<string, OpenApiPathItem> {
  return {
    "/api/health": {
      get: {
        tags: ["REST — Health"],
        summary: "Service health check",
        description: "Returns database, environment, and SMTP status. Used by uptime monitors and load balancers.",
        operationId: "getHealth",
        responses: {
          200: jsonResponse("Service healthy", "#/components/schemas/HealthResponse"),
          503: jsonResponse("Service degraded", "#/components/schemas/HealthResponse"),
        },
      },
    },
    "/api/cron/follow-up-reminders": {
      get: {
        tags: ["REST — Cron"],
        summary: "Run follow-up reminder job (GET)",
        description: "Sends due follow-up reminder emails. Requires `Authorization: Bearer {CRON_SECRET}` in production.",
        operationId: "runFollowUpRemindersGet",
        security: [{ cronBearer: [] }],
        responses: {
          200: jsonResponse("Job completed"),
          401: jsonResponse("Unauthorized", "#/components/schemas/ErrorResponse"),
          500: jsonResponse("Job failed", "#/components/schemas/ErrorResponse"),
        },
      },
      post: {
        tags: ["REST — Cron"],
        summary: "Run follow-up reminder job (POST)",
        description: "Same as GET — supports schedulers that use POST.",
        operationId: "runFollowUpRemindersPost",
        security: [{ cronBearer: [] }],
        responses: {
          200: jsonResponse("Job completed"),
          401: jsonResponse("Unauthorized", "#/components/schemas/ErrorResponse"),
          500: jsonResponse("Job failed", "#/components/schemas/ErrorResponse"),
        },
      },
    },
    "/api/auth/session": {
      get: {
        tags: ["REST — Auth.js"],
        summary: "Get current session",
        description: "Auth.js session endpoint. Returns the authenticated user when a valid session cookie is present.",
        operationId: "getAuthSession",
        responses: {
          200: jsonResponse("Session payload or null"),
        },
      },
    },
    "/api/auth/csrf": {
      get: {
        tags: ["REST — Auth.js"],
        summary: "Get CSRF token",
        description: "Auth.js CSRF token required for credential sign-in.",
        operationId: "getAuthCsrf",
        responses: {
          200: jsonResponse("CSRF token"),
        },
      },
    },
    "/api/auth/signin": {
      get: {
        tags: ["REST — Auth.js"],
        summary: "Sign-in page / provider list",
        operationId: "getAuthSignIn",
        responses: {
          200: { description: "HTML sign-in page or provider metadata" },
        },
      },
    },
    "/api/auth/signout": {
      post: {
        tags: ["REST — Auth.js"],
        summary: "Sign out",
        operationId: "postAuthSignOut",
        security: [{ sessionCookie: [] }],
        responses: {
          200: { description: "Signed out" },
        },
      },
    },
    "/api/auth/callback/credentials": {
      post: {
        tags: ["REST — Auth.js"],
        summary: "Credentials sign-in callback",
        description: "Auth.js credentials provider callback. Expects CSRF token and login form fields.",
        operationId: "postAuthCredentialsCallback",
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  csrfToken: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                  rememberMe: { type: "string" },
                },
                required: ["csrfToken", "email", "password"],
              },
            },
          },
        },
        responses: {
          200: { description: "Redirect or session established" },
          401: jsonResponse("Invalid credentials", "#/components/schemas/ErrorResponse"),
        },
      },
    },
    "/api/openapi.json": {
      get: {
        tags: ["REST — Meta"],
        summary: "OpenAPI specification",
        description: "Available only when `ENABLE_API_DOCS=true`.",
        operationId: "getOpenApiSpec",
        responses: {
          200: jsonResponse("OpenAPI 3.0 document"),
          404: jsonResponse("API docs disabled", "#/components/schemas/ErrorResponse"),
        },
      },
    },
  };
}

export function buildOpenApiDocument(): OpenApiDocument {
  const version = process.env.npm_package_version ?? "0.1.1";
  const serverUrl = getAuthUrl();

  const tags = [
    { name: "REST — Health", description: "Public health and readiness endpoints." },
    { name: "REST — Cron", description: "Scheduled job endpoints protected by CRON_SECRET." },
    { name: "REST — Auth.js", description: "Auth.js (NextAuth v5) HTTP handlers." },
    { name: "REST — Meta", description: "API documentation metadata." },
    ...SERVER_ACTION_GROUPS.map((group) => ({
      name: group.tag,
      description: `Server actions from lib/actions/${group.module}.actions.ts (or related module).`,
    })),
  ];

  return {
    openapi: "3.0.3",
    info: {
      title: "Lakshya International Edwise API",
      version,
      description: [
        "API reference for Lakshya International Edwise CRM.",
        "",
        "**REST routes** under `/api/*` are standard HTTP endpoints.",
        "**Server actions** under `/server-actions/*` document Next.js Server Actions used by the dashboard UI — they are not direct REST calls.",
        "",
        "Set `ENABLE_API_DOCS=true` to expose Swagger UI at `/api-docs`.",
      ].join("\n"),
    },
    servers: [{ url: serverUrl, description: "Current environment" }],
    tags,
    paths: {
      ...buildRestPaths(),
      ...buildServerActionPaths(),
    },
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "authjs.session-token",
          description: "Auth.js session cookie (name may vary by environment).",
        },
        cronBearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "CRON_SECRET",
          description: "Bearer token matching the CRON_SECRET environment variable.",
        },
      },
      schemas: COMMON_SCHEMAS,
    },
  };
}
