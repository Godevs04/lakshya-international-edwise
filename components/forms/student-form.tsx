"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/forms/form-section";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/constants/application-status";
import { DISBURSEMENT_TYPE_OPTIONS } from "@/lib/constants/disbursement";
import {
  TARGET_COUNTRIES,
  TARGET_DEGREES,
  TARGET_INTAKES,
} from "@/lib/constants/study-abroad";
import { useLenderOptions } from "@/components/lenders/use-lender-options";
import type { LenderOption } from "@/types";
import { createStudentAction, updateStudentAction } from "@/lib/actions/student.actions";
import {
  calculateExpectedCommission,
  calculateNetEarned,
  calculatePartnerShareExpected,
  resolvePartnerSharePercent,
} from "@/lib/utils/commission-calculations";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import {
  AssigneeSelect,
  mergeAssigneeOptions,
  type AssigneeOption,
} from "@/components/forms/assignee-select";

interface PartnerOption {
  _id: string;
  companyName: string;
  commissionPercent?: number;
}

interface StudentFormProps {
  partners: PartnerOption[];
  assignableUsers?: AssigneeOption[];
  lenderOptions?: LenderOption[];
  initialData?: Record<string, string | number | boolean | undefined>;
  studentId?: string;
  mode: "create" | "edit";
}

const PHONE_HINT = "10-digit Indian mobile (starts with 6–9). +91 prefix optional.";
const AADHAAR_HINT = "Exactly 12 digits, numbers only.";
const PAN_HINT = "Format: ABCDE1234F (5 letters, 4 digits, 1 letter).";

