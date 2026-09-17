const CRM_KEY = "salespilot-crm-state-v1";

const roles = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Sales Manager",
  sales: "Sales Agent"
};

const navItems = [
  ["dashboard", "Dashboard", "layout-dashboard"],
  ["pipeline", "Pipeline", "kanban-square"],
  ["contacts", "Contacts", "users"],
  ["tasks", "Tasks", "check-square"],
  ["subscriptions", "Subscriptions", "credit-card"],
  ["invoices", "Invoices", "receipt"],
  ["tickets", "Support", "life-buoy"],
  ["reports", "Reports", "bar-chart-3"],
  ["users", "Users", "shield-check"],
  ["settings", "Settings", "settings"]
];

const demoUsers = [
  {
    id: "u-super",
    name: "Noorul Ain",
    email: "superadmin@salespilotcrm.com",
    password: "super123",
    role: "super_admin",
    team: "Executive",
    status: "Active"
  },
  {
    id: "u-admin",
    name: "Admin User",
    email: "admin@salespilotcrm.com",
    password: "admin123",
    role: "admin",
    team: "Operations",
    status: "Active"
  },
  {
    id: "u-manager",
    name: "Sales Manager",
    email: "manager@salespilotcrm.com",
    password: "manager123",
    role: "manager",
    team: "Sales",
    status: "Active"
  },
  {
    id: "u-sales",
    name: "Sales Agent",
    email: "sales@salespilotcrm.com",
    password: "sales123",
    role: "sales",
    team: "Sales",
    status: "Active"
  }
];

