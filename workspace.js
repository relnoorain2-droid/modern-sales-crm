"use strict";

const esc = CRM.escape;
const collections = { contact: "contacts", deal: "deals", task: "tasks", subscription: "subscriptions", invoice: "invoices", ticket: "tickets", user: "users", message: "messages", product:"products", quotation:"quotations", order:"orders", meeting:"meetings", expense:"expenses" };
const permissions = {
  super_admin: navItems.map(item => item[0]),
  admin: navItems.map(item => item[0]),
  manager: ["dashboard", "pipeline", "contacts", "tasks", "messages", "tickets", "reports", "leads", "customers", "products", "quotations", "orders", "calendar", "timeline"],
  sales: ["dashboard", "pipeline", "contacts", "tasks", "messages", "tickets", "leads", "customers", "products", "quotations", "orders", "calendar", "timeline"]
};
const stages = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
let viewFilter = "All";
const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
const stamp = () => new Date().toISOString();
const uid = prefix => `${prefix}-${crypto.randomUUID()}`;
const allowed = view => !!currentUser() && (permissions[currentUser().role] || []).includes(view);
const viewFor = collection => collection === "deals" ? "pipeline" : collection === "meetings" ? "calendar" : collection;
const records = collection => {
  if (!allowed(viewFor(collection)) && collection !== "activity") return [];
  return (state[collection] || []).filter(item => currentUser().role !== "sales" || collection === "products" || item.owner === currentUser().id);
};
const accessible = (type, recordId) => records(collections[type]).find(item => item.id === recordId);
const amount = (value, currency = state.settings.currency) => new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 2 }).format(Number(value) || 0);
const audit = text => state.activity.unshift({ id: uid("a"), owner: currentUser().id, icon: "history", text, time: stamp() });
function commit(text) { if (text) audit(text); saveState(); render(); if (text) showToast(text); }
function migrate() {
  state.messages ||= [];
  state.settings = { ...seedState.settings, address: "", email: "", taxId: "", paymentDetails: "", ...state.settings };
  state.invoices.forEach(invoice => {
    invoice.currency ||= state.settings.currency;
    invoice.items ||= [{ description: "Professional services", quantity: 1, rate: Number(invoice.amount) || 0 }];
    invoice.tax ??= 0;
    invoice.discount ??= 0;
    invoice.payments ||= invoice.status === "Paid" ? [{ id: uid("pay"), amount: CRM.totals(invoice).total, date: today(), method: "Legacy payment" }] : [];
  });
  state.tickets.forEach(ticket => { ticket.comments ||= []; ticket.createdAt ||= stamp(); });
  migrateOperations();
}

