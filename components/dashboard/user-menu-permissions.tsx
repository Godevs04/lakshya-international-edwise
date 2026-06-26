"use client";

import {
  BarChart3,
  FileText,
  GraduationCap,
  Handshake,
  LineChart,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MENU_PERMISSION_MODULES,
  countMenuAccessLevels,
  deriveMenuAccessFromRole,
  isMenuAccessEqual,
  type MenuAccessLevel,
  type MenuAccessMap,
  type MenuPermissionKey,
} from "@/lib/constants/menu-permissions";
import { ROLE_LABELS } from "@/lib/constants/permissions";
import type { UserRole } from "@/types";

const MODULE_ICONS: Record<MenuPermissionKey, LucideIcon> = {
  students: Users,
  admissions: GraduationCap,
  partners: Handshake,
  applications: FileText,
  reports: BarChart3,
  analytics: LineChart,
  audit: Shield,
  settings: Settings,
  users: Users,
};

const MODULE_ACCENTS: Record<MenuPermissionKey, string> = {
  students: "from-[#E8952E] to-[#F59E0B]",
  admissions: "from-[#D97706] to-[#FBBF24]",
  partners: "from-[#8B5CF6] to-[#A78BFA]",
  applications: "from-[#3B82F6] to-[#60A5FA]",
  reports: "from-[#10B981] to-[#34D399]",
  analytics: "from-[#06B6D4] to-[#22D3EE]",
  audit: "from-[#64748B] to-[#94A3B8]",
  settings: "from-[#F97316] to-[#FB923C]",
  users: "from-[#EC4899] to-[#F472B6]",
};

const ACCESS_OPTIONS: Array<{ value: MenuAccessLevel; label: string }> = [
  { value: "none", label: "None" },
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
];

const ACCESS_STYLES: Record<MenuAccessLevel, { active: string; idle: string; meta: string }> = {
  none: {
    active: "bg-slate-700 text-white shadow-md shadow-slate-900/15 ring-2 ring-slate-700/20",
    idle: "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900",
    meta: "text-slate-700",
  },
  read: {
    active: "bg-[#2563EB] text-white shadow-md shadow-blue-900/20 ring-2 ring-blue-500/30",
    idle: "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700",
    meta: "text-[#1D4ED8]",
  },
  write: {
    active: "bg-[#16A34A] text-white shadow-md shadow-green-900/20 ring-2 ring-green-500/30",
    idle: "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-green-50 hover:text-green-700",
    meta: "text-[#15803D]",
  },
};

export interface UserMenuPermissionsValue {
  useCustomPermissions: boolean;
  menuAccess: MenuAccessMap;
}

interface UserMenuPermissionsProps {
  role: UserRole;
  value: UserMenuPermissionsValue;
  onChange: (value: UserMenuPermissionsValue) => void;
  disabled?: boolean;
  compact?: boolean;
}

