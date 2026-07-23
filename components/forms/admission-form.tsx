"use client";

import { useEffect, useState } from "react";
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
import { FormSection } from "@/components/forms/form-section";
import { AssigneeSelect, mergeAssigneeOptions, type AssigneeOption } from "@/components/forms/assignee-select";
import { TARGET_COUNTRIES, TARGET_INTAKES } from "@/lib/constants/study-abroad";
import {
  ADMISSION_EDIT_SECTIONS,
  type AdmissionEditSectionKey,
} from "@/lib/constants/admission-edit-sections";
import { updateAdmissionAction } from "@/lib/actions/admission.actions";
import { StudentPhoneField } from "@/components/forms/student-phone-field";

interface AdmissionFormProps {
  admissionId: string;
  assignableUsers: AssigneeOption[];
  canViewRevenue?: boolean;
  initialData: {
    firstName: string;
    lastName: string;
    phone?: string;
    targetCountry?: string;
    targetIntake?: string;
    targetUniversity?: string;
    admissionRevenue?: number;
    assignedToId?: string;
    assignedToName?: string;
  };
  focusSection?: AdmissionEditSectionKey;
}

export function AdmissionForm({
  admissionId,
  assignableUsers,
  canViewRevenue = false,
  initialData,
  focusSection,
}: AdmissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetCountry, setTargetCountry] = useState(initialData.targetCountry ?? "");
  const [targetIntake, setTargetIntake] = useState(initialData.targetIntake ?? "");
  const [assignedToId, setAssignedToId] = useState(initialData.assignedToId ?? "");

  const assigneeOptions = mergeAssigneeOptions(
    assignableUsers,
    initialData.assignedToId,
    initialData.assignedToName
  );

  const focusedConfig = focusSection ? ADMISSION_EDIT_SECTIONS[focusSection] : undefined;
  const isSectionEdit = Boolean(focusedConfig);

  function isFormSectionVisible(sectionKey: string) {
    if (!isSectionEdit || !focusedConfig) return true;
    return focusedConfig.formSections.includes(sectionKey);
  }

  function isFormSectionHighlighted(sectionKey: string) {
    if (!isSectionEdit || !focusedConfig) return false;
    return focusedConfig.formSections.includes(sectionKey);
  }

  useEffect(() => {
    if (!focusedConfig) return;
    const target = document.getElementById(focusedConfig.scrollTarget);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusedConfig]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateAdmissionAction(admissionId, formData);
    if (result.success) {
      notify.success("Admission updated");
      router.push(`/dashboard/admissions/${admissionId}`);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update admission");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSectionEdit && !isFormSectionVisible("profile") ? (
        <>
          <input type="hidden" name="firstName" value={initialData.firstName} />
          <input type="hidden" name="lastName" value={initialData.lastName} />
          <input type="hidden" name="phone" value={initialData.phone ?? ""} />
        </>
      ) : null}

      {isSectionEdit && !isFormSectionVisible("study") ? (
        <>
          <input type="hidden" name="targetCountry" value={targetCountry} />
          <input type="hidden" name="targetIntake" value={targetIntake} />
          <input
            type="hidden"
            name="targetUniversity"
            value={initialData.targetUniversity ?? ""}
          />
        </>
      ) : null}

      {isSectionEdit && !isFormSectionVisible("assignment") ? (
        <input type="hidden" name="assignedToId" value={assignedToId} />
      ) : null}

      {isSectionEdit && !isFormSectionVisible("revenue") && canViewRevenue ? (
        <input
          type="hidden"
          name="admissionRevenue"
          value={String(initialData.admissionRevenue ?? 0)}
        />
      ) : null}

      {isFormSectionVisible("profile") ? (
        <FormSection
          id="section-profile"
          highlighted={isFormSectionHighlighted("profile")}
          title="Student profile"
          description="Basic contact details for this admission lead."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Student first name *</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={initialData.firstName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Student last name *</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={initialData.lastName}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <StudentPhoneField
                id="phone"
                name="phone"
                label="Number"
                defaultValue={initialData.phone ?? ""}
                excludeStudentId={admissionId}
              />
            </div>
          </div>
        </FormSection>
      ) : null}

      {isFormSectionVisible("study") ? (
        <FormSection
          id="section-study"
          highlighted={isFormSectionHighlighted("study")}
          title="Study abroad"
          description="Target country, intake, and university."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetCountry">Country</Label>
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
              <Label htmlFor="targetIntake">Intake</Label>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="targetUniversity">University</Label>
              <Input
                id="targetUniversity"
                name="targetUniversity"
                placeholder="e.g. University of Melbourne"
                defaultValue={initialData.targetUniversity}
              />
            </div>
          </div>
        </FormSection>
      ) : null}

      {isFormSectionVisible("assignment") ? (
        <FormSection
          id="section-assignment"
          highlighted={isFormSectionHighlighted("assignment")}
          title="Assignment"
          description="Who is handling this admission lead."
        >
          <div className="space-y-2">
            <Label htmlFor="assignedToId">Assigned to</Label>
            <AssigneeSelect
              id="assignedToId"
              users={assigneeOptions}
              value={assignedToId}
              onValueChange={setAssignedToId}
              placeholder="Unassigned"
              allowUnassigned
            />
            <input type="hidden" name="assignedToId" value={assignedToId} />
          </div>
        </FormSection>
      ) : null}

      {canViewRevenue && isFormSectionVisible("revenue") ? (
        <FormSection
          id="section-revenue"
          highlighted={isFormSectionHighlighted("revenue")}
          title="Admission revenue"
          description="Revenue received for this admission."
        >
          <div className="space-y-2">
            <Label htmlFor="admissionRevenue">Admission Revenue (INR)</Label>
            <Input
              id="admissionRevenue"
              name="admissionRevenue"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              defaultValue={initialData.admissionRevenue}
              placeholder="e.g. 15000"
            />
          </div>
        </FormSection>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isSectionEdit
              ? `Save ${focusedConfig?.label ?? "section"}`
              : "Update Admission"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/admissions/${admissionId}`)}
        >
          Cancel
        </Button>
        {isSectionEdit ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/dashboard/admissions/${admissionId}/edit`)}
          >
            Edit all sections
          </Button>
        ) : null}
      </div>
    </form>
  );
}