function button(action, recordId, glyph, label, type = "", text = false) {
  return `<button type="button" class="button small secondary ${text ? "" : "icon-button"}" data-action="${action}" data-id="${esc(recordId)}" data-type="${type}" title="${esc(label)}" aria-label="${esc(label)}">${icon(glyph, 16)}${text ? esc(label) : ""}</button>`;
}
function badge(value) { return `<span class="status-pill ${["Paid", "Won", "Resolved", "Active", "Done", "Customer"].includes(value) ? "green" : ["High", "Overdue", "Lost"].includes(value) ? "red" : "amber"}">${esc(value)}</span>`; }
function actions(type, item) {
  if (type === "product" && currentUser().role === "sales") return "";
  if (type === "user" && !manageableUser(item)) return "";
  return button("edit", item.id, "pencil", "Edit", type) + (type === "user" ? "" : button("delete", item.id, "trash-2", "Delete", type));
}
function toolbar(title, type, statuses = []) {
  return `<div class="table-toolbar"><h2>${esc(title)}</h2><div class="toolbar-controls">${statuses.length ? `<select id="status-filter" aria-label="Filter by status">${["All", ...statuses].map(status => `<option ${viewFilter === status ? "selected" : ""}>${esc(status)}</option>`).join("")}</select>` : ""}${button("export", type, "download", "Export CSV")}${button("edit", "", "plus", "Add", type, true)}</div></div>`;
}
function table(headers, rows) { return `<div class="table-wrap"><table><thead><tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td colspan="${headers.length}" class="empty-state">No matching records</td></tr>`}</tbody></table></div>`; }
function rowsFor(type) {
  return records(collections[type]).filter(item => (viewFilter === "All" || (type === "task" && viewFilter === "Overdue" ? item.status !== "Done" && item.due && item.due < today() : (type === "invoice" ? CRM.invoiceStatus(item, today()) : item.status || item.stage) === viewFilter)) && Object.entries(item).some(([key, value]) => key !== "password" && typeof value !== "object" && String(value).toLowerCase().includes((state.search || "").toLowerCase())));
}
function workspaceView() {
  if (!allowed(state.view)) return "<p>Access restricted.</p>";
  switch (state.view) {
    case "dashboard": return analyticsDashboard() + dashboardView();
    case "leads":
    case "customers":
    case "contacts": return toolbar(state.view === "leads" ? "Leads" : state.view === "customers" ? "Customers" : "Contacts & leads", "contact", ["Lead", "Prospect", "Customer"]) + table(["Company / Contact", "Email / Phone", "Owner", "Status", "Actions"], rowsFor("contact").filter(item => state.view === "leads" ? item.status !== "Customer" : state.view === "customers" ? item.status === "Customer" : true).map(item => `<tr><td><strong>${esc(item.name)}</strong><div class="muted">${esc(item.contact)}</div></td><td>${esc(item.email)}<div class="muted">${esc(item.phone)}</div></td><td>${esc(ownerName(item.owner))}</td><td>${badge(item.status)}</td><td><div class="actions">${button("profile", item.id, "contact", "Customer history")}${button("compose", item.id, "mail", "Email reminder", "contact")}${button("whatsapp", item.id, "message-circle", "WhatsApp", "contact")}${actions("contact", item)}</div></td></tr>`));
    case "pipeline": return toolbar("Sales pipeline", "deal", stages) + `<div class="pipeline">${stages.map(stage => `<section class="stage"><h3>${stage} <span class="tag">${rowsFor("deal").filter(item => item.stage === stage).length}</span></h3>${rowsFor("deal").filter(item => item.stage === stage).map(item => `<article class="deal-card"><strong>${esc(item.title)}</strong><span>${esc(item.company)}</span><div class="card-meta">${amount(item.amount)} <span>${item.probability}%</span></div><span class="muted">${esc(ownerName(item.owner))} / ${esc(item.due)}</span><select aria-label="Stage for ${esc(item.title)}" data-stage="${esc(item.id)}">${stages.map(value => `<option ${value === stage ? "selected" : ""}>${value}</option>`).join("")}</select><div class="actions">${actions("deal", item)}${allowed("invoices") ? button("convert", item.id, "receipt", "Create invoice") : ""}</div></article>`).join("") || '<p class="muted">No deals</p>'}</section>`).join("")}</div>`;
    case "tasks": return toolbar("Tasks & follow-ups", "task", ["Open", "Done", "Overdue"]) + table(["Task", "Related to", "Assigned", "Due", "Priority", "Actions"], rowsFor("task").map(item => `<tr><td><label><input type="checkbox" data-task="${esc(item.id)}" ${item.status === "Done" ? "checked" : ""}> ${esc(item.title)}</label></td><td>${esc(item.related)}</td><td>${esc(ownerName(item.owner))}</td><td>${esc(item.due)} ${item.status !== "Done" && item.due < today() ? badge("Overdue") : ""}</td><td>${badge(item.priority)}</td><td class="actions">${actions("task", item)}${button("calendar", item.id, "calendar-plus", "Download calendar event")}${button("compose", item.id, "mail", "Draft follow-up", "task")}</td></tr>`));
    case "invoices": return invoiceView();
    case "tickets": return toolbar("Support desk", "ticket", ["Open", "In Progress", "Waiting on Customer", "Resolved"]) + table(["Ticket / Issue", "Customer", "Owner", "Priority", "Status", "Actions"], rowsFor("ticket").map(item => `<tr><td><strong>${esc(item.id)}</strong><div>${esc(item.issue)}</div></td><td>${esc(item.customer)}</td><td>${esc(ownerName(item.owner))}</td><td>${badge(item.priority)}</td><td>${badge(item.status)}${item.due && item.due < today() && item.status !== "Resolved" ? badge("Overdue") : ""}</td><td><div class="actions">${button("ticket", item.id, "messages-square", "Open conversation")}${actions("ticket", item)}${button("compose", item.id, "mail", "Draft customer update", "ticket")}</div></td></tr>`));
    case "subscriptions": return toolbar("Subscription plans", "subscription", ["Active", "Paused"]) + `<div class="subscription-grid">${rowsFor("subscription").map(plan => `<article class="subscription-card"><h2>${esc(plan.plan)}</h2>${badge(plan.status)}<div class="price">${amount(plan.price)}<small> / ${esc(plan.interval)}</small></div><p>${esc(plan.features)}</p><span>${Number(plan.customers)} customers</span><div class="actions">${actions("subscription", plan)}</div></article>`).join("")}</div><p class="muted">Plan records only. Payment collection is not connected.</p>`;
    case "messages": return messagesView();
    case "reports": return reportsView();
    case "users": return usersView();
    case "settings": return settingsView();
    default: return operationsView();
  }
}

function dashboardView() {
  const deals = records("deals"), tasks = records("tasks"), tickets = records("tickets");
  const overdue = tasks.filter(item => item.status !== "Done" && item.due && item.due < today());
  return `<div class="grid cols-4">${metric("Won revenue", amount(deals.filter(item => item.stage === "Won").reduce((sum, item) => sum + Number(item.amount), 0)), "badge-dollar-sign", "Closed won deals")}${metric("Open pipeline", amount(deals.filter(item => !["Won", "Lost"].includes(item.stage)).reduce((sum, item) => sum + Number(item.amount), 0)), "chart-no-axes-combined", "Open opportunities")}${metric("Overdue tasks", overdue.length, "alarm-clock", "Follow-up required")}${metric("Open tickets", tickets.filter(item => item.status !== "Resolved").length, "life-buoy", "Customer support")}</div><div class="grid cols-2 workspace-section"><section><h2>Upcoming work</h2>${table(["Task", "Due", ""], tasks.filter(item => item.status !== "Done").sort((a,b) => a.due.localeCompare(b.due)).slice(0,8).map(item => `<tr><td>${esc(item.title)}</td><td>${esc(item.due)}</td><td>${button("edit", item.id, "pencil", "Edit task", "task")}</td></tr>`))}</section><section><h2>Activity</h2><div class="split-list">${records("activity").slice(0, 8).map(item => `<article class="feed-item"><div class="iconbox">${icon("history")}</div><div>${esc(item.text)}<div class="muted">${esc(item.time)}</div></div></article>`).join("") || '<p class="muted">No activity yet.</p>'}</div></section></div>`;
}
function invoiceView() {
  const list = rowsFor("invoice");
  return toolbar("Invoices", "invoice", ["Draft", "Sent", "Partial", "Overdue", "Paid", "Void"]) + table(["Invoice", "Customer", "Total / Balance", "Due", "Status", "Actions"], list.map(item => {
    const totals = CRM.totals(item);
    return `<tr><td><strong>${esc(item.id)}</strong></td><td>${esc(item.customer)}</td><td>${amount(totals.total, item.currency)}<div class="muted">Due ${amount(totals.balance, item.currency)}</div></td><td>${esc(item.due)}</td><td>${badge(CRM.invoiceStatus(item, today()))}</td><td><div class="actions">${button("invoice", item.id, "eye", "View invoice")}${button("pdf", item.id, "file-down", "Download PDF")}${button("edit", item.id, "pencil", "Edit invoice", "invoice")}${totals.balance > 0 && item.status !== "Void" ? button("payment", item.id, "banknote", "Record payment") : ""}${button("compose", item.id, "mail", "Email reminder", "invoice")}${button("whatsapp", item.id, "message-circle", "WhatsApp reminder", "invoice")}</div></td></tr>`;
  }));
}
function messagesView() {
  return toolbar("Reminder drafts", "message", ["Draft", "Scheduled", "Opened", "Cancelled"]) + `<p class="service-note">Email and WhatsApp open a prepared message for you to review and send. Scheduled reminders appear here when due; they are not sent automatically.</p>` + table(["Recipient", "Channel", "Subject", "Due", "Status", "Actions"], rowsFor("message").map(item => `<tr><td>${esc(item.recipient)}</td><td>${esc(item.channel)}</td><td>${esc(item.subject)}</td><td>${esc(item.due)} ${item.status === "Scheduled" && item.due <= today() ? badge("Due now") : ""}</td><td>${badge(item.status)}</td><td class="actions">${actions("message", item)}${button("launch", item.id, "external-link", "Review in messaging app")}</td></tr>`));
}
function reportsView() {
  const deals = records("deals");
  const won = deals.filter(item => item.stage === "Won");
  const closed = deals.filter(item => ["Won", "Lost"].includes(item.stage));
  return `<div class="table-toolbar"><h2>Sales performance</h2>${button("report", "", "download", "Export report", "", true)}</div><div class="grid cols-3">${metric("Win rate", `${closed.length ? Math.round(won.length / closed.length * 100) : 0}%`, "target", "Won / closed deals")}${metric("Weighted pipeline", amount(deals.filter(item => !["Won", "Lost"].includes(item.stage)).reduce((sum,item) => sum + item.amount * item.probability / 100, 0)), "scale", "Amount weighted by probability")}${metric("Monthly plan revenue", allowed("subscriptions") ? amount(state.subscriptions.filter(item => item.status === "Active").reduce((sum,item) => sum + item.price * item.customers / (item.interval === "year" ? 12 : 1),0)) : "Restricted", "credit-card", "Based on recorded customer counts")}</div><h2 class="workspace-section">Team performance</h2>${table(["Owner", "Open deals", "Won revenue", "Open tasks"], state.users.map(user => `<tr><td>${esc(user.name)}</td><td>${deals.filter(item => item.owner === user.id && !["Won", "Lost"].includes(item.stage)).length}</td><td>${amount(won.filter(item => item.owner === user.id).reduce((sum,item) => sum + Number(item.amount), 0))}</td><td>${records("tasks").filter(item => item.owner === user.id && item.status !== "Done").length}</td></tr>`))}`;
}
function manageableUser(user) { return currentUser()?.role === "super_admin" || currentUser()?.role === "admin" && !["super_admin", "admin"].includes(user.role); }
function usersView() {
  return toolbar("Team & access", "user") + table(["Name", "Email", "Role", "Status", "Actions"], rowsFor("user").map(user => `<tr><td>${esc(user.name)}</td><td>${esc(user.email)}</td><td>${esc(roles[user.role])}</td><td>${badge(user.status)}</td><td>${actions("user", user)}</td></tr>`)) + `<h2 class="workspace-section">Role permissions</h2>${table(["Role", "Access"], Object.entries(permissions).map(([role, views]) => `<tr><td>${roles[role]}</td><td>${views.map(view => navItems.find(item => item[0] === view)?.[1]).join(", ")}${role === "sales" ? " (assigned records only)" : ""}${role === "admin" ? ". Cannot edit Admin or Super Admin accounts, reset, or restore the workspace." : ""}</td></tr>`))}`;
}
function settingsView() {
  return `<h2>Company & billing</h2><form id="company-form" class="form-grid">${[
    {name:"company",label:"Company name",required:true}, {name:"email",label:"Billing email",type:"email"}, {name:"address",label:"Company address"}, {name:"taxId",label:"Tax registration number"}, {name:"currency",label:"Default currency",type:"select",options:["USD","AED","GBP","EUR"]}, {name:"tax",label:"Default tax %",type:"number",min:0,max:100}, {name:"salesTarget",label:"Sales target",type:"number",min:0}, {name:"paymentDetails",label:"Payment instructions",type:"textarea"}
  ].map(field => inputField({...field,value:state.settings[field.name]})).join("")}<div><button class="button" type="submit">${icon("save")} Save settings</button></div></form><h2 class="workspace-section">Data & integrations</h2><div class="toolbar-controls">${button("backup","","download","Export backup","",true)}${currentUser().role === "super_admin" ? button("restore","","upload","Restore backup","",true) : ""}${button("import","","upload","Import contacts CSV","",true)}</div><p class="service-note">This workspace is a browser-local demo. Backups exclude user passwords. Email and WhatsApp use your messaging apps; shared storage, automatic delivery, and payment collection are not connected.</p>`;
}

function dialog(title, body, onSubmit, submitLabel = "Save") {
  document.querySelector(".modal-backdrop")?.remove();
  const previous = document.activeElement;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><form id="work-form"><div class="modal-head"><h2 id="dialog-title">${esc(title)}</h2><button type="button" class="button ghost" data-close aria-label="Close">${icon("x")}</button></div><div class="modal-body">${body}<p role="alert" id="form-error"></p></div><div class="modal-foot"><button type="button" class="button secondary" data-close>Close</button>${onSubmit ? `<button class="button" type="submit">${esc(submitLabel)}</button>` : ""}</div></form></section>`;
  document.body.appendChild(backdrop);
  document.querySelector("#app").inert = true;
  const close = () => { backdrop.remove(); document.querySelector("#app").inert = false; previous?.focus(); };
  backdrop.querySelectorAll("[data-close]").forEach(el => el.onclick = close);
  backdrop.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
    if (event.key === "Tab") {
      const elements = [...backdrop.querySelectorAll("button, input, select, textarea, a[href]")].filter(el => !el.disabled && el.offsetParent !== null);
      if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault(); elements[0]?.focus(); }
    }
  });
  backdrop.querySelector("form").onsubmit = async event => {
    event.preventDefault();
    try { await onSubmit?.(Object.fromEntries(new FormData(event.currentTarget)), event.currentTarget); close(); }
    catch(error) { backdrop.querySelector("#form-error").textContent = error.message; }
  };
  backdrop.querySelector("input, select, textarea, button")?.focus();
  lucide.createIcons();
  return backdrop;
}
function inputField(field) {
  const attrs = `name="${field.name}" id="f-${field.name}" ${field.required ? "required" : ""}`;
  let control;
  if (field.type === "select") control = `<select ${attrs}>${field.options.map(option => { const value = option.value ?? option; return `<option value="${esc(value)}" ${String(field.value) === String(value) ? "selected" : ""}>${esc(option.label ?? option)}</option>`; }).join("")}</select>`;
  else if (field.type === "textarea") control = `<textarea ${attrs} maxlength="5000">${esc(field.value)}</textarea>`;
  else control = `<input ${attrs} type="${field.type || "text"}" value="${esc(field.value)}" ${field.type === "number" ? `step="${field.step || "0.01"}" min="${field.min ?? 0}" ${field.max !== undefined ? `max="${field.max}"` : ""}` : 'maxlength="300"'}>`;
  return `<div class="field ${field.span ? "span-2" : ""}"><label for="f-${field.name}">${esc(field.label)}</label>${control}</div>`;
}
function editRecord(type, recordId, defaults = {}) {
  const collection = collections[type];
  if (!collection || !allowed(viewFor(collection))) return showToast("Access restricted.");
  const existing = recordId ? accessible(type, recordId) : null;
  if (recordId && !existing) return showToast("Record not accessible.");
  if (type === "user" && existing && !manageableUser(existing)) return showToast("Only Super Admin can edit this account.");
  if (type === "product" && currentUser().role === "sales") return showToast("Product pricing is read-only for Sales Agents.");
  if (type === "quotation") return editInvoice(existing, defaults, "quotation");
  if (type === "invoice") return editInvoice(existing, defaults);
  let config = type === "message" ? messageConfig() : ["product","order","meeting","expense"].includes(type) ? operationsConfig(type) : modalConfig(type, null);
  const item = existing || defaults;
  let fields = config.fields.map(field => ({ ...field, value: item[field.name] ?? field.value }));
  if (type === "contact" && !existing && state.view === "customers") fields.find(field => field.name === "status").value = "Customer";
  fields.forEach(field => { if (field.name === "owner") field.options = field.options.filter(option => state.users.some(user => user.id === option.value && user.status === "Active")); });
  if (type === "task") { const due = fields.find(field => field.name === "due"); due.required = true; due.value ||= today(); }
  if (type === "deal") fields.find(field => field.name === "stage").options = stages;
  if (type === "deal") fields.find(field => field.name === "probability").max = 100;
  if (type === "task") fields.push({name:"status",label:"Status",type:"select",options:["Open","Done"],value:item.status || "Open"});
  if (type === "ticket") {
    fields.find(field => field.name === "status").options = ["Open","In Progress","Waiting on Customer","Resolved"];
    fields.push({name:"due",label:"Resolution target",type:"date",value:item.due || today()}, {name:"description",label:"Description",type:"textarea",span:true,value:item.description});
  }
  if (type === "contact") fields.push({name:"notes",label:"Customer notes",type:"textarea",span:true,value:item.notes});
  if (type === "user") {
    fields.find(field => field.name === "role").options = Object.entries(roles).filter(([role]) => currentUser().role === "super_admin" || ["manager","sales"].includes(role)).map(([value,label]) => ({value,label}));
    const password = fields.find(field => field.name === "password"); password.type = "password"; password.value = ""; password.required = !existing; password.label = existing ? "New password (leave blank to keep)" : "Password";
  }
  fields = fields.filter(field => field.name !== "owner" || currentUser().role !== "sales");
  dialog(`${existing ? "Edit" : "Add"} ${type}`, `<div class="form-grid">${fields.map(inputField).join("")}</div>`, data => {
    if (!allowed(viewFor(collection)) || existing && !accessible(type, existing.id)) throw new Error("Access restricted.");
    for (const field of fields) {
      if (field.type === "number") data[field.name] = Number(data[field.name]);
      if (field.required && !String(data[field.name]).trim()) throw new Error(`${field.label} is required.`);
    }
    if (["contact","deal","task","ticket","message","order","meeting"].includes(type) && currentUser().role === "sales") data.owner = currentUser().id;
    validateOperations(type,data,existing);
    if (type === "deal") { if (data.stage === "Won") data.probability = 100; if (data.stage === "Lost") data.probability = 0; }
    if (type === "contact" && existing && existing.name !== data.name) {
      for (const key of ["deals","tasks","invoices","tickets","quotations","orders","meetings"]) {
        const field = key === "deals" ? "company" : key === "tasks" ? "related" : "customer";
        if (state[key].some(linked => linked[field] === existing.name && !records(key).some(visible => visible.id === linked.id))) throw new Error("An administrator must rename this company because it has restricted linked records.");
      }
      for (const key of ["deals","tasks","invoices","tickets","quotations","orders","meetings"]) for (const linked of state[key]) { const field = key === "deals" ? "company" : key === "tasks" ? "related" : "customer"; if (linked[field] === existing.name) linked[field] = data.name; }
    }
    if (type === "user") {
      if (existing && !manageableUser(existing) || currentUser().role !== "super_admin" && !["manager","sales"].includes(data.role)) throw new Error("This role is restricted.");
      if (state.users.some(user => user.id !== existing?.id && user.email.toLowerCase() === data.email.toLowerCase())) throw new Error("This email already has an account.");
      if (data.password && data.password.length < 6) throw new Error("Use at least 6 characters for the demo password.");
      if (!data.password) delete data.password;
      if (existing?.id === currentUser().id && (data.role !== existing.role || data.status !== "Active")) throw new Error("You cannot demote or pause your own account.");
    }
    if (type === "message") { CRM.messageLink(data.channel, data.recipient, data.subject, data.body); data.owner ||= currentUser().id; if (data.status === "Scheduled" && !data.due) throw new Error("Choose a reminder date."); }
    if (existing) Object.assign(existing, data, {updatedAt:stamp()});
    else state[collection].unshift({id:type === "order" ? nextDocumentId("orders","ORD") : uid(type === "ticket" ? "TK" : type), ...data, createdAt:stamp(), ...(type === "ticket" ? {comments:[]} : {})});
    commit(`${type[0].toUpperCase() + type.slice(1)} saved`);
  });
}