function getEffectiveAccess(
  value: UserMenuPermissionsValue,
  roleDefaults: MenuAccessMap
): MenuAccessMap {
  return value.useCustomPermissions ? value.menuAccess : roleDefaults;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function UserMenuPermissions({
  role,
  value,
  onChange,
  disabled = false,
  compact = false,
}: UserMenuPermissionsProps) {
  const roleDefaults = deriveMenuAccessFromRole(role);
  const effectiveAccess = getEffectiveAccess(value, roleDefaults);
  const summary = countMenuAccessLevels(effectiveAccess);
  const isSuperAdmin = role === "super_admin";
  const usingRoleTemplate = !value.useCustomPermissions;

  function setModuleLevel(key: MenuPermissionKey, level: MenuAccessLevel) {
    const base = value.useCustomPermissions ? value.menuAccess : { ...roleDefaults };
    const nextAccess = { ...base, [key]: level };
    const matchesRole = isMenuAccessEqual(nextAccess, roleDefaults);

    onChange({
      useCustomPermissions: !matchesRole,
      menuAccess: nextAccess,
    });
  }

  function resetToRoleDefaults() {
    onChange({
      useCustomPermissions: false,
      menuAccess: { ...roleDefaults },
    });
  }

  if (isSuperAdmin) {
    return (
      <div className="rounded-2xl border-2 border-[#E8952E]/30 bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#EA580C]" />
          <p className="text-sm font-bold text-[#9A3412]">Super Admin</p>
        </div>
        <p className="mt-2 text-sm text-[#9A3412]/80">
          Full access to every menu and action. Menu permissions cannot be restricted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-[#E8952E]/20 bg-gradient-to-r from-[#FFF7ED] via-white to-[#EFF6FF] p-4 shadow-sm">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-foreground">Menu access control</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {usingRoleTemplate
                ? `Starting from the ${ROLE_LABELS[role]} template. Tap any menu to customize.`
                : "Custom access active. You can still reset back to the role template anytime."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide",
                usingRoleTemplate
                  ? "bg-slate-200 text-slate-700"
                  : "bg-[#E8952E] text-white"
              )}
            >
              {usingRoleTemplate ? "Role template" : "Custom"}
            </span>
            {!usingRoleTemplate ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={resetToRoleDefaults}
                className="h-8 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset to role
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SummaryPill label="Write" value={summary.write} tone="write" />
        <SummaryPill label="Read" value={summary.read} tone="read" />
        <SummaryPill label="Hidden" value={summary.none} tone="none" />
      </div>

      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        )}
      >
        {MENU_PERMISSION_MODULES.map((menuModule) => {
          const Icon = MODULE_ICONS[menuModule.key];
          const level = effectiveAccess[menuModule.key] ?? "none";
          const inheritedLevel = roleDefaults[menuModule.key] ?? "none";
          const differsFromRole = level !== inheritedLevel;
          const readOnlyModule = menuModule.writePermissions.length === 0;

          return (
            <ModulePermissionCard
              key={menuModule.key}
              icon={Icon}
              accent={MODULE_ACCENTS[menuModule.key]}
              label={menuModule.label}
              description={menuModule.description}
              level={level}
              inheritedLevel={inheritedLevel}
              differsFromRole={differsFromRole}
              usingRoleTemplate={usingRoleTemplate}
              readOnlyModule={readOnlyModule}
              disabled={disabled}
              onSelectLevel={(nextLevel) => setModuleLevel(menuModule.key, nextLevel)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ModulePermissionCardProps {
  icon: LucideIcon;
  accent: string;
  label: string;
  description: string;
  level: MenuAccessLevel;
  inheritedLevel: MenuAccessLevel;
  differsFromRole: boolean;
  usingRoleTemplate: boolean;
  readOnlyModule: boolean;
  disabled: boolean;
  onSelectLevel: (level: MenuAccessLevel) => void;
}

function ModulePermissionCard({
  icon: Icon,
  accent,
  label,
  description,
  level,
  inheritedLevel,
  differsFromRole,
  usingRoleTemplate,
  readOnlyModule,
  disabled,
  onSelectLevel,
}: ModulePermissionCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border-2 bg-white p-4 shadow-sm",
        differsFromRole && !usingRoleTemplate
          ? "border-[#E8952E]/40 ring-1 ring-[#E8952E]/10"
          : "border-slate-200"
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            accent
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold leading-snug text-slate-900">{label}</p>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {differsFromRole ? (
                <span className="whitespace-nowrap rounded-full bg-[#E8952E]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#B45309]">
                  Changed
                </span>
              ) : null}
              {readOnlyModule ? (
                <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  Read only
                </span>
              ) : null}
            </div>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1.5">
          {ACCESS_OPTIONS.map((option) => {
            const isActive = level === option.value;
            const styles = ACCESS_STYLES[option.value];
            const writeUnavailable = option.value === "write" && readOnlyModule;

            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled || writeUnavailable}
                onClick={() => onSelectLevel(option.value)}
                className={cn(
                  "h-9 rounded-lg text-xs font-bold transition-all",
                  isActive ? styles.active : styles.idle,
                  writeUnavailable && "invisible",
                  disabled && !writeUnavailable && "cursor-not-allowed opacity-45"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-lg bg-slate-50 py-2.5">
          <div className="flex flex-col items-center justify-center gap-0.5 px-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Role default
            </p>
            <p className="text-sm font-bold text-slate-800">{capitalize(inheritedLevel)}</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5 px-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Selected
            </p>
            <p className={cn("text-sm font-bold", ACCESS_STYLES[level].meta)}>
              {capitalize(level)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: MenuAccessLevel;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold shadow-sm",
        ACCESS_STYLES[tone].active
      )}
    >
      <span>{label}</span>
      <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-extrabold">
        {value}
      </span>
    </div>
  );
}

export function buildDefaultMenuPermissions(role: UserRole): UserMenuPermissionsValue {
  return {
    useCustomPermissions: false,
    menuAccess: deriveMenuAccessFromRole(role),
  };
}