const seedState = {
  sessionUserId: null,
  view: "dashboard",
  search: "",
  settings: {
    company: "SalesPilot CRM",
    currency: "USD",
    tax: 5,
    salesTarget: 120000,
    securityMode: "Demo login enabled"
  },
  users: demoUsers,
  contacts: [
    { id: "c1", name: "Amina Travel Group", contact: "Amina Khan", email: "amina@example.com", phone: "+971 50 456 2201", source: "Website", owner: "u-manager", status: "Customer", value: 28000 },
    { id: "c2", name: "Metro Clinic", contact: "Dr. Farhan", email: "farhan@example.com", phone: "+971 55 801 3401", source: "Referral", owner: "u-sales", status: "Lead", value: 15000 },
    { id: "c3", name: "Blue Ocean Properties", contact: "Sarah Lee", email: "sarah@example.com", phone: "+971 54 228 9901", source: "Instagram", owner: "u-admin", status: "Prospect", value: 42000 },
    { id: "c4", name: "Nexus Logistics", contact: "Omar Ali", email: "omar@example.com", phone: "+971 52 771 1818", source: "Campaign", owner: "u-sales", status: "Customer", value: 36000 }
  ],
  deals: [
    { id: "d1", title: "Enterprise CRM setup", company: "Amina Travel Group", owner: "u-manager", stage: "Qualified", amount: 28000, probability: 72, due: "2026-09-28" },
    { id: "d2", title: "Clinic support automation", company: "Metro Clinic", owner: "u-sales", stage: "New", amount: 15000, probability: 35, due: "2026-10-02" },
    { id: "d3", title: "Property sales suite", company: "Blue Ocean Properties", owner: "u-admin", stage: "Proposal", amount: 42000, probability: 58, due: "2026-10-08" },
    { id: "d4", title: "Logistics renewal", company: "Nexus Logistics", owner: "u-sales", stage: "Negotiation", amount: 36000, probability: 84, due: "2026-09-24" },
    { id: "d5", title: "Premium onboarding", company: "Amina Travel Group", owner: "u-manager", stage: "Won", amount: 18000, probability: 100, due: "2026-09-14" }
  ],
  tasks: [
    { id: "t1", title: "Call Amina for contract approval", owner: "u-manager", due: "2026-09-18", priority: "High", status: "Open", related: "Amina Travel Group" },
    { id: "t2", title: "Send clinic workflow proposal", owner: "u-sales", due: "2026-09-19", priority: "Medium", status: "Open", related: "Metro Clinic" },
    { id: "t3", title: "Prepare invoice for renewal", owner: "u-admin", due: "2026-09-17", priority: "High", status: "Done", related: "Nexus Logistics" },
    { id: "t4", title: "Update subscription plan benefits", owner: "u-super", due: "2026-09-22", priority: "Low", status: "Open", related: "Internal" }
  ],
  subscriptions: [
    { id: "s1", plan: "Starter", price: 29, interval: "month", customers: 14, status: "Active", features: "Contacts, tasks, email notes" },
    { id: "s2", plan: "Growth", price: 79, interval: "month", customers: 31, status: "Active", features: "Pipeline, reports, team roles" },
    { id: "s3", plan: "Enterprise", price: 199, interval: "month", customers: 9, status: "Active", features: "Admin controls, SLA, custom fields" }
  ],
  invoices: [
    { id: "INV-1001", customer: "Amina Travel Group", amount: 28000, due: "2026-09-30", status: "Sent" },
    { id: "INV-1002", customer: "Nexus Logistics", amount: 36000, due: "2026-09-25", status: "Paid" },
    { id: "INV-1003", customer: "Blue Ocean Properties", amount: 12000, due: "2026-10-06", status: "Draft" }
  ],
  tickets: [
    { id: "TK-121", customer: "Amina Travel Group", issue: "Need another admin seat", priority: "Medium", status: "Open", owner: "u-admin" },
    { id: "TK-122", customer: "Nexus Logistics", issue: "Invoice PDF requested", priority: "Low", status: "Resolved", owner: "u-sales" },
    { id: "TK-123", customer: "Metro Clinic", issue: "Pipeline import question", priority: "High", status: "Open", owner: "u-manager" }
  ],
  activity: [
    { id: "a1", icon: "badge-dollar-sign", text: "Nexus Logistics deal moved to negotiation.", time: "Today, 10:20" },
    { id: "a2", icon: "mail-check", text: "Proposal email logged for Blue Ocean Properties.", time: "Today, 09:45" },
    { id: "a3", icon: "user-plus", text: "Metro Clinic added as a new lead.", time: "Yesterday" }
  ]
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(CRM_KEY);
  if (!saved) return structuredClone(seedState);
  try {
    return { ...structuredClone(seedState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(CRM_KEY, JSON.stringify(state));
}

function id(prefix) {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: state.settings.currency || "USD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function currentUser() {
  return state.users.find((user) => user.id === state.sessionUserId);
}

function canManageUsers() {
  const role = currentUser()?.role;
  return role === "super_admin" || role === "admin";
}

function ownerName(userId) {
  return state.users.find((user) => user.id === userId)?.name || "Unassigned";
}

function setView(view) {
  state.view = view;
  saveState();
  render();
}

function showToast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

function icon(name, size = 18) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
}

function render() {
  const app = document.querySelector("#app");
  if (!currentUser()) {
    app.innerHTML = renderLogin();
    bindLogin();
  } else {
    app.innerHTML = renderShell();
    bindShell();
  }
  if (window.lucide) window.lucide.createIcons();
}

function renderLogin() {
  return `
    <main class="login-page">
      <section class="login-art">
        <div class="brand-lockup"><span class="brand-mark">${icon("layers-3", 22)}</span> SalesPilot CRM</div>
        <div>
          <h1>Sales CRM for fast multitasking teams.</h1>
          <p>Manage leads, customers, tasks, subscriptions, invoices, users, and support in one clean dashboard. Demo access is one click now; replace it with secure backend auth when you are ready.</p>
          <div class="login-stats">
            <div class="login-stat"><strong>360°</strong><span>Customer view</span></div>
            <div class="login-stat"><strong>5</strong><span>Deal stages</span></div>
            <div class="login-stat"><strong>4</strong><span>Demo roles</span></div>
          </div>
        </div>
      </section>
      <section class="login-panel">
        <div class="login-card">
          <h2>Login to CRM</h2>
          <p>Use email and password, or choose a one-click demo role for admin, super admin, manager, or sales access.</p>
          <form id="login-form">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" value="superadmin@salespilotcrm.com" autocomplete="username" required />
            </div>
            <div class="field">
              <label for="password">Password</label>
              <input id="password" type="password" value="super123" autocomplete="current-password" required />
            </div>
            <button class="button" type="submit" style="width:100%">${icon("log-in")} Login</button>
          </form>
          <div class="quick-logins">
            ${demoUsers
              .map(
                (user) => `
              <button class="quick-login" data-login="${user.id}">
                <strong>${roles[user.role]}</strong>
                <span>${user.email} / ${user.password}</span>
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    </main>
  `;
}

function bindLogin() {
  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value;
    const user = state.users.find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user) return showToast("Login failed. Use a demo account for now.");
    state.sessionUserId = user.id;
    state.activity.unshift({ id: id("a"), icon: "log-in", text: `${user.name} logged in.`, time: "Just now" });
    saveState();
    render();
  });
  document.querySelectorAll("[data-login]").forEach((button) => {
    button.addEventListener("click", () => {
      state.sessionUserId = button.dataset.login;
      saveState();
      render();
    });
  });
}

function renderShell() {
  const user = currentUser();
  const availableNav = navItems.filter(([key]) => key !== "users" || canManageUsers());
  const titles = {
    dashboard: ["Command Dashboard", "Live sales activity, revenue, tasks, and customer health."],
    pipeline: ["Sales Pipeline", "Move deals, track probability, and keep each stage clean."],
    contacts: ["Contacts & Leads", "Customer profiles, sources, owners, and lifecycle status."],
    tasks: ["Task Center", "Daily follow-ups and multitasking work queue."],
    subscriptions: ["Subscriptions", "Plans, prices, customer counts, and upgrade options."],
    invoices: ["Invoices", "Create and track billing status for customers."],
    tickets: ["Support Desk", "Customer issues, priority, status, and owner assignment."],
    reports: ["Reports", "Revenue, performance, conversion, and workload overview."],
    users: ["Users & Roles", "Admin and super admin controls for demo users."],
    settings: ["Settings", "Company, currency, tax, target, and demo security mode."]
  };
  const [title, subtitle] = titles[state.view] || titles.dashboard;
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand-lockup"><span class="brand-mark">${icon("layers-3", 22)}</span> SalesPilot CRM</div>
        <span class="role-chip">${icon("sparkles", 14)} ${roles[user.role]}</span>
        <nav class="nav">
          ${availableNav
            .map(
              ([key, label, iconName]) => `
              <button class="${state.view === key ? "active" : ""}" data-view="${key}" title="${label}">
                ${icon(iconName)} <span>${label}</span>
              </button>
            `
            )
            .join("")}
        </nav>
        <div class="sidebar-foot">
          <div class="user-card">
            <strong>${user.name}</strong>
            <span>${user.email}</span>
          </div>
          <button class="button secondary" id="logout">${icon("log-out")} Logout</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div>
            <h1>${title}</h1>
            <p>${subtitle}</p>
          </div>
          <div class="topbar-actions">
            <input class="search-input" id="global-search" placeholder="Search CRM..." value="${state.search || ""}" />
            <button class="button secondary" id="reset-demo">${icon("refresh-cw")} Reset Demo</button>
            <button class="button" id="quick-add">${icon("plus")} Quick Add</button>
          </div>
        </header>
        <section class="content">${renderView()}</section>
      </main>
    </div>
  `;
}

function bindShell() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  document.querySelector("#logout").addEventListener("click", () => {
    state.sessionUserId = null;
    saveState();
    render();
  });
  document.querySelector("#global-search").addEventListener("input", (event) => {
    state.search = event.target.value;
    saveState();
    document.querySelector(".content").innerHTML = renderView();
    bindView();
    if (window.lucide) window.lucide.createIcons();
  });
  document.querySelector("#quick-add").addEventListener("click", () => openModal("contact"));
  document.querySelector("#reset-demo").addEventListener("click", () => {
    const sessionUserId = state.sessionUserId;
    state = structuredClone(seedState);
    state.sessionUserId = sessionUserId;
    saveState();
    render();
    showToast("Demo data reset");
  });
  bindView();
}

function renderView() {
  const views = {
    dashboard: renderDashboard,
    pipeline: renderPipeline,
    contacts: renderContacts,
    tasks: renderTasks,
    subscriptions: renderSubscriptions,
    invoices: renderInvoices,
    tickets: renderTickets,
    reports: renderReports,
    users: renderUsers,
    settings: renderSettings
  };
  return (views[state.view] || renderDashboard)();
}

function filtered(items, fields) {
  const term = (state.search || "").trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) => fields.some((field) => String(item[field] || "").toLowerCase().includes(term)));
}

