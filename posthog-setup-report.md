<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the Lakshya International Edwise CRM platform. The integration covers client-side analytics initialization via Next.js instrumentation-client, a reverse proxy through Next.js rewrites to avoid ad blockers, server-side event capture for critical loan pipeline milestones, and client-side capture for all key marketing lead and authentication flows. User identification is wired into the login flow so sessions are correlated with authenticated users from the moment they sign in.

| Event name | Description | File |
|---|---|---|
| `user_signed_in` | Fired when a dashboard user successfully signs in via the login form. | `components/auth/login-form.tsx` |
| `contact_form_submitted` | Fired when a website visitor successfully submits the contact/enquiry form. | `components/marketing/forms/contact-form.tsx` |
| `partner_lead_submitted` | Fired when someone submits the become-a-partner enquiry form on the marketing site. | `components/marketing/forms/partner-lead-form.tsx` |
| `eligibility_check_started` | Fired when a visitor advances past step 1 (contact details) in the eligibility check modal. | `components/marketing/eligibility/eligibility-modal.tsx` |
| `eligibility_check_completed` | Fired when a visitor successfully completes and submits the full eligibility check form. | `components/marketing/eligibility/eligibility-modal.tsx` |
| `student_created` | Fired server-side whenever a new student record is created by a dashboard user. | `lib/actions/student.actions.ts` |
| `student_sent_to_bank` | Fired server-side when a student loan application is marked as sent to the bank. | `lib/actions/student.actions.ts` |
| `loan_application_status_updated` | Fired server-side whenever a loan application status milestone is updated for a student. | `lib/actions/student.actions.ts` |
| `loan_disbursed` | Fired server-side when a loan disbursement amount is recorded for a student. | `lib/actions/student.actions.ts` |
| `admission_lead_created` | Fired server-side when a new admission lead is created in the dashboard. | `lib/actions/student.actions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/508776/dashboard/1835888)
- [Marketing leads funnel (wizard)](https://us.posthog.com/project/508776/insights/4VjeCtGb)
- [Marketing enquiries over time (wizard)](https://us.posthog.com/project/508776/insights/F7dsaidI)
- [Student loan pipeline (wizard)](https://us.posthog.com/project/508776/insights/1HEbqVxH)
- [Loan conversion funnel (wizard)](https://us.posthog.com/project/508776/insights/ialAp4Wm)
- [Dashboard user sign-ins (wizard)](https://us.posthog.com/project/508776/insights/AqKyvYnd)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any team bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `identify` fires only on fresh login. Consider calling `identify` on the session refresh path (e.g. in the NextAuth session callback or on page load when a session already exists) so returning visitors are not left on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
