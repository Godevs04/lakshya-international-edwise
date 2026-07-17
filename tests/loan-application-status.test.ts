import { Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { updateLoanApplicationStatus } from "@/lib/services/loan-application.service";

function createStudentWithParallelApplications() {
  const avanseId = new Types.ObjectId();
  const credilaId = new Types.ObjectId();

  const student = {
    applicationStatus: "sanctioned",
    status: "sanctioned",
    loggedIn: true,
    loan: { requested: 0, sanctioned: 0, disbursed: 0, pfPaid: false },
    loanApplications: [
      {
        _id: avanseId,
        lenderId: { _id: new Types.ObjectId(), name: "Avanse" },
        applicationStatus: "sanctioned",
        sentToBank: true,
        isPrimary: true,
        history: [],
      },
      {
        _id: credilaId,
        lenderId: { _id: new Types.ObjectId(), name: "Credila" },
        applicationStatus: "loggedin",
        sentToBank: true,
        isPrimary: false,
        history: [],
      },
    ],
    notes: [],
    save: vi.fn().mockResolvedValue(undefined),
  };

  return { student, avanseId, credilaId };
}

describe("parallel bank PF Paid workflow", () => {
  it("selects the PF Paid bank and closes every other active bank", async () => {
    const { student, avanseId } = createStudentWithParallelApplications();

    await updateLoanApplicationStatus(
      student as never,
      avanseId.toString(),
      "pf_paid"
    );

    expect(student.loanApplications[0]).toMatchObject({
      applicationStatus: "pf_paid",
      isPrimary: true,
    });
    expect(student.loanApplications[1]).toMatchObject({
      applicationStatus: "not_interested",
      isPrimary: false,
    });
    expect(student.loanApplications[1].history.at(-1)).toMatchObject({
      action: "status_updated",
      status: "not_interested",
    });
    expect(student.applicationStatus).toBe("pf_paid");
    expect(student.loan.pfPaid).toBe(true);
    expect(student.save).toHaveBeenCalledOnce();
  });

  it("rejects changes to another bank after PF Paid is recorded", async () => {
    const { student, avanseId, credilaId } = createStudentWithParallelApplications();

    await updateLoanApplicationStatus(
      student as never,
      avanseId.toString(),
      "pf_paid"
    );

    await expect(
      updateLoanApplicationStatus(
        student as never,
        credilaId.toString(),
        "pf_paid"
      )
    ).rejects.toThrow("closed because Avanse has reached PF Paid");
  });
});