function metric(label, value, iconName, trend) {
  return `
    <article class="metric">
      <div class="metric-top"><div><span>${label}</span><strong>${value}</strong></div><div class="iconbox">${icon(iconName)}</div></div>
      <div class="trend">${trend}</div>
    </article>
  `;
}

function renderDashboard() {
  const openDeals = state.deals.filter((deal) => deal.stage !== "Won" && deal.stage !== "Lost");
  const revenue = state.deals.filter((deal) => deal.stage === "Won").reduce((sum, deal) => sum + Number(deal.amount), 0);
  const pipeline = openDeals.reduce((sum, deal) => sum + Number(deal.amount), 0);
  const openTasks = state.tasks.filter((task) => task.status !== "Done").length;
  return `
    <div class="grid cols-4">
      ${metric("Won Revenue", money(revenue), "badge-dollar-sign", "+18% this month")}
      ${metric("Open Pipeline", money(pipeline), "chart-no-axes-combined", `${openDeals.length} active deals`)}
      ${metric("Customers", state.contacts.filter((item) => item.status === "Customer").length, "building-2", "Healthy customer base")}
      ${metric("Open Tasks", openTasks, "list-checks", "Due work queue")}
    </div>
    <div class="grid cols-2" style="margin-top:16px">
      <section class="panel">
        <div class="panel-title"><div><h2>Pipeline Snapshot</h2><p>Deal value by stage</p></div><button class="button small secondary" data-view-jump="pipeline">${icon("kanban-square")} Open</button></div>
        ${renderMiniPipeline()}
      </section>
      <section class="panel">
        <div class="panel-title"><div><h2>Today Work Queue</h2><p>Follow-ups for the team</p></div><button class="button small" data-modal="task">${icon("plus")} Task</button></div>
        <div class="split-list">${state.tasks.slice(0, 5).map(taskCard).join("")}</div>
      </section>
    </div>
    <div class="grid cols-2" style="margin-top:16px">
      <section class="panel">
        <div class="panel-title"><div><h2>Recent Activity</h2><p>Latest CRM updates</p></div></div>
        <div class="split-list">${state.activity.slice(0, 6).map(activityItem).join("")}</div>
      </section>
      <section class="panel">
        <div class="panel-title"><div><h2>Subscription Health</h2><p>Plans and customer distribution</p></div><button class="button small secondary" data-view-jump="subscriptions">${icon("credit-card")} Open</button></div>
        <div class="subscription-grid">${state.subscriptions.map(subscriptionCard).join("")}</div>
      </section>
    </div>
  `;
}

