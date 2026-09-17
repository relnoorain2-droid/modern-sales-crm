# SalesPilot CRM

A browser-local CRM demo with role-specific access, sales pipelines, customer history, follow-ups, itemized invoice PDFs, payment records, support conversations, reminder drafts and data import/export. See [AUDIT.md](AUDIT.md) for implemented features and the planned Cloudflare backend.

## Demo Logins

Use any of these one-click demo accounts on the login screen:

- Super Admin: `superadmin@salespilotcrm.com` / `super123`
- Admin: `admin@salespilotcrm.com` / `admin123`
- Sales Manager: `manager@salespilotcrm.com` / `manager123`
- Sales Agent: `sales@salespilotcrm.com` / `sales123`

This demo stores data in the browser with `localStorage`. Replace the local auth and storage layer with a secure backend before using it for real customers.

## Run Locally

```bash
npm test
npm run test:browser
npm run dev
```

Then open `http://127.0.0.1:8787`.

Run `npm ci` to install development dependencies. PDF, CSV and icon libraries are pinned and checked into `vendor/` so the published demo does not need npm or an external JavaScript CDN. After a dependency update, run `npm run vendor` and commit the updated assets. Browser tests use locally installed Microsoft Edge.

Invoices download directly as PDF files. Email/WhatsApp reminders open a prefilled draft in your own messaging app; sending is manual. Scheduled drafts do not send in the background. No Cloudflare account is required for this demo.

## GitHub Pages

GitHub Pages publishes from the `gh-pages` branch, using the repository root (`/`).
In Settings > Pages, select "Deploy from a branch", then `gh-pages` and `/ (root)`.

After committing and testing changes on `main`, publish them with:

```bash
git push origin main
git push origin main:gh-pages
```

Live URL: https://relnoorain2-droid.github.io/modern-sales-crm/