function bindWorkspace() {
  bindOperations();
  document.querySelector("#status-filter")?.addEventListener("change", event => { viewFilter = event.target.value; render(); });
  document.querySelectorAll("[data-stage]").forEach(el => el.onchange = () => {
    const item = accessible("deal", el.dataset.stage); if (!item || !stages.includes(el.value)) return;
    item.stage = el.value; if (item.stage === "Won") item.probability = 100; if (item.stage === "Lost") item.probability = 0;
    commit(`${item.title}: ${item.stage}`);
  });
  document.querySelectorAll("[data-task]").forEach(el => el.onchange = () => { const item = accessible("task", el.dataset.task); if (item) { item.status = el.checked ? "Done" : "Open"; commit("Task updated"); } });
  document.querySelector("#company-form")?.addEventListener("submit", event => { event.preventDefault(); if (!allowed("settings")) return; Object.assign(state.settings, Object.fromEntries(new FormData(event.currentTarget))); commit("Settings saved"); });
}
document.addEventListener("click", event => {
  const el = event.target.closest("[data-action]"); if (!el || !currentUser()) return;
  const { action, id: recordId, type } = el.dataset;
  try {
    if (action === "edit") editRecord(type, recordId);
    if (action === "delete") deleteRecord(type, recordId);
    if (action === "profile") customerProfile(recordId);
    if (action === "invoice") invoiceDetail(recordId);
    if (action === "pdf") downloadInvoice(recordId,type || "invoice");
    if (action === "payment") recordPayment(recordId);
    if (action === "ticket") ticketDetail(recordId);
    if (action === "compose" || action === "whatsapp") compose(type, recordId, action === "whatsapp" ? "WhatsApp" : "Email");
    if (action === "launch") launchMessage(recordId);
    if (action === "export") exportRecords(recordId);
    if (action === "backup" && allowed("settings")) backup();
    if (action === "restore" && currentUser().role === "super_admin") restoreBackup();
    if (action === "import" && allowed("settings")) importContacts();
    if (action === "calendar") calendarEvent(recordId);
    if (action === "report" && allowed("reports")) exportRecords("deal");
    if (action === "convert" && allowed("invoices")) { const deal = accessible("deal",recordId); if (deal) editRecord("invoice",null,{customer:deal.company,items:[{description:deal.title,quantity:1,rate:deal.amount}]}); }
  } catch(error) { showToast(error.message); }
});
function deleteRecord(type, recordId) {
  const item = accessible(type, recordId); if (!item || ["user","invoice"].includes(type)) return;
  if (type === "product" && currentUser().role === "sales" || type === "quotation" && item.convertedInvoiceId) return showToast("This record is locked.");
  if (type === "contact" && ["deals","invoices","tickets","tasks","quotations","orders","meetings"].some(key => state[key].some(record => [record.company, record.customer, record.related].includes(item.name)))) return showToast("This contact has linked records. Keep it to preserve customer history.");
  if (!confirm(`Delete this ${type}? This cannot be undone.`)) return;
  state[collections[type]] = state[collections[type]].filter(record => record.id !== recordId); commit(`${type} deleted`);
}

