"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createLeadAction } from "@/lib/actions/student.actions";
import { AssigneeSelect } from "@/components/forms/assignee-select";
import { TARGET_COUNTRIES, TARGET_INTAKES } from "@/lib/constants/study-abroad";
import { useLenderOptions } from "@/components/lenders/use-lender-options";
import { UserPlus } from "lucide-react";

interface AssigneeOption {
  _id: string;
  name: string;
}

interface QuickAddLeadSheetProps {
  assignableUsers: AssigneeOption[];
}

export function QuickAddLeadSheet({ assignableUsers }: QuickAddLeadSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetCountry, setTargetCountry] = useState("");
  const [targetIntake, setTargetIntake] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [lenderId, setLenderId] = useState("");
  const { options: lenderOptions } = useLenderOptions();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createLeadAction(formData);
    if (result.success) {
      notify.success("Lead created");
      setOpen(false);
      router.push(`/dashboard/students/${result.data?.id}`);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to create lead");
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Quick Add Lead
          </Button>
        }
      />
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Quick Add Lead</SheetTitle>
          <SheetDescription>
            Capture a minimal lead profile. You can complete the full profile later.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-firstName">First Name *</Label>
              <Input id="lead-firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-lastName">Last Name *</Label>
              <Input id="lead-lastName" name="lastName" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-phone">Phone</Label>
            <Input id="lead-phone" name="phone" type="tel" inputMode="numeric" maxLength={13} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-targetCountry">Target Country</Label>
            <Select value={targetCountry} onValueChange={(value) => setTargetCountry(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="targetCountry" value={targetCountry} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-targetIntake">Target Intake</Label>
            <Select value={targetIntake} onValueChange={(value) => setTargetIntake(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select intake" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_INTAKES.map((intake) => (
                  <SelectItem key={intake} value={intake}>
                    {intake}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="targetIntake" value={targetIntake} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-targetUniversity">Target University</Label>
            <Input id="lead-targetUniversity" name="targetUniversity" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-assignedToId">Lead assigned to</Label>
            <AssigneeSelect
              id="lead-assignedToId"
              users={assignableUsers}
              value={assignedToId}
              onValueChange={setAssignedToId}
              placeholder="Unassigned"
              allowUnassigned
            />
            <input type="hidden" name="assignedToId" value={assignedToId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-lenderId">Lender</Label>
            <Select value={lenderId} onValueChange={(value) => setLenderId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select lender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {lenderOptions.map((lender) => (
                  <SelectItem key={lender.slug} value={lender.slug}>
                    {lender.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="lenderId" value={lenderId} />
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Lead"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
