# CRM functional audit

## Implemented for the browser-local demo

- Role-specific navigation and action guards: Super Admin, Admin, Manager, Sales Agent.
- Sales Agents see and change their assigned contacts, deals, tasks, tickets and drafts.
- Managers manage team sales, support, reminders and reports. No billing, settings or user administration.
- Admin manages billing, company settings and Manager/Sales accounts. Cannot change Admin/Super Admin accounts, reset or restore data.
- Super Admin manages all demo accounts, roles, reset and restore. Self-demotion and self-pausing are blocked.
- New account creation, unique email validation, password changes and paused-account login blocking.
- Contact editing, customer notes, related deal/task/invoice/ticket history and CSV import/export.
- Deal editing, six stages including Lost, weighted pipeline and deal-to-invoice conversion.
- Task editing, completion, overdue filter, assignment and calendar event downloads.
- Itemized invoices, quantity/rate, tax, discount, currency snapshot, preview and real PDF file download.
- Partial and full payment records, balance tracking, automatic overdue status and payment history.
- Paid/partially paid invoices are locked against editing; invoices can be voided before payment.
- Email and WhatsApp drafts with prefilled customer details, dates and a visible reminder queue.
- Messaging opens the user's client. Opened is recorded, never a fabricated Sent/Delivered status.
- Tickets support assigned owners, priorities, target dates, description, internal notes, logged customer replies, status history, resolution and reopening.
- Subscription plan editing and pausing, monthly-equivalent revenue calculation, sales reports and CSV downloads.
- Company billing details, JSON backup/restore, import size checks, duplicate-email skipping, escaped user text and spreadsheet formula protection.
- Existing browser data migrates without changing historical invoice totals.
- Screenshot modules: separate lead/customer views, product/SKU/pricing catalog, catalog items in invoices and quotations, quotation PDF and accepted-quote conversion with duplicate prevention, order tracking, payment ledger and expense records.
- Monthly calendar with tasks and meetings, meeting owner/conflict validation, calendar export, full activity timeline, notifications for due work, and persisted light/dark theme.
- Dashboard year selector, monthly income/expense chart and data table, recorded cash-basis profit and order value. Mixed invoice currencies are not summed; only the selected company currency is included in cash reporting.

## Boundaries agreed for this release

Everything is stored in localStorage on the current browser and origin. Role guards demonstrate the intended access model but are not server-enforced security. Demo passwords are stored locally. Do not use real customer data or reuse a real password.

Email uses mailto; WhatsApp uses click-to-chat. The user reviews and sends in their own app. There is no background scheduler, automatic delivery, delivery receipt, inbound email ingestion or WhatsApp inbox synchronization. PDFs are downloaded separately and can be attached manually.

Payment records and subscription counts are entered manually. There is no payment processor, automatic recurring billing, subscription entitlement enforcement or bank reconciliation.

Backups include business records and company settings but exclude accounts/passwords. Restoring keeps current accounts; records assigned to an account absent in another browser appear unassigned and can be reassigned by a manager/admin. Company currency changes do not perform foreign exchange conversion; invoice currencies stay fixed.

The PDF uses built-in Latin fonts. Additional font embedding is needed for Arabic and other non-Latin PDF text.

## Deferred Cloudflare phase

1. Workers API and D1 migrations for tenants, users, contacts, deals, tasks, invoices/items/payments, tickets/comments and reminders.
2. Server sessions, password hashing or an identity provider, password reset, server-enforced roles and tenant/record ownership.
3. Email provider and WhatsApp Business Platform credentials stored as Worker secrets; webhooks and queue-based retries.
4. Scheduled reminders through Cron Triggers/Queues with explicit consent and delivery logs.
5. R2 attachments and invoice storage with authenticated access.
6. Payment provider checkout, verified webhooks, recurring subscriptions and entitlement rules.
7. Operational audit trail, database backups, rate limiting and monitoring.

Cloudflare resources are intentionally not provisioned for this demo release.

## Verification

Run `npm test` for invoice, messaging and backup validation tests. Run `npm run test:browser` for real browser tests covering views, responsive fit, PDFs, payments, login/account lifecycle, role isolation, support conversations, reminders, CSV safety, backup restore, calendar files and record editing.