function renderMiniPipeline() {
  const stages = ["New", "Qualified", "Proposal", "Negotiation", "Won"];
  return `<div class="chart">${stages
    .map((stage) => {
      const total = state.deals.filter((deal) => deal.stage === stage).reduce((sum, deal) => sum + Number(deal.amount), 0);
      const height = Math.max(24, Math.min(220, total / 260));
      return `<div class="bar"><div style="height:${height}px"></div><strong>${money(total)}</strong><span>${stage}</span></div>`;
    })
    .join("")}</div>`;
}

function renderPipeline() {
  const stages = ["New", "Qualified", "Proposal", "Negotiation", "Won"];
  return `
    <section class="panel">
      <div class="panel-title">
        <div><h2>Pipeline Board</h2><p>Update stage from each deal card.</p></div>
        <button class="button" data-modal="deal">${icon("plus")} Add Deal</button>
      </div>
      <div class="pipeline">
        ${stages
          .map((stage) => {
            const deals = filtered(state.deals, ["title", "company", "stage"]).filter((deal) => deal.stage === stage);
            return `<div class="stage"><h3>${stage}<span class="tag">${deals.length}</span></h3>${deals.map(dealCard).join("") || `<p class="muted">No deals here.</p>`}</div>`;
          })
          .join("")}
      </div>
    </section>
  `;
}

function dealCard(deal) {
  return `
    <article class="deal-card">
      <strong>${deal.title}</strong>
      <span class="muted">${deal.company}</span>
      <div class="card-meta"><span>${money(deal.amount)}</span><span>${deal.probability}%</span></div>
      <div class="card-meta"><span>${ownerName(deal.owner)}</span><span>Due ${deal.due}</span></div>
      <select data-deal-stage="${deal.id}">
        ${["New", "Qualified", "Proposal", "Negotiation", "Won"].map((stage) => `<option ${deal.stage === stage ? "selected" : ""}>${stage}</option>`).join("")}
      </select>
    </article>
  `;
}

