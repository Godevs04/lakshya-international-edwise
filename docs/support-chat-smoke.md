# Support Chat MVP — manual smoke checklist

## Prerequisites
- MongoDB running
- `npm run seed:support-faqs` (or first FAQ load auto-seeds)
- Start with Socket.IO: `npm run dev` (uses `tsx server.ts`)

## Website widget
1. Open marketing homepage — see **Need help?** FAB (above WhatsApp bar).
2. Open widget → popular FAQs load.
3. Tap an FAQ → bot answer → **Yes, thanks** closes; **Chat with advisor** starts qualify.
4. Complete conversational qualify (country → degree → admission → collateral → name → phone → optional email).
5. Conversation opens with system welcome message.
6. Send a visitor message (works via socket or HTTP fallback).

## CRM
1. Login as manager/staff with support permissions.
2. Open **Support** in sidebar (`/dashboard/support`).
3. **Waiting** tab shows the new chat with name/country/degree.
4. **Claim** (staff) or **Assign** (manager) → status moves to Assigned.
5. Reply in the WhatsApp-like pane; visitor sees the message in the widget (realtime if both on custom server).
6. **Resolve** → conversation appears under Resolved.

## Notifications
1. After step 4 of website flow, check CRM notification bell for "New support chat".
2. Assignee gets "Chat assigned to you" after assign/claim.
3. Enquiry email (if `WEBSITE_ENQUIRY_NOTIFY_EMAIL` set) mentions support chat.

## Notes
- `npm run dev:next` / `npm run start:next` run Next without Socket.IO; chat still works via server actions (no typing indicators).
- Docker production CMD uses `npx tsx server.ts` for Next + Socket.IO.