function messageConfig() { return { fields: [
  {name:"channel",label:"Channel",type:"select",options:["Email","WhatsApp"],value:"Email"},
  {name:"recipient",label:"Email or international phone",required:true},
  {name:"subject",label:"Subject",required:true,value:"Follow-up"},
  {name:"due",label:"Reminder date",type:"date",value:today()},
  {name:"body",label:"Message",type:"textarea",span:true,required:true},
  {name:"status",label:"Status",type:"select",options:["Draft","Scheduled","Cancelled"],value:"Draft"}
]}; }
function compose(type, recordId, channel) {
  const item = accessible(type,recordId); if (!item || !allowed("messages")) return;
  const company = type === "contact" ? item.name : item.customer || item.related;
  const contact = records("contacts").find(record => record.name === company);
  let subject = `Follow-up: ${company || "your request"}`, body = `Hello ${contact?.contact || company || ""},\n\nFollowing up on ${item.title || "our recent conversation"}. Please let us know a convenient time to connect.\n\n${state.settings.company}`;
  if (type === "invoice") { subject = `Invoice ${item.id}`; body = `Hello ${contact?.contact || company},\n\nInvoice ${item.id} has a balance of ${amount(CRM.totals(item).balance,item.currency)}, due ${item.due}. Please let us know if you need any assistance.\n\n${state.settings.company}`; }
  if (type === "ticket") { subject = `Support update: ${item.id}`; body = `Hello ${contact?.contact || company},\n\nYour ticket ${item.id}: ${item.issue}\nCurrent status: ${item.status}\n\n${state.settings.company}`; }
  editRecord("message",null,{channel,recipient:channel === "WhatsApp" ? contact?.phone || "" : contact?.email || "",subject,body});
}
function launchMessage(recordId) {
  const message = accessible("message",recordId); if (!message || message.status === "Cancelled") return;
  const url = CRM.messageLink(message.channel,message.recipient,message.subject,message.body);
  if (message.channel === "WhatsApp") window.open(url,"_blank","noopener,noreferrer");
  else { const anchor = document.createElement("a"); anchor.href = url; anchor.click(); }
  message.status = "Opened"; message.openedAt = stamp(); commit("Message opened for review; delivery is not confirmed");
}