function renderContacts() {
  const contacts = filtered(state.contacts, ["name", "contact", "email", "phone", "source", "status"]);
  return renderTablePanel(
    "Contacts & Leads",
    "Customers, leads, prospects, owners, and deal value.",
    "contact",
    ["Company", "Contact", "Email", "Phone", "Source", "Owner", "Status", "Value", "Actions"],
    contacts
      .map(
        (item) => `
        <tr>
          <td><span class="row-title">${item.name}</span></td>
          <td>${item.contact}</td>
          <td>${item.email}</td>
          <td>${item.phone}</td>
          <td>${item.source}</td>
          <td>${ownerName(item.owner)}</td>
          <td>${pill(item.status)}</td>
          <td>${money(item.value)}</td>
          <td class="actions"><button class="button small secondary" data-edit-contact="${item.id}">${icon("pencil", 14)}</button><button class="button small danger" data-delete-contact="${item.id}">${icon("trash-2", 14)}</button></td>
        </tr>`
      )
      .join("")
  );
}

function renderTasks() {
  const tasks = filtered(state.tasks, ["title", "priority", "status", "related"]);
  return `
    <section class="panel">
      <div class="panel-title">
        <div><h2>Task Center</h2><p>Multitasking follow-up board for sales and admin teams.</p></div>
        <button class="button" data-modal="task">${icon("plus")} Add Task</button>
      </div>
      <div class="split-list">${tasks.map(taskCard).join("")}</div>
    </section>
  `;
}

function taskCard(task) {
  return `
    <article class="task-card">
      <input type="checkbox" ${task.status === "Done" ? "checked" : ""} data-task-toggle="${task.id}" />
      <div>
        <strong>${task.title}</strong>
        <div class="card-meta"><span>${task.related}</span><span>${ownerName(task.owner)} · Due ${task.due}</span></div>
      </div>
      ${pill(task.priority)}
    </article>
  `;
}

function renderSubscriptions() {
  return `
    <section class="panel">
      <div class="panel-title">
        <div><h2>Subscription Plans</h2><p>Create plans now; connect payment gateway later.</p></div>
        <button class="button" data-modal="subscription">${icon("plus")} Add Plan</button>
      </div>
      <div class="subscription-grid">${state.subscriptions.map(subscriptionCard).join("")}</div>
    </section>
  `;
}

function subscriptionCard(plan) {
  return `
    <article class="subscription-card">
      <div class="card-meta"><strong>${plan.plan}</strong>${pill(plan.status)}</div>
      <div class="price">${money(plan.price)}<span class="muted" style="font-size:14px">/${plan.interval}</span></div>
      <span class="muted">${plan.features}</span>
      <strong>${plan.customers} customers</strong>
    </article>
  `;
}

function renderInvoices() {
  return renderTablePanel(
    "Invoices",
    "Billing records and payment status.",
    "invoice",
    ["Invoice", "Customer", "Amount", "Due", "Status", "Actions"],
    filtered(state.invoices, ["id", "customer", "status"])
      .map(
        (item) => `
        <tr>
          <td><span class="row-title">${item.id}</span></td>
          <td>${item.customer}</td>
          <td>${money(item.amount)}</td>
          <td>${item.due}</td>
          <td>${pill(item.status)}</td>
          <td class="actions"><button class="button small secondary" data-invoice-paid="${item.id}">${icon("check", 14)} Paid</button></td>
        </tr>`
      )
      .join("")
  );
}

function renderTickets() {
  return renderTablePanel(
    "Support Tickets",
    "Customer requests with priority and owner tracking.",
    "ticket",
    ["Ticket", "Customer", "Issue", "Priority", "Owner", "Status", "Actions"],
    filtered(state.tickets, ["id", "customer", "issue", "priority", "status"])
      .map(
        (item) => `
        <tr>
          <td><span class="row-title">${item.id}</span></td>
          <td>${item.customer}</td>
          <td>${item.issue}</td>
          <td>${pill(item.priority)}</td>
          <td>${ownerName(item.owner)}</td>
          <td>${pill(item.status)}</td>
          <td class="actions"><button class="button small secondary" data-ticket-resolve="${item.id}">${icon("check", 14)} Resolve</button></td>
        </tr>`
      )
      .join("")
  );
}

