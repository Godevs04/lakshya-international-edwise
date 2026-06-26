"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  UserMenuPermissions,
  buildDefaultMenuPermissions,
  type UserMenuPermissionsValue,
} from "@/components/dashboard/user-menu-permissions";
import { updateUserMenuPermissionsAction } from "@/lib/actions/settings.actions";
import {
  deriveMenuAccessFromRole,
  applyLegacyMenuAccessFallback,
  permissionsToMenuAccess,
} from "@/lib/constants/menu-permissions";
import { ROLE_LABELS } from "@/lib/constants/permissions";
import type { UserRole } from "@/types";
import { KeyRound, Loader2 } from "lucide-react";

interface PermissionUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  useCustomPermissions?: boolean;
  customPermissions?: string[];
}

interface UserPermissionsSheetProps {
  user: PermissionUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildPermissionsValue(user: PermissionUser): UserMenuPermissionsValue {
  return {
    useCustomPermissions: Boolean(user.useCustomPermissions),
    menuAccess: user.useCustomPermissions
      ? applyLegacyMenuAccessFallback(permissionsToMenuAccess(user.customPermissions ?? []))
      : deriveMenuAccessFromRole(user.role),
  };
}

function UserPermissionsEditor({
  user,
  onReady,
  onChange,
}: {
  user: PermissionUser;
  onReady: (value: UserMenuPermissionsValue) => void;
  onChange: (value: UserMenuPermissionsValue) => void;
}) {
  const [permissions, setPermissions] = useState<UserMenuPermissionsValue>(() => {
    const initial = buildPermissionsValue(user);
    onReady(initial);
    return initial;
  });

  function handleChange(value: UserMenuPermissionsValue) {
    setPermissions(value);
    onChange(value);
  }

  return (
            <UserMenuPermissions
              role={user.role}
              value={permissions}
              onChange={handleChange}
              compact
            />
  );
}

export function UserPermissionsSheet({
  user,
  open,
  onOpenChange,
}: UserPermissionsSheetProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const permissionsRef = useRef<UserMenuPermissionsValue>(
    buildDefaultMenuPermissions("staff")
  );

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const result = await updateUserMenuPermissionsAction(
      user._id,
      permissionsRef.current.useCustomPermissions,
      permissionsRef.current.menuAccess
    );
    setSaving(false);

    if (result.success) {
      notify.success(`Menu access updated for ${user.name}`);
      onOpenChange(false);
      router.refresh();
      return;
    }

    notify.error(result.error ?? "Could not update menu access");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden border-l-2 border-slate-200 bg-white p-0 sm:max-w-2xl"
      >
        <SheetHeader className="shrink-0 border-b border-slate-200 px-6 py-5 pr-14">
          <SheetTitle className="flex items-center gap-3 text-left text-lg font-bold text-slate-900">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8952E] to-[#F59E0B] text-white shadow-sm">
              <KeyRound className="h-4 w-4" />
            </span>
            <span>Menu Access</span>
          </SheetTitle>
          <SheetDescription className="text-left text-sm leading-relaxed text-slate-600">
            {user
              ? `Choose read or write access for each menu. Changes apply after ${user.name} signs in again.`
              : "Configure menu-level read and write access."}
          </SheetDescription>
        </SheetHeader>

        {user ? (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="mb-5 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-900">{user.name}</p>
                  <p className="truncate text-sm text-slate-600">{user.email}</p>
                </div>
                <span className="inline-flex w-fit shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>

            <UserPermissionsEditor
              key={user._id}
              user={user}
              onReady={(value) => {
                permissionsRef.current = value;
              }}
              onChange={(value) => {
                permissionsRef.current = value;
              }}
            />
          </div>
        ) : null}

        <SheetFooter className="shrink-0 flex-row items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="min-w-[96px] border-slate-300"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!user || saving}
            className="min-w-[120px] bg-gradient-to-r from-[#E8952E] to-[#F59E0B] font-semibold text-white shadow-md hover:opacity-95"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save access
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function serializeMenuPermissions(
  value: UserMenuPermissionsValue
): { useCustomPermissions: string; menuAccess: string } {
  return {
    useCustomPermissions: value.useCustomPermissions ? "true" : "false",
    menuAccess: JSON.stringify(value.menuAccess),
  };
}