function customerProfile(recordId) {
  const item = accessible("contact",recordId); if (!item) return;
  dialog(item.name, `<p>${esc(item.contact)} / ${esc(item.email)} / ${esc(item.phone)}</p><p class="preserve-lines">${esc(item.notes || "No notes")}</p>${[["deals","company","title"],["tasks","related","title"],["invoices","customer","id"],["tickets","customer","issue"]].filter(([key]) => allowed(viewFor(key))).map(([key,field,label]) => `<h3>${key[0].toUpperCase()+key.slice(1)}</h3>${table(["Record","Status"],records(key).filter(record => record[field] === item.name).map(record => `<tr><td>${esc(record[label])}</td><td>${badge(record.status || record.stage)}</td></tr>`))}`).join("")}`,null);
}
function ticketDetail(recordId) {
  const ticket = accessible("ticket",recordId); if (!ticket) return;
  dialog(`${ticket.id}: ${ticket.issue}`, `<p>${esc(ticket.customer)} / ${esc(ownerName(ticket.owner))}</p><p class="preserve-lines">${esc(ticket.description || "")}</p><div class="conversation">${(ticket.comments || []).map(comment => `<article><strong>${esc(ownerName(comment.owner))}</strong><span class="muted"> ${esc(comment.time)} / ${esc(comment.kind)}</span><p class="preserve-lines">${esc(comment.text)}</p></article>`).join("") || '<p class="muted">No updates yet.</p>'}</div><div class="form-grid">${inputField({name:"status",label:"Status",type:"select",value:ticket.status,options:["Open","In Progress","Waiting on Customer","Resolved"]})}${inputField({name:"kind",label:"Entry type",type:"select",options:["Internal note","Customer reply (logged)"]})}${inputField({name:"text",label:"Update",type:"textarea",span:true})}</div>`,data => {
    if (!accessible("ticket",recordId)) throw new Error("Access restricted.");
    ticket.comments ||= [];
    if (data.text.trim()) ticket.comments.push({id:uid("comment"),owner:currentUser().id,time:stamp(),kind:data.kind,text:data.text.trim()});
    if (ticket.status !== data.status) ticket.comments.push({id:uid("comment"),owner:currentUser().id,time:stamp(),kind:"Status change",text:`${ticket.status} to ${data.status}`});
    ticket.status = data.status; ticket.updatedAt = stamp(); commit("Ticket updated");
  },"Save update");
}

