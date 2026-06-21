"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { STUDENT_STATUSES } from "@/lib/constants/statuses";
import { createStudentAction, updateStudentAction } from "@/lib/actions/student.actions";

interface PartnerOption {
  _id: string;
  companyName: string;
}

interface StudentFormProps {
  partners: PartnerOption[];
  initialData?: Record<string, string | number | undefined>;
  studentId?: string;
  mode: "create" | "edit";
}

const PHONE_HINT = "10-digit Indian mobile (starts with 6–9). +91 prefix optional.";
const AADHAAR_HINT = "Exactly 12 digits, numbers only.";
const PAN_HINT = "Format: ABCDE1234F (5 letters, 4 digits, 1 letter).";

export function StudentForm({ partners, initialData, studentId, mode }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState((initialData?.gender as string) ?? "");
  const [partnerId, setPartnerId] = useState((initialData?.partnerId as string) ?? "");
  const [status, setStatus] = useState((initialData?.status as string) ?? "new");

  const selectedPartner = partners.find((p) => p._id === partnerId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result =
      mode === "create"
        ? await createStudentAction(formData)
        : await updateStudentAction(studentId!, formData);

    if (result.success) {
      toast.success(mode === "create" ? "Student created" : "Student updated");
      router.push(
        mode === "create"
          ? `/dashboard/students/${result.data?.id}`
          : `/dashboard/students/${studentId}`
      );
      router.refresh();
    } else {
      toast.error(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection
        title="Required Fields"
        description="Fields marked with * must be completed before saving."
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
        </div>
      </FormSection>

      <FormSection
        title="Optional — Personal & Contact"
        description="Additional profile details. All fields in this section are optional."
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="9363047040"
              defaultValue={initialData?.phone as string}
            />
            <p className="text-xs text-muted-foreground">{PHONE_HINT}</p>
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
          <div className="space-y-2 sm:col-span-2">
            <ImageUploadField
              name="photo"
              label="Photo"
              folder="students"
              defaultValue={(initialData?.photo as string) ?? ""}
              hint="JPEG, PNG, or WebP up to 10 MB."
            />
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
        title="Optional — Documents & Education"
        description="Identity and academic information."
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
        title="Optional — Loan & Application"
        description="Loan amounts, partner assignment, and application status."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="loanRequested">Loan Amount Requested</Label>
            <Input
              id="loanRequested"
              name="loanRequested"
              type="number"
              defaultValue={initialData?.loanRequested as number}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanSanctioned">Sanctioned Amount</Label>
            <Input
              id="loanSanctioned"
              name="loanSanctioned"
              type="number"
              defaultValue={initialData?.loanSanctioned as number}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanDisbursed">Disbursed Amount</Label>
            <Input
              id="loanDisbursed"
              name="loanDisbursed"
              type="number"
              defaultValue={initialData?.loanDisbursed as number}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest">Interest %</Label>
            <Input
              id="interest"
              name="interest"
              type="number"
              defaultValue={initialData?.interest as number}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" name="bankName" defaultValue={initialData?.bankName as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicationNumber">Application Number</Label>
            <Input
              id="applicationNumber"
              name="applicationNumber"
              defaultValue={initialData?.applicationNumber as string}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnerId">Partner</Label>
            <Select value={partnerId} onValueChange={(v) => setPartnerId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select partner">
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
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "new")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STUDENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="status" value={status} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" name="remarks" defaultValue={initialData?.remarks as string} />
          </div>
        </div>
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