function renderReports() {
  const won = state.deals.filter((deal) => deal.stage === "Won").reduce((sum, deal) => sum + Number(deal.amount), 0);
  const target = Number(state.settings.salesTarget) || 1;
  const completion = Math.min(100, Math.round((won / target) * 100));
  return `
    <div class="grid cols-3">
      ${metric("Target Completion", `${completion}%`, "target", `${money(won)} won of ${money(target)}`)}
      ${metric("Average Deal", money(state.deals.reduce((sum, deal) => sum + Number(deal.amount), 0) / state.deals.length), "calculator", "Across all active deals")}
      ${metric("Support Open", state.tickets.filter((ticket) => ticket.status !== "Resolved").length, "life-buoy", "Needs attention")}
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-title"><div><h2>Revenue Report</h2><p>Pipeline and won revenue by stage.</p></div></div>
      ${renderMiniPipeline()}
    </section>
  `;
}

function renderUsers() {
  if (!canManageUsers()) return `<section class="panel"><h2>No access</h2><p class="muted">Only admin and super admin can manage users.</p></section>`;
  return renderTablePanel(
    "Users & Roles",
    "Demo accounts for one-click login. Replace with secure backend auth later.",
    "user",
    ["Name", "Email", "Role", "Team", "Status"],
    state.users
      .map(
        (item) => `
        <tr>
          <td><span class="row-title">${item.name}</span></td>
          <td>${item.email}</td>
          <td>${roles[item.role]}</td>
          <td>${item.team}</td>
          <td>${pill(item.status)}</td>
        </tr>`
      )
      .join("")
  );
}

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-title"><div><h2>CRM Settings</h2><p>Demo settings are saved in browser storage.</p></div></div>
      <form id="settings-form" class="form-grid">
        <div class="field"><label>Company Name</label><input name="company" value="${state.settings.company}" /></div>
        <div class="field"><label>Currency</label><select name="currency"><option ${state.settings.currency === "USD" ? "selected" : ""}>USD</option><option ${state.settings.currency === "AED" ? "selected" : ""}>AED</option><option ${state.settings.currency === "GBP" ? "selected" : ""}>GBP</option><option ${state.settings.currency === "EUR" ? "selected" : ""}>EUR</option></select></div>
        <div class="field"><label>Tax %</label><input name="tax" type="number" value="${state.settings.tax}" /></div>
        <div class="field"><label>Sales Target</label><input name="salesTarget" type="number" value="${state.settings.salesTarget}" /></div>
        <div class="field span-2"><label>Security Mode</label><input name="securityMode" value="${state.settings.securityMode}" /></div>
        <div class="span-2"><button class="button" type="submit">${icon("save")} Save Settings</button></div>
      </form>
    </section>
  `;
}

function renderTablePanel(title, subtitle, type, headers, rows) {
  return `
    <section class="table-panel">
      <div class="table-toolbar">
        <div><strong>${title}</strong><div class="muted">${subtitle}</div></div>
        <button class="button" data-modal="${type}">${icon("plus")} Add</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead>
          <tbody>${rows || `<tr><td colspan="${headers.length}" class="muted">No records found.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function activityItem(item) {
  return `
    <article class="feed-item">
      <div class="iconbox">${icon(item.icon, 16)}</div>
      <div><strong>${item.text}</strong><div class="muted">${item.time}</div></div>
    </article>
  `;
}

function pill(value) {
  const lower = String(value).toLowerCase();
  const color = lower.includes("active") || lower.includes("paid") || lower.includes("done") || lower.includes("customer") || lower.includes("won") || lower.includes("resolved") ? "green" : lower.includes("high") || lower.includes("overdue") ? "red" : lower.includes("medium") || lower.includes("sent") || lower.includes("proposal") ? "amber" : lower.includes("low") || lower.includes("lead") ? "cyan" : "";
  return `<span class="status-pill ${color}">${value}</span>`;
}

function bindView() {
  document.querySelectorAll("[data-modal]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.modal)));
  document.querySelectorAll("[data-view-jump]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.viewJump)));
  document.querySelectorAll("[data-deal-stage]").forEach((select) => {
    select.addEventListener("change", () => {
      const deal = state.deals.find((item) => item.id === select.dataset.dealStage);
      deal.stage = select.value;
      deal.probability = select.value === "Won" ? 100 : deal.probability;
      state.activity.unshift({ id: id("a"), icon: "kanban-square", text: `${deal.title} moved to ${select.value}.`, time: "Just now" });
      saveState();
      render();
      showToast("Deal updated");
    });
  });
  document.querySelectorAll("[data-task-toggle]").forEach((box) => {
    box.addEventListener("change", () => {
      const task = state.tasks.find((item) => item.id === box.dataset.taskToggle);
      task.status = box.checked ? "Done" : "Open";
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-delete-contact]").forEach((button) => {
    button.addEventListener("click", () => {
      state.contacts = state.contacts.filter((item) => item.id !== button.dataset.deleteContact);
      saveState();
      render();
      showToast("Contact deleted");
    });
  });
  document.querySelectorAll("[data-edit-contact]").forEach((button) => button.addEventListener("click", () => openModal("contact", button.dataset.editContact)));
  document.querySelectorAll("[data-invoice-paid]").forEach((button) => {
    button.addEventListener("click", () => {
      state.invoices.find((item) => item.id === button.dataset.invoicePaid).status = "Paid";
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-ticket-resolve]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tickets.find((item) => item.id === button.dataset.ticketResolve).status = "Resolved";
      saveState();
      render();
    });
  });
  const settingsForm = document.querySelector("#settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(settingsForm));
      state.settings = { ...state.settings, ...data, tax: Number(data.tax), salesTarget: Number(data.salesTarget) };
      saveState();
      render();
      showToast("Settings saved");
    });
  }
}

function openModal(type, editId = null) {
  const config = modalConfig(type, editId);
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <form id="modal-form">
        <div class="modal-head"><h2>${config.title}</h2><button class="button ghost" type="button" data-close>${icon("x")}</button></div>
        <div class="modal-body"><div class="form-grid">${config.fields.map(fieldHtml).join("")}</div></div>
        <div class="modal-foot"><button class="button secondary" type="button" data-close>Cancel</button><button class="button" type="submit">${icon("save")} Save</button></div>
      </form>
    </div>
  `;
  document.body.appendChild(backdrop);
  if (window.lucide) window.lucide.createIcons();
  backdrop.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => backdrop.remove()));
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  backdrop.querySelector("#modal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    config.save(data);
    backdrop.remove();
    saveState();
    render();
    showToast("Saved");
  });
}