function invoiceLine(item = {}) {
  return `<div class="invoice-line"><input aria-label="Item description" name="description" value="${esc(item.description)}" placeholder="Description" required maxlength="300"><input aria-label="Quantity" name="quantity" type="number" min="0.01" step="0.01" value="${item.quantity || 1}" required><input aria-label="Unit price" name="rate" type="number" min="0" step="0.01" value="${item.rate ?? 0}" required><button type="button" class="button ghost remove-line" aria-label="Remove item">${icon("trash-2")}</button></div>`;
}
function editInvoice(existing, defaults, kind = "invoice") {
  const isQuote = kind === "quotation";
  if (existing && (CRM.totals(existing).paid > 0 || existing.status === "Void" || existing.convertedInvoiceId)) return showToast("This document is locked. Create a new document for further changes.");
  const item = existing || {due:today(),issueDate:today(),tax:state.settings.tax,discount:0,currency:state.settings.currency,status:"Draft",...defaults};
  const modal = dialog(existing ? `Edit ${existing.id}` : `Create ${kind}`, `<div class="form-grid">${[
    {name:"customer",label:"Customer",required:true}, {name:"currency",label:"Currency",type:"select",options:["USD","AED","GBP","EUR"]}, {name:"issueDate",label:"Document date",type:"date",required:true}, {name:"due",label:isQuote ? "Valid until" : "Due date",type:"date",required:true}, {name:"tax",label:"Tax %",type:"number",max:100}, {name:"discount",label:"Discount %",type:"number",max:100}, {name:"status",label:"Status",type:"select",options:isQuote ? ["Draft","Sent","Accepted","Rejected"] : ["Draft","Sent","Void"]}, {name:"notes",label:"Notes",type:"textarea"}
  ].map(field => inputField({...field,value:item[field.name]})).join("")}</div><div class="line-head"><span>Description</span><span>Qty</span><span>Unit price</span></div><div id="invoice-lines">${(item.items || [{}]).map(invoiceLine).join("")}</div><button type="button" class="button secondary" id="add-line">${icon("plus")} Add item</button><p id="invoice-total" aria-live="polite"></p>`,(data,form) => {
    if (!allowed(isQuote ? "quotations" : "invoices")) throw new Error("Access restricted.");
    const items = [...form.querySelectorAll(".invoice-line")].map(row => ({description:row.querySelector('[name="description"]').value.trim(),quantity:Number(row.querySelector('[name="quantity"]').value),rate:Number(row.querySelector('[name="rate"]').value)}));
    if (!items.length || items.some(line => !line.description || line.quantity <= 0 || line.rate < 0)) throw new Error("Add at least one valid invoice item.");
    if (data.due < data.issueDate) throw new Error("Due date cannot be before invoice date.");
    delete data.description; delete data.quantity; delete data.rate;
    const payload = {...data,items,tax:Number(data.tax),discount:Number(data.discount)};
    if (existing) Object.assign(existing,payload);
    else if (isQuote) state.quotations.unshift({id:nextDocumentId("quotations","QUO"),...payload,payments:[],owner:currentUser().id,createdAt:stamp()});
    else { let sequence = Number(state.settings.invoiceSequence) || 1003; do { sequence++; } while (state.invoices.some(invoice => invoice.id === `INV-${sequence}`)); state.settings.invoiceSequence = sequence; state.invoices.unshift({id:`INV-${sequence}`,...payload,payments:[],createdAt:stamp()}); }
    commit(isQuote ? "Quotation saved" : "Invoice saved");
  });
  const updateTotal = () => {
    const form = modal.querySelector("form");
    const data = Object.fromEntries(new FormData(form));
    const items = [...form.querySelectorAll(".invoice-line")].map(row => ({quantity:Number(row.querySelector('[name="quantity"]').value),rate:Number(row.querySelector('[name="rate"]').value)}));
    modal.querySelector("#invoice-total").textContent = `Total: ${amount(CRM.totals({...data,items}).total,data.currency)}`;
  };
  modal.querySelector("#add-line").onclick = () => { modal.querySelector("#invoice-lines").insertAdjacentHTML("beforeend",invoiceLine()); lucide.createIcons(); updateTotal(); };
  modal.addEventListener("click",event => { if (event.target.closest(".remove-line")) { event.target.closest(".invoice-line").remove(); updateTotal(); } });
  modal.addEventListener("input",updateTotal); updateTotal();
  const catalog = document.createElement("select"); catalog.id = "catalog-item"; catalog.setAttribute("aria-label","Add catalog item");
  catalog.innerHTML = '<option value="">Add from product catalog</option>' + records("products").filter(product => product.status === "Active").map(product => `<option value="${esc(product.id)}">${esc(product.name)} (${amount(product.price,product.currency)})</option>`).join("");
  modal.querySelector("#add-line").after(catalog);
  catalog.onchange = () => { const product=accessible("product",catalog.value); if (!product) return; if (product.currency !== modal.querySelector('#f-currency').value) { showToast("Choose the document currency matching this product first."); catalog.value=""; return; } const blank=modal.querySelector('.invoice-line input[name="description"]'); if(blank && !blank.value && modal.querySelectorAll('.invoice-line').length === 1) blank.closest('.invoice-line').remove(); modal.querySelector('#invoice-lines').insertAdjacentHTML('beforeend',invoiceLine({description:product.name,quantity:1,rate:product.price})); lucide.createIcons(); updateTotal(); catalog.value=""; };
}
function invoiceDetail(recordId) {
  const item = accessible("invoice",recordId); if (!item) return;
  const totals = CRM.totals(item);
  dialog(item.id, `<div class="invoice-preview"><h2>${esc(state.settings.company)}</h2><p>${esc(state.settings.address)}</p><p>Bill to: <strong>${esc(item.customer)}</strong></p><p>Issued ${esc(item.issueDate || "-")} / Due ${esc(item.due)} / ${badge(CRM.invoiceStatus(item,today()))}</p>${table(["Description","Qty","Price","Total"],item.items.map(line => `<tr><td>${esc(line.description)}</td><td>${line.quantity}</td><td>${amount(line.rate,item.currency)}</td><td>${amount(CRM.round(line.quantity*line.rate),item.currency)}</td></tr>`))}<dl class="invoice-totals">${Object.entries(totals).map(([key,value]) => `<div><dt>${key}</dt><dd>${amount(value,item.currency)}</dd></div>`).join("")}</dl><p class="preserve-lines">${esc(item.notes || "")}</p><p class="preserve-lines">${esc(state.settings.paymentDetails)}</p><h3>Payment history</h3>${table(["Date","Method","Amount"],item.payments.map(payment => `<tr><td>${esc(payment.date)}</td><td>${esc(payment.method)}</td><td>${amount(payment.amount,item.currency)}</td></tr>`))}</div>${button("pdf",item.id,"file-down","Download PDF","",true)}`,null);
}
function recordPayment(recordId) {
  const item = accessible("invoice",recordId); if (!item || item.status === "Void") return;
  const balance = CRM.totals(item).balance; if (balance <= 0) return;
  dialog(`Record payment: ${item.id}`,`<p>Balance: ${amount(balance,item.currency)}</p><div class="form-grid">${inputField({name:"amount",label:"Payment amount",type:"number",value:balance,min:0.01,max:balance,required:true})}${inputField({name:"date",label:"Payment date",type:"date",value:today(),required:true})}${inputField({name:"method",label:"Method",type:"select",options:["Bank transfer","Cash","Card (record only)","Other"]})}</div>`, data => {
    if (!accessible("invoice",recordId)) throw new Error("Access restricted.");
    const value = Number(data.amount);
    if (!Number.isFinite(value) || value <= 0 || value > CRM.totals(item).balance) throw new Error("Payment must be positive and cannot exceed the balance.");
    item.payments.push({id:uid("pay"),amount:CRM.round(value),date:data.date,method:data.method}); item.status = "Sent"; commit("Payment recorded");
  },"Record payment");
}
function downloadInvoice(recordId, kind = "invoice") {
  const item = accessible(kind,recordId); if (!item || !["invoice","quotation"].includes(kind)) return;
  if (!window.jspdf) throw new Error("PDF library unavailable. Reload and try again.");
  const pdf = new jspdf.jsPDF();
  let y = 20;
  const text = (value,size=11) => {
    pdf.setFontSize(size);
    for (const line of pdf.splitTextToSize(String(value || ""),170)) {
      if (y > 274) { pdf.addPage(); y = 20; }
      pdf.text(line,20,y); y += size > 15 ? 10 : 6;
    }
    y += 2;
  };
  text(state.settings.company,22); text(state.settings.address); text(state.settings.email);
  if (state.settings.taxId) text(`Tax registration: ${state.settings.taxId}`);
  text(`${kind.toUpperCase()} ${item.id}`,18); text(`Status: ${kind === "quotation" ? item.status : CRM.invoiceStatus(item,today())}`);
  text(`Bill to: ${item.customer}`); text(`Issued: ${item.issueDate || "-"}    Due: ${item.due}`);
  y += 4;
  item.items.forEach((line,index) => { text(`${index+1}. ${line.description}`); text(`${line.quantity} x ${amount(line.rate,item.currency)} = ${amount(CRM.round(line.quantity*line.rate),item.currency)}`); });
  y += 4;
  Object.entries(CRM.totals(item)).filter(([key]) => kind !== "quotation" || !["paid","balance"].includes(key)).forEach(([key,value]) => text(`${key.toUpperCase()}: ${amount(value,item.currency)}`,key === "total" || key === "balance" ? 14 : 11));
  text(item.notes); text(state.settings.paymentDetails);
  if (item.payments.length) { text("Payment history",14); item.payments.forEach(payment => text(`${payment.date} / ${payment.method} / ${amount(payment.amount,item.currency)}`)); }
  const count = pdf.getNumberOfPages();
  for (let page=1;page<=count;page++) { pdf.setPage(page); pdf.setFontSize(9); pdf.text(`${item.id} | Page ${page} of ${count}`,20,289); }
  pdf.save(`${item.id}.pdf`);
}

