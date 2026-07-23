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
import { StudentPhoneField } from "@/components/forms/student-phone-field";
import { AssigneeSelect } from "@/components/forms/assignee-select";
import { TARGET_COUNTRIES, TARGET_INTAKES } from "@/lib/constants/study-abroad";
import { GraduationCap } from "lucide-react";

interface AssigneeOption {
  _id: string;
  name: string;
}

interface AddAdmissionSheetProps {
  assignableUsers: AssigneeOption[];
  canViewRevenue?: boolean;
}

export function AddAdmissionSheet({ assignableUsers, canViewRevenue = false }: AddAdmissionSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetCountry, setTargetCountry] = useState("");
  const [targetIntake, setTargetIntake] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const result = await createLeadAction(formData);
    if (result.success) {
      notify.success("Admission lead added");
      form.reset();
      setTargetCountry("");
      setTargetIntake("");
      setAssignedToId("");
      setOpen(false);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to add admission");
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button size="sm">
            <GraduationCap className="mr-1.5 h-4 w-4" />
            Add Admission
          </Button>
        }
      />
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Admission</SheetTitle>
          <SheetDescription>
            Capture admission details for a new lead. Link to the full student profile anytime from the list.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admission-firstName">Student first name *</Label>
              <Input id="admission-firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admission-lastName">Student last name *</Label>
              <Input id="admission-lastName" name="lastName" required />
            </div>
          </div>

          <StudentPhoneField
            id="admission-phone"
            name="phone"
            label="Number"
          />

          <div className="space-y-2">
            <Label htmlFor="admission-targetCountry">Country</Label>
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
            <Label htmlFor="admission-targetIntake">Intake</Label>
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
            <Label htmlFor="admission-targetUniversity">University</Label>
            <Input id="admission-targetUniversity" name="targetUniversity" placeholder="e.g. University of Melbourne" />
          </div>

          {canViewRevenue ? (
            <div className="space-y-2">
              <Label htmlFor="admission-admissionRevenue">Admission Revenue (INR) *</Label>
              <Input
                id="admission-admissionRevenue"
                name="admissionRevenue"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                required
                placeholder="e.g. 15000"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="admission-assignedToId">Assigned to</Label>
            <AssigneeSelect
              id="admission-assignedToId"
              users={assignableUsers}
              value={assignedToId}
              onValueChange={setAssignedToId}
              placeholder="Unassigned"
              allowUnassigned
            />
            <input type="hidden" name="assignedToId" value={assignedToId} />
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Admission"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