function fieldHtml(field) {
  const value = field.value ?? "";
  const cls = field.span ? "field span-2" : "field";
  if (field.type === "select") {
    return `<div class="${cls}"><label>${field.label}</label><select name="${field.name}">${field.options.map((option) => `<option value="${option.value || option}" ${String(value) === String(option.value || option) ? "selected" : ""}>${option.label || option}</option>`).join("")}</select></div>`;
  }
  if (field.type === "textarea") {
    return `<div class="${cls}"><label>${field.label}</label><textarea name="${field.name}">${value}</textarea></div>`;
  }
  return `<div class="${cls}"><label>${field.label}</label><input name="${field.name}" type="${field.type || "text"}" value="${value}" ${field.required ? "required" : ""} /></div>`;
}

function modalConfig(type, editId) {
  const ownerOptions = state.users.map((user) => ({ value: user.id, label: `${user.name} (${roles[user.role]})` }));
  if (type === "contact") {
    const item = state.contacts.find((contact) => contact.id === editId) || {};
    return {
      title: editId ? "Edit Contact" : "Add Contact",
      fields: [
        { label: "Company", name: "name", value: item.name, required: true },
        { label: "Contact Person", name: "contact", value: item.contact, required: true },
        { label: "Email", name: "email", type: "email", value: item.email },
        { label: "Phone", name: "phone", value: item.phone },
        { label: "Source", name: "source", value: item.source || "Website" },
        { label: "Owner", name: "owner", type: "select", value: item.owner || currentUser().id, options: ownerOptions },
        { label: "Status", name: "status", type: "select", value: item.status || "Lead", options: ["Lead", "Prospect", "Customer"] },
        { label: "Value", name: "value", type: "number", value: item.value || 0 }
      ],
      save: (data) => {
        const payload = { ...data, value: Number(data.value) || 0 };
        if (editId) Object.assign(state.contacts.find((contact) => contact.id === editId), payload);
        else state.contacts.unshift({ id: id("c"), ...payload });
      }
    };
  }
  if (type === "deal") {
    return {
      title: "Add Deal",
      fields: [
        { label: "Deal Title", name: "title", required: true },
        { label: "Company", name: "company", required: true },
        { label: "Owner", name: "owner", type: "select", value: currentUser().id, options: ownerOptions },
        { label: "Stage", name: "stage", type: "select", value: "New", options: ["New", "Qualified", "Proposal", "Negotiation", "Won"] },
        { label: "Amount", name: "amount", type: "number", value: 10000 },
        { label: "Probability", name: "probability", type: "number", value: 40 },
        { label: "Due Date", name: "due", type: "date" }
      ],
      save: (data) => state.deals.unshift({ id: id("d"), ...data, amount: Number(data.amount) || 0, probability: Number(data.probability) || 0 })
    };
  }
  if (type === "task") {
    return {
      title: "Add Task",
      fields: [
        { label: "Task", name: "title", span: true, required: true },
        { label: "Owner", name: "owner", type: "select", value: currentUser().id, options: ownerOptions },
        { label: "Due Date", name: "due", type: "date" },
        { label: "Priority", name: "priority", type: "select", value: "Medium", options: ["Low", "Medium", "High"] },
        { label: "Related To", name: "related", value: "Internal" }
      ],
      save: (data) => state.tasks.unshift({ id: id("t"), ...data, status: "Open" })
    };
  }
  if (type === "subscription") {
    return {
      title: "Add Subscription Plan",
      fields: [
        { label: "Plan", name: "plan", required: true },
        { label: "Price", name: "price", type: "number", value: 49 },
        { label: "Interval", name: "interval", type: "select", value: "month", options: ["month", "year"] },
        { label: "Customers", name: "customers", type: "number", value: 0 },
        { label: "Features", name: "features", span: true, value: "Contacts, tasks, reports" },
        { label: "Status", name: "status", type: "select", value: "Active", options: ["Active", "Paused"] }
      ],
      save: (data) => state.subscriptions.unshift({ id: id("s"), ...data, price: Number(data.price) || 0, customers: Number(data.customers) || 0 })
    };
  }
  if (type === "invoice") {
    return {
      title: "Add Invoice",
      fields: [
        { label: "Customer", name: "customer", required: true },
        { label: "Amount", name: "amount", type: "number", value: 1000 },
        { label: "Due Date", name: "due", type: "date" },
        { label: "Status", name: "status", type: "select", value: "Draft", options: ["Draft", "Sent", "Paid"] }
      ],
      save: (data) => state.invoices.unshift({ id: `INV-${Math.floor(1000 + Math.random() * 9000)}`, ...data, amount: Number(data.amount) || 0 })
    };
  }
  if (type === "ticket") {
    return {
      title: "Add Support Ticket",
      fields: [
        { label: "Customer", name: "customer", required: true },
        { label: "Owner", name: "owner", type: "select", value: currentUser().id, options: ownerOptions },
        { label: "Issue", name: "issue", span: true, required: true },
        { label: "Priority", name: "priority", type: "select", value: "Medium", options: ["Low", "Medium", "High"] },
        { label: "Status", name: "status", type: "select", value: "Open", options: ["Open", "Resolved"] }
      ],
      save: (data) => state.tickets.unshift({ id: `TK-${Math.floor(100 + Math.random() * 900)}`, ...data })
    };
  }
  if (type === "user") {
    return {
      title: "Add User",
      fields: [
        { label: "Name", name: "name", required: true },
        { label: "Email", name: "email", type: "email", required: true },
        { label: "Password", name: "password", value: "demo123" },
        { label: "Role", name: "role", type: "select", value: "sales", options: Object.entries(roles).map(([value, label]) => ({ value, label })) },
        { label: "Team", name: "team", value: "Sales" },
        { label: "Status", name: "status", type: "select", value: "Active", options: ["Active", "Paused"] }
      ],
      save: (data) => state.users.unshift({ id: id("u"), ...data })
    };
  }
  return modalConfig("contact");
}

render();