export function StudentForm({
  partners,
  assignableUsers = [],
  lenderOptions: initialLenderOptions,
  initialData,
  studentId,
  mode,
}: StudentFormProps) {
  const router = useRouter();
  const { options: lenderOptions } = useLenderOptions(initialLenderOptions);
  const [loading, setLoading] = useState(false);
  const assigneeOptions = mergeAssigneeOptions(
    assignableUsers,
    initialData?.assignedToId as string | undefined,
    initialData?.assignedToName as string | undefined
  );
  const [gender, setGender] = useState((initialData?.gender as string) ?? "");
  const [partnerId, setPartnerId] = useState((initialData?.partnerId as string) ?? "");
  const [assignedToId, setAssignedToId] = useState((initialData?.assignedToId as string) ?? "");
  const [targetCountry, setTargetCountry] = useState((initialData?.targetCountry as string) ?? "");
  const [targetIntake, setTargetIntake] = useState((initialData?.targetIntake as string) ?? "");
  const [targetDegree, setTargetDegree] = useState((initialData?.targetDegree as string) ?? "");
  const [targetUniversity, setTargetUniversity] = useState((initialData?.targetUniversity as string) ?? "");
  const [loanCurrency, setLoanCurrency] = useState((initialData?.loanCurrency as string) ?? "INR");
  const [lenderId, setLenderId] = useState((initialData?.lenderId as string) ?? "");
  const [applicationStatus, setApplicationStatus] = useState(
    (initialData?.applicationStatus as string) ?? "docs_pending"
  );
  const [disbursementType, setDisbursementType] = useState(
    (initialData?.disbursementType as string) ?? ""
  );
  const [loanDisbursed, setLoanDisbursed] = useState(
    String((initialData?.loanDisbursed as number | undefined) ?? "")
  );
  const [ourCommissionPercent, setOurCommissionPercent] = useState(
    String((initialData?.ourCommissionPercent as number | undefined) ?? "")
  );
  const [partnerShareOverride, setPartnerShareOverride] = useState(
    String((initialData?.commissionPercentOverride as number | undefined) ?? "")
  );

  const applicationStatusItems = APPLICATION_STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const disbursementTypeItems = DISBURSEMENT_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const selectedPartner = partners.find((p) => p._id === partnerId);

  const commissionPreview = useMemo(() => {
    const disbursed = Number(loanDisbursed) || 0;
    const ourRate = Number(ourCommissionPercent) || 0;
    const partnerRate = resolvePartnerSharePercent(
      selectedPartner?.commissionPercent ?? 0,
      partnerShareOverride.trim() ? Number(partnerShareOverride) : null
    );
    const expected = calculateExpectedCommission(disbursed, ourRate);
    const partnerShare = calculatePartnerShareExpected(expected, partnerRate);
    const net = calculateNetEarned(expected, partnerShare);
    return { expected, partnerShare, net, partnerRate };
  }, [loanDisbursed, ourCommissionPercent, partnerShareOverride, selectedPartner?.commissionPercent]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!partnerId) {
      notify.error("Please select a consultancy");
      return;
    }
    if (!targetCountry) {
      notify.error("Please select a target country");
      return;
    }
    if (!targetIntake) {
      notify.error("Please select a target intake");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result =
      mode === "create"
        ? await createStudentAction(formData)
        : await updateStudentAction(studentId!, formData);

    if (result.success) {
      notify.success(mode === "create" ? "Student created" : "Student updated");
      router.push(
        mode === "create"
          ? `/dashboard/students/${result.data?.id}`
          : `/dashboard/students/${studentId}`
      );
      router.refresh();
    } else {
      notify.error(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection
        title="Required for onboarding"
        description="Name, phone, consultancy, country, and intake are required. All other sections are optional."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={initialData?.firstName as string}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={initialData?.lastName as string}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="9363047040"
              defaultValue={initialData?.phone as string}
              required
            />
            <p className="text-xs text-muted-foreground">{PHONE_HINT}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnerId">Consultancy *</Label>
            <Select value={partnerId} onValueChange={(v) => setPartnerId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select consultancy">
                  {selectedPartner?.companyName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="partnerId" value={partnerId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetCountry">Target Country *</Label>
            <Select value={targetCountry} onValueChange={(v) => setTargetCountry(v ?? "")}>
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
            <Label htmlFor="targetIntake">Target Intake *</Label>
            <Select value={targetIntake} onValueChange={(v) => setTargetIntake(v ?? "")}>
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
        </div>
      </FormSection>

      <FormSection
        title="Optional — Personal & Contact"
        description="Additional profile details."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="gender" value={gender} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" name="dob" type="date" defaultValue={initialData?.dob as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="9363047040"
              defaultValue={initialData?.whatsapp as string}
            />
            <p className="text-xs text-muted-foreground">{PHONE_HINT}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={initialData?.email as string} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Optional — Address"
        description="Residential address details."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine">Address</Label>
            <Input id="addressLine" name="addressLine" defaultValue={initialData?.addressLine as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={initialData?.city as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={initialData?.state as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              name="pincode"
              inputMode="numeric"
              maxLength={6}
              placeholder="600001"
              defaultValue={initialData?.pincode as string}
            />
            <p className="text-xs text-muted-foreground">6-digit Indian postal code.</p>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Optional — Education"
        description="Academic information."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Input id="college" name="college" defaultValue={initialData?.college as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input id="course" name="course" defaultValue={initialData?.course as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" defaultValue={initialData?.year as string} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Optional — Study Abroad & Assignment"
        description="University, degree, and lead assignment."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="targetUniversity">Target University</Label>
            <Input
              id="targetUniversity"
              name="targetUniversity"
              value={targetUniversity}
              onChange={(e) => setTargetUniversity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetDegree">Target Degree</Label>
            <Select value={targetDegree} onValueChange={(v) => setTargetDegree(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_DEGREES.map((degree) => (
                  <SelectItem key={degree} value={degree}>
                    {degree}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="targetDegree" value={targetDegree} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedToId">Lead assigned to</Label>
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
        </div>
      </FormSection>

      <FormSection
        title="Optional — Loan & Application"
        description="Loan amounts and application status."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="rounded-lg border bg-white/50 p-3 dark:bg-white/5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Loan amount requested
              </p>
              <div className="mt-1.5">
                <InputGroup className="h-9">
                  <InputGroupAddon align="inline-start" className="border-r border-input pr-1">
                    <Select value={loanCurrency} onValueChange={(v) => setLoanCurrency(v ?? "INR")}>
                      <SelectTrigger className="h-7 w-[4.75rem] border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="loanRequested"
                    name="loanRequested"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    placeholder="Amount"
                    className="text-sm"
                    defaultValue={initialData?.loanRequested as number}
                  />
                </InputGroup>
                <input type="hidden" name="loanCurrency" value={loanCurrency} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lenderId">Lender</Label>
            <Select value={lenderId} onValueChange={(v) => setLenderId(v ?? "")}>
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
          <div className="space-y-2">
            <Label htmlFor="roi">ROI / Interest %</Label>
            <Input
              id="roi"
              name="roi"
              type="number"
              min={0}
              max={100}
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 12.25"
              defaultValue={
                (initialData?.roi as number | undefined) ??
                (initialData?.interest as number | undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processingFee">Processing Fee</Label>
            <Input
              id="processingFee"
              name="processingFee"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              defaultValue={initialData?.processingFee as number}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanSanctioned">Sanctioned Amount</Label>
            <Input
              id="loanSanctioned"
              name="loanSanctioned"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              defaultValue={initialData?.loanSanctioned as number}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanDisbursed">Disbursed Amount</Label>
            <Input
              id="loanDisbursed"
              name="loanDisbursed"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={loanDisbursed}
              onChange={(e) => setLoanDisbursed(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disbursementType">Disbursement Type</Label>
            <Select
              value={disbursementType}
              onValueChange={(value) => setDisbursementType(value ?? "")}
              items={[{ value: "", label: "Not set" }, ...disbursementTypeItems]}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select disbursement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not set</SelectItem>
                {DISBURSEMENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="disbursementType" value={disbursementType} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicationNumber">Bank LAN (Loan Application Number)</Label>
            <Input
              id="applicationNumber"
              name="applicationNumber"
              placeholder="HDFC-LAN-2026-001234"
              defaultValue={initialData?.applicationNumber as string}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ourCommissionPercent">Our Commission % (of disbursement)</Label>
            <Input
              id="ourCommissionPercent"
              name="ourCommissionPercent"
              type="number"
              step="0.01"
              min={0}
              max={100}
              inputMode="decimal"
              placeholder="e.g. 1.6"
              value={ourCommissionPercent}
              onChange={(e) => setOurCommissionPercent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your commission rate from the lender for this student. Amounts calculate automatically from disbursement.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="commissionPercentOverride">Partner Share Override % (of your commission)</Label>
            <Input
              id="commissionPercentOverride"
              name="commissionPercentOverride"
              type="number"
              step="0.01"
              min={0}
              max={100}
              inputMode="decimal"
              placeholder={
                partnerId
                  ? `Leave blank for partner default (${formatPercent(selectedPartner?.commissionPercent ?? 0)})`
                  : "Optional — set after selecting a partner"
              }
              value={partnerShareOverride}
              onChange={(e) => setPartnerShareOverride(e.target.value)}
              disabled={!partnerId}
            />
            <p className="text-xs text-muted-foreground">
              Partner share is calculated from your commission, not disbursement.
            </p>
          </div>
          {Number(loanDisbursed) > 0 && Number(ourCommissionPercent) > 0 ? (
            <div className="rounded-xl border border-[#6D5EF7]/15 bg-[#6D5EF7]/5 p-3 text-sm sm:col-span-2">
              <p className="font-medium text-[#6D5EF7]">Commission preview</p>
              <p className="mt-1 text-muted-foreground">
                Auto-calculated: Expected {formatCurrency(commissionPreview.expected)} · Partner share{" "}
                {formatCurrency(commissionPreview.partnerShare)} · Projected net{" "}
                {formatCurrency(commissionPreview.net)}. Mark received/paid only when money moves.
              </p>
            </div>
          ) : null}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="applicationStatus">Application Status</Label>
            <Select
              value={applicationStatus}
              onValueChange={(value) => setApplicationStatus(value ?? "docs_pending")}
              items={applicationStatusItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select application status" />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="applicationStatus" value={applicationStatus} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" name="remarks" defaultValue={initialData?.remarks as string} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Identity (optional)" description="Government ID details. Optional and stored securely.">
        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Show identity fields
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar</Label>
              <Input
                id="aadhaar"
                name="aadhaar"
                inputMode="numeric"
                maxLength={14}
                placeholder="1234 5678 9012"
                defaultValue={initialData?.aadhaar as string}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">{AADHAAR_HINT}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                name="pan"
                maxLength={10}
                placeholder="ABCDE1234F"
                defaultValue={initialData?.pan as string}
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">{PAN_HINT}</p>
            </div>
          </div>
        </details>
      </FormSection>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Student" : "Update Student"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
