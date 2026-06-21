"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/cards/glass-card";
import { FormSection } from "@/components/forms/form-section";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateSettingsAction,
  createUserAction,
  deleteUserAction,
  approveUserAction,
  rejectUserAction,
} from "@/lib/actions/settings.actions";
import { ROLE_LABELS } from "@/lib/constants/permissions";
import type { AppModules, AppSettings, UserRole } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, UserCheck, UserX } from "lucide-react";

interface SettingsViewProps {
  settings: AppSettings;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    status: string;
  }>;
  canManageUsers?: boolean;
  canWriteSettings?: boolean;
  currentUserRole?: UserRole;
  pendingUsers?: Array<{
    _id: string;
    name: string;
    email: string;
    createdAt: Date | string;
  }>;
}

const MODULE_KEYS = ["students", "partners", "applications", "reports", "analytics"] as const;

function getCreatableRoles(currentUserRole?: UserRole): UserRole[] {
  return (Object.keys(ROLE_LABELS) as UserRole[]).filter((role) => {
    if (role === "super_admin") return false;
    if (role === "admin") return currentUserRole === "super_admin";
    return true;
  });
}

export function SettingsView({
  settings,
  users,
  canManageUsers = false,
  canWriteSettings = true,
  currentUserRole,
  pendingUsers = [],
}: SettingsViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [themeMode, setThemeMode] = useState(settings.theme.mode);
  const [modules, setModules] = useState<AppModules>(settings.modules);
  const [createUserRole, setCreateUserRole] = useState<UserRole>("staff");
  const [approvalRoles, setApprovalRoles] = useState<Record<string, UserRole>>({});

  async function handleSettingsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateSettingsAction(formData);
    if (result.success) {
      toast.success("Settings saved");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("role", createUserRole);
    const result = await createUserAction(formData);
    if (result.success) {
      toast.success("User created");
      (e.target as HTMLFormElement).reset();
      setCreateUserRole("staff");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Tabs defaultValue="company">
      <div className="scrollbar-hide -mx-1 overflow-x-auto px-1 pb-1">
        <TabsList className="min-w-max">
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="modules">Modules</TabsTrigger>
        {canWriteSettings && <TabsTrigger value="security">Security</TabsTrigger>}
        {canManageUsers && <TabsTrigger value="users">Users</TabsTrigger>}
        </TabsList>
      </div>

      <TabsContent value="company" className="mt-4">
        <FormSection
          title="Company Settings"
          description="Required company identity and optional branding details."
        >
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <input type="hidden" name="settingsSection" value="company" />

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Required
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    defaultValue={settings.company.name}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Optional
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    defaultValue={settings.company.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    name="companyPhone"
                    defaultValue={settings.company.phone}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    name="companyAddress"
                    defaultValue={settings.company.address}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <ImageUploadField
                    name="companyLogo"
                    label="Company Logo"
                    folder="settings"
                    defaultValue={settings.company.logo ?? ""}
                    disabled={!canWriteSettings}
                    hint="JPEG, PNG, or WebP up to 10 MB."
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading || !canWriteSettings}>
              {canWriteSettings ? "Save Company Settings" : "View only"}
            </Button>
          </form>
        </FormSection>
      </TabsContent>

      <TabsContent value="theme" className="mt-4">
        <GlassCard className="p-6">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <input type="hidden" name="settingsSection" value="theme" />
            <input type="hidden" name="themeMode" value={themeMode} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="themePrimary">Primary Color</Label>
                <Input id="themePrimary" name="themePrimary" defaultValue={settings.theme.primary} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="themeAccent">Accent Color</Label>
                <Input id="themeAccent" name="themeAccent" defaultValue={settings.theme.accent} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="themeRadius">Border Radius</Label>
                <Input id="themeRadius" name="themeRadius" defaultValue={settings.theme.radius} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="themeMode">Theme Mode</Label>
                <Select value={themeMode} onValueChange={(value) => setThemeMode(value as AppSettings["theme"]["mode"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading || !canWriteSettings}>
              {canWriteSettings ? "Save Theme" : "View only"}
            </Button>
          </form>
        </GlassCard>
      </TabsContent>

      <TabsContent value="modules" className="mt-4">
        <GlassCard className="p-6">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <input type="hidden" name="settingsSection" value="modules" />
            {MODULE_KEYS.map((mod) => {
              const inputName = `modules${mod.charAt(0).toUpperCase()}${mod.slice(1)}`;
              return (
                <div key={mod} className="flex items-center justify-between">
                  <Label htmlFor={inputName} className="capitalize">{mod}</Label>
                  <Switch
                    id={inputName}
                    checked={modules[mod]}
                    onCheckedChange={(checked) =>
                      setModules((prev) => ({ ...prev, [mod]: checked }))
                    }
                  />
                  <input type="hidden" name={inputName} value={modules[mod] ? "true" : "false"} />
                </div>
              );
            })}
            <Button type="submit" disabled={loading || !canWriteSettings}>
              {canWriteSettings ? "Save Modules" : "View only"}
            </Button>
          </form>
        </GlassCard>
      </TabsContent>

      {canWriteSettings && (
      <TabsContent value="security" className="mt-4">
        <GlassCard className="p-6">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <input type="hidden" name="settingsSection" value="security" />
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="sessionExpiryHours">Session expiry (hours)</Label>
              <Input
                id="sessionExpiryHours"
                name="sessionExpiryHours"
                type="number"
                min={1}
                max={720}
                defaultValue={settings.sessionExpiryHours}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default session length for sign-in. &quot;Remember me&quot; extends this by 7× on the next login.
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              Save Security Settings
            </Button>
          </form>
        </GlassCard>
      </TabsContent>
      )}

      {canManageUsers && (
      <TabsContent value="users" className="mt-4 space-y-6">
        {pendingUsers.length > 0 && (
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#F59E0B]" />
              <h3 className="text-base font-bold">Approval Queue</h3>
              <span className="rounded-full bg-[#F59E0B]/12 px-2.5 py-0.5 text-xs font-semibold text-[#F59E0B]">
                {pendingUsers.length} waiting
              </span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              These users verified their email and are waiting to be onboarded. Approve with a role or reject.
            </p>
            <div className="space-y-3">
              {pendingUsers.map((u) => {
                const role = approvalRoles[u._id] ?? "staff";
                return (
                  <div
                    key={u._id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Requested {formatDate(u.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={role}
                        onValueChange={(value) =>
                          setApprovalRoles((prev) => ({ ...prev, [u._id]: value as UserRole }))
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ROLE_LABELS) as UserRole[])
                            .filter((r) => r !== "super_admin")
                            .map((r) => (
                              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const result = await approveUserAction(u._id, role);
                          if (result.success) {
                            toast.success(`${u.name} approved as ${ROLE_LABELS[role]}`);
                            router.refresh();
                          } else toast.error(result.error);
                        }}
                      >
                        <UserCheck className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          const result = await rejectUserAction(u._id);
                          if (result.success) {
                            toast.success("User rejected");
                            router.refresh();
                          } else toast.error(result.error);
                        }}
                      >
                        <UserX className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        <GlassCard className="p-6">
          <h3 className="mb-4 text-sm font-semibold">Add User</h3>
          <form onSubmit={handleCreateUser} className="grid gap-4 sm:grid-cols-2">
            <Input name="name" placeholder="Full Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Select value={createUserRole} onValueChange={(value) => setCreateUserRole(value as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getCreatableRoles(currentUserRole).map((role) => (
                  <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="sm:col-span-2">Create User</Button>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                  <TableCell className="capitalize">
                    <StatusBadge status={u.status} type="user" />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const result = await deleteUserAction(u._id);
                        if (result.success) { toast.success("User deleted"); router.refresh(); }
                        else toast.error(result.error);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </GlassCard>
      </TabsContent>
      )}
    </Tabs>
  );
}