function download(filename, content, type) { const url=URL.createObjectURL(new Blob([content],{type})); const anchor=document.createElement("a"); anchor.href=url; anchor.download=filename; anchor.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
function exportRecords(type) {
  if (!collections[type] || !allowed(viewFor(collections[type]))) return;
  const rows = rowsFor(type).map(item => Object.fromEntries(Object.entries(item).filter(([key,value]) => key !== "password" && typeof value !== "object")));
  if (!rows.length) return showToast("No records to export.");
  download(`${collections[type]}-${today()}.csv`,Papa.unparse(rows,{escapeFormulae:true}),"text/csv;charset=utf-8");
}
function backup() {
  const data = Object.fromEntries(["contacts","deals","tasks","subscriptions","invoices","tickets","activity","messages","products","quotations","orders","meetings","expenses","settings"].map(key => [key,state[key]]));
  download(`salespilot-backup-${today()}.json`,JSON.stringify({format:"salespilot-backup",version:1,createdAt:stamp(),data},null,2),"application/json");
}
function pickFile(accept, onFile) { const input=document.createElement("input"); input.type="file"; input.accept=accept; input.onchange=async()=>{try { const file=input.files[0]; if (file) { if(file.size>5000000) throw new Error("Maximum file size is 5 MB."); await onFile(file); }} catch(error) {showToast(error.message);} }; input.click(); }
function restoreBackup() {
  pickFile(".json", async file => {
    const data=CRM.validateBackup(JSON.parse(await file.text()));
    if (!confirm("Replace CRM records and settings with this backup? Existing user accounts will be kept.")) return;
    if (currentUser()?.role !== "super_admin") return;
    for (const key of ["contacts","deals","tasks","subscriptions","invoices","tickets","activity","messages","products","quotations","orders","meetings","expenses","settings"]) state[key]=data[key];
    migrate(); commit("Backup restored");
  });
}
function importContacts() {
  dialog("Import contacts",'<p>CSV columns: name, contact, email, phone, source, status. Name is required. Duplicate email addresses are skipped.</p><input id="contact-csv" type="file" accept=".csv" required aria-label="Contacts CSV">',async(data,form)=>{
    if (!allowed("settings")) throw new Error("Access restricted.");
    const file=form.querySelector("input").files[0]; if(file.size>5000000) throw new Error("Maximum file size is 5 MB.");
    const parsed=Papa.parse(await file.text(),{header:true,skipEmptyLines:"greedy",transformHeader:header=>header.trim().toLowerCase()});
    if (parsed.errors.length || !parsed.meta.fields.includes("name")) throw new Error("Invalid CSV. Include a name column and consistent columns.");
    if (parsed.data.length>5000) throw new Error("Import up to 5,000 contacts at a time.");
    const emails=new Set(state.contacts.map(item=>item.email.toLowerCase())); let count=0,skipped=0;
    for (const row of parsed.data) { const email=(row.email || "").trim(); if(!row.name?.trim() || email && emails.has(email.toLowerCase())) {skipped++;continue;} state.contacts.push({id:uid("c"),name:row.name.trim(),contact:row.contact || "",email,phone:row.phone || "",source:row.source || "CSV",status:["Lead","Prospect","Customer"].includes(row.status)?row.status:"Lead",owner:currentUser().id,value:0}); if(email) emails.add(email.toLowerCase());count++; }
    commit(`${count} contacts imported; ${skipped} skipped`);
  },"Import");
}
function calendarEvent(recordId) {
  const task=accessible("task",recordId); if(!task) return; if(!task.due) throw new Error("Set a task due date first.");
  const escapeICS=value=>String(value || "").replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
  const next=new Date(`${task.due}T12:00:00Z`); next.setUTCDate(next.getUTCDate()+1);
  download(`${task.id}.ics`,["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SalesPilot//CRM//EN","BEGIN:VEVENT",`UID:${task.id}@salespilot.local`,`DTSTAMP:${stamp().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}`,`DTSTART;VALUE=DATE:${task.due.replace(/-/g,"")}`,`DTEND;VALUE=DATE:${next.toISOString().slice(0,10).replace(/-/g,"")}`,`SUMMARY:${escapeICS(task.title)}`,`DESCRIPTION:${escapeICS(task.related)}`,"END:VEVENT","END:VCALENDAR"].join("\r\n"),"text/calendar");
}

// operations.js initializes all modules before the first render.
