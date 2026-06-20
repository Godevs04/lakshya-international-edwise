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
  updateUserRoleAction,
  deleteUserAction,
} from "@/lib/actions/settings.actions";
import { ROLE_LABELS } from "@/lib/constants/permissions";
import type { AppSettings, UserRole } from "@/types";

interface SettingsViewProps {
  settings: AppSettings;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    status: string;
  }>;
}

export function SettingsView({ settings, users }: SettingsViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSettingsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("modulesStudents", formData.get("modulesStudents") ? "true" : "false");
    formData.set("modulesPartners", formData.get("modulesPartners") ? "true" : "false");
    formData.set("modulesApplications", formData.get("modulesApplications") ? "true" : "false");
    formData.set("modulesReports", formData.get("modulesReports") ? "true" : "false");
    formData.set("modulesAnalytics", formData.get("modulesAnalytics") ? "true" : "false");
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
    const result = await createUserAction(formData);
    if (result.success) {
      toast.success("User created");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Tabs defaultValue="company">
      <TabsList>
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="modules">Modules</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="mt-4">
        <GlassCard className="p-6">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <input type="hidden" name="themePrimary" value={settings.theme.primary} />
            <input type="hidden" name="themeAccent" value={settings.theme.accent} />
            <input type="hidden" name="themeRadius" value={settings.theme.radius} />
            <input type="hidden" name="themeMode" value={settings.theme.mode} />
            <input type="hidden" name="sessionExpiryHours" value={settings.sessionExpiryHours} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="companyName" defaultValue={settings.company.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input id="companyEmail" name="companyEmail" type="email" defaultValue={settings.company.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input id="companyPhone" name="companyPhone" defaultValue={settings.company.phone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLogo">Logo URL</Label>
                <Input id="companyLogo" name="companyLogo" defaultValue={settings.company.logo} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Input id="companyAddress" name="companyAddress" defaultValue={settings.company.address} />
              </div>
            </div>
            <Button type="submit" disabled={loading}>Save Company Settings</Button>
          </form>
        </GlassCard>
      </TabsContent>

      <TabsContent value="theme" className="mt-4">
        <GlassCard className="p-6">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <input type="hidden" name="companyName" value={settings.company.name} />
            <input type="hidden" name="companyEmail" value={settings.company.email ?? ""} />
            <input type="hidden" name="companyPhone" value={settings.company.phone ?? ""} />
            <input type="hidden" name="companyAddress" value={settings.company.address ?? ""} />
            <input type="hidden" name="companyLogo" value={settings.company.logo ?? ""} />
            <input type="hidden" name="sessionExpiryHours" value={settings.sessionExpiryHours} />
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
                <Select name="themeMode" defaultValue={settings.theme.mode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading}>Save Theme</Button>
          </form>
        </GlassCard>
      </TabsContent>

      <TabsContent value="modules" className="mt-4">
        <GlassCard className="p-6">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <input type="hidden" name="companyName" value={settings.company.name} />
            <input type="hidden" name="themePrimary" value={settings.theme.primary} />
            <input type="hidden" name="themeAccent" value={settings.theme.accent} />
            <input type="hidden" name="themeRadius" value={settings.theme.radius} />
            <input type="hidden" name="themeMode" value={settings.theme.mode} />
            <input type="hidden" name="sessionExpiryHours" value={settings.sessionExpiryHours} />
            {(["students", "partners", "applications", "reports", "analytics"] as const).map((mod) => (
              <div key={mod} className="flex items-center justify-between">
                <Label htmlFor={`modules${mod.charAt(0).toUpperCase() + mod.slice(1)}`} className="capitalize">{mod}</Label>
                <Switch
                  id={`modules${mod.charAt(0).toUpperCase() + mod.slice(1)}`}
                  name={`modules${mod.charAt(0).toUpperCase() + mod.slice(1)}`}
                  defaultChecked={settings.modules[mod]}
                />
              </div>
            ))}
            <Button type="submit" disabled={loading}>Save Modules</Button>
          </form>
        </GlassCard>
      </TabsContent>

      <TabsContent value="users" className="mt-4 space-y-6">
        <GlassCard className="p-6">
          <h3 className="mb-4 text-sm font-semibold">Add User</h3>
          <form onSubmit={handleCreateUser} className="grid gap-4 sm:grid-cols-2">
            <Input name="name" placeholder="Full Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Select name="role" defaultValue="staff">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
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
                  <TableCell className="capitalize">{u.status}</TableCell>
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
    </Tabs>
  );
}
