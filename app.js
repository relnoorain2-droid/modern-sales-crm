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
  ["leads", "Leads", "user-round-plus"],
  ["customers", "Customers", "building-2"],
  ["products", "Products & Pricing", "package"],
  ["quotations", "Quotations", "file-text"],
  ["orders", "Orders", "shopping-bag"],
  ["tasks", "Tasks", "check-square"],
  ["messages", "Reminders", "send"],
  ["subscriptions", "Subscriptions", "credit-card"],
  ["invoices", "Invoices", "receipt"],
  ["payments", "Payments", "wallet"],
  ["expenses", "Expenses", "banknote"],
  ["calendar", "Calendar & Meetings", "calendar-days"],
  ["timeline", "Activity Timeline", "history"],
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
  return state.users.find((user) => user.id === state.sessionUserId && user.status === "Active");
}

function canManageUsers() {
  const role = currentUser()?.role;
  return role === "super_admin" || role === "admin";
}

function ownerName(userId) {
  return state.users.find((user) => user.id === userId)?.name || "Unassigned";
}

function setView(view) {
  if (!allowed(view)) return showToast("Your role cannot access this section.");
  state.view = view;
  state.search = "";
  viewFilter = "All";
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
    if (!allowed(state.view)) state.view = "dashboard";
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
    const user = state.users.find((item) => item.email.toLowerCase() === email && item.password === password && item.status === "Active");
    if (!user) return showToast("Login failed. Use a demo account for now.");
    state.sessionUserId = user.id;
    state.activity.unshift({ id: id("a"), icon: "log-in", text: `${user.name} logged in.`, time: "Just now" });
    saveState();
    render();
  });
  document.querySelectorAll("[data-login]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.users.some(user => user.id === button.dataset.login && user.status === "Active")) return showToast("This account is paused.");
      state.sessionUserId = button.dataset.login;
      saveState();
      render();
    });
  });
}

function renderShell() {
  const user = currentUser();
  const availableNav = navItems.filter(([key]) => allowed(key));
  const titles = {
    dashboard: ["Command Dashboard", "Live sales activity, revenue, tasks, and customer health."],
    pipeline: ["Sales Pipeline", "Move deals, track probability, and keep each stage clean."],
    contacts: ["Contacts & Leads", "Customer profiles, sources, owners, and lifecycle status."],
    tasks: ["Task Center", "Daily follow-ups and multitasking work queue."],
    messages: ["Reminders", "Drafts and scheduled follow-ups"],
    subscriptions: ["Subscriptions", "Plans, prices, customer counts, and upgrade options."],
    invoices: ["Invoices", "Create and track billing status for customers."],
    tickets: ["Support Desk", "Customer issues, priority, status, and owner assignment."],
    reports: ["Reports", "Revenue, performance, conversion, and workload overview."],
    users: ["Users & Roles", "Admin and super admin controls for demo users."],
    settings: ["Settings", "Company, currency, tax, target, and demo security mode."]
  };
  Object.assign(titles, {leads:["Leads","New opportunities"],customers:["Customers","Customer accounts"],products:["Products & Pricing","Product and service catalog"],quotations:["Quotations","Proposals and approvals"],orders:["Orders","Order fulfillment"],payments:["Payments","Recorded invoice payments"],expenses:["Expenses","Business expense records"],calendar:["Calendar & Meetings","Team schedule"],timeline:["Activity Timeline","Workspace history"]});
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
            <strong>${CRM.escape(user.name)}</strong>
            <span>${CRM.escape(user.email)}</span>
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
            ${button("theme","","moon","Toggle light or dark theme")}
            ${button("notifications","","bell","Open notifications")}
            <input class="search-input" id="global-search" aria-label="Search current section" placeholder="Search this section..." value="${CRM.escape(state.search || "")}" />
            ${user.role === "super_admin" ? `<button class="button secondary" id="reset-demo">${icon("refresh-cw")} Reset Demo</button>` : ""}
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
  document.querySelector("#quick-add").addEventListener("click", () => openModal(Object.keys(collections).find(type => viewFor(collections[type]) === state.view) || "contact"));
  document.querySelector("#reset-demo")?.addEventListener("click", () => {
    if (currentUser()?.role !== "super_admin" || !confirm("Reset all demo records? Export a backup first to keep your changes.")) return;
    const sessionUserId = state.sessionUserId;
    state = structuredClone(seedState);
    state.sessionUserId = sessionUserId;
    migrate();
    saveState();
    render();
    showToast("Demo data reset");
  });
  bindView();
}

function renderView() { return workspaceView(); }
function bindView() { bindWorkspace(); }
function openModal(type, editId = null) { return editRecord(type, editId); }

function metric(label, value, iconName, trend) {
  return `
    <article class="metric">
      <div class="metric-top"><div><span>${label}</span><strong>${value}</strong></div><div class="iconbox">${icon(iconName)}</div></div>
      <div class="trend">${trend}</div>
    </article>
  `;
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

// workspace.js initializes upgraded records before the first render.
