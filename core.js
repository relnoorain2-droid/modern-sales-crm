(function (root) {
  "use strict";
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  function totals(invoice) {
    const lines = invoice.items || [{ description: "Services", quantity: 1, rate: Number(invoice.amount) || 0 }];
    const subtotal = round(lines.reduce((sum, item) => sum + round(Number(item.quantity) * Number(item.rate)), 0));
    const discount = round(subtotal * (Number(invoice.discount) || 0) / 100);
    const tax = round((subtotal - discount) * (Number(invoice.tax) || 0) / 100);
    const total = round(subtotal - discount + tax);
    const paid = invoice.payments ? round(invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)) : invoice.status === "Paid" ? total : 0;
    return { subtotal, discount, tax, total, paid, balance: Math.max(0, round(total - paid)) };
  }
  function invoiceStatus(invoice, today) {
    const values = totals(invoice);
    if (invoice.status === "Void") return "Void";
    if (values.balance === 0 && (values.total > 0 || invoice.status === "Paid")) return "Paid";
    if (invoice.status === "Draft") return "Draft";
    if (invoice.due && invoice.due < today) return "Overdue";
    return values.paid > 0 ? "Partial" : "Sent";
  }
  function messageLink(channel, recipient, subject, body) {
    if (channel === "WhatsApp") {
      const phone = String(recipient).replace(/[\s()+.-]/g, "");
      if (!/^[1-9]\d{7,14}$/.test(phone)) throw new Error("Enter a full international phone number including country code.");
      return `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
    }
    if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(recipient)) throw new Error("Enter a valid email address.");
    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  function validateBackup(data) {
    if (data?.format !== "salespilot-backup" || data.version !== 1 || !data.data) throw new Error("Choose a SalesPilot backup file.");
    for (const name of ["products","quotations","orders","meetings","expenses"]) data.data[name] ??= [];
    const collections = ["contacts", "deals", "tasks", "subscriptions", "invoices", "tickets", "activity", "messages", "products", "quotations", "orders", "meetings", "expenses"];
    for (const collection of collections) {
      const items = data.data[collection];
      if (!Array.isArray(items) || items.length > 10000 || items.some(item => !item || typeof item !== "object" || typeof item.id !== "string")) throw new Error(`Invalid ${collection} records.`);
      if (new Set(items.map(item => item.id)).size !== items.length) throw new Error(`Duplicate ${collection} IDs.`);
    }
    if (!data.data.settings || !["USD", "AED", "GBP", "EUR"].includes(data.data.settings.currency)) throw new Error("Invalid company settings.");
    const requiredStrings = {contacts:["name","contact","email","phone","status","owner"],deals:["title","company","stage","owner","due"],tasks:["title","related","status","owner","due"],subscriptions:["plan","features","interval","status"],invoices:["customer","due","status"],tickets:["customer","issue","priority","status","owner"],activity:["text","time"],messages:["channel","recipient","subject","body","status","owner"]};
    for (const [collection, fields] of Object.entries(requiredStrings)) for (const record of data.data[collection]) {
      if (fields.some(field => typeof record[field] !== "string")) throw new Error(`Invalid ${collection} fields.`);
    }
    for (const [collection,fields] of Object.entries({products:["name","sku","category","currency","status"],quotations:["customer","currency","due","status","owner"],orders:["customer","description","owner","currency","date","due","status"],meetings:["title","start","end","owner","status"],expenses:["description","category","currency","date","status"]})) for (const item of data.data[collection]) if (fields.some(field=>typeof item[field] !== "string")) throw new Error(`Invalid ${collection} fields.`);
    for (const collection of ["products","quotations","orders","expenses"]) for (const item of data.data[collection]) if (!["USD","AED","GBP","EUR"].includes(item.currency)) throw new Error("Invalid record currency.");
    for (const [collection,fields] of [["products",["price","cost"]],["orders",["price","quantity"]],["expenses",["amount"]]]) for (const item of data.data[collection]) for (const field of fields) if (!Number.isFinite(Number(item[field])) || Number(item[field]) < 0) throw new Error(`Invalid ${collection} amount.`);
    for (const meeting of data.data.meetings) if (!Number.isFinite(Date.parse(meeting.start)) || !Number.isFinite(Date.parse(meeting.end)) || meeting.end <= meeting.start) throw new Error("Invalid meeting dates.");
    for (const field of ["company", "currency"]) if (typeof data.data.settings[field] !== "string") throw new Error("Invalid settings.");
    for (const [collection,fields] of [["deals",["amount","probability"]],["contacts",["value"]],["subscriptions",["price","customers"]]]) for (const item of data.data[collection]) for (const field of fields) if (!Number.isFinite(Number(item[field])) || Number(item[field]) < 0) throw new Error(`Invalid ${collection} numbers.`);
    for (const invoice of [...data.data.invoices,...data.data.quotations]) {
      if (invoice.currency && !["USD", "AED", "GBP", "EUR"].includes(invoice.currency)) throw new Error("Invalid invoice currency.");
      for (const field of ["tax", "discount"]) if (invoice[field] !== undefined && (!Number.isFinite(Number(invoice[field])) || Number(invoice[field]) < 0 || Number(invoice[field]) > 100)) throw new Error("Invalid invoice percentage.");
      if (invoice.items && (!Array.isArray(invoice.items) || invoice.items.some(item => !item || !Number.isFinite(Number(item.rate)) || Number(item.rate) < 0 || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0))) throw new Error("Invalid invoice items.");
      if (invoice.payments && (!Array.isArray(invoice.payments) || invoice.payments.some(item => !item || !Number.isFinite(Number(item.amount)) || Number(item.amount) <= 0))) throw new Error("Invalid invoice payments.");
    }
    for (const ticket of data.data.tickets) if (ticket.comments && (!Array.isArray(ticket.comments) || ticket.comments.some(comment => !comment || typeof comment.text !== "string"))) throw new Error("Invalid ticket conversation.");
    return data.data;
  }
  const api = { escape, round, totals, invoiceStatus, messageLink, validateBackup };
  if (typeof module !== "undefined") module.exports = api;
  else root.CRM = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
