"use strict";

let reportYear = new Date().getFullYear();
let calendarMonth = today().slice(0,7);
function nextDocumentId(collection,prefix) { let number=1000; while(state[collection].some(item=>item.id === `${prefix}-${number}`)) number++; return `${prefix}-${number}`; }
function migrateOperations() {
  state.products ||= [
    {id:"p1",name:"CRM implementation",sku:"CRM-SETUP",category:"Service",price:1500,currency:"USD",cost:600,status:"Active",description:"Configuration and onboarding"},
    {id:"p2",name:"Team training",sku:"TRAIN-01",category:"Service",price:250,currency:"USD",cost:100,status:"Active",description:"One team training session"},
    {id:"p3",name:"Support package",sku:"SUP-01",category:"Service",price:500,currency:"USD",cost:200,status:"Active",description:"Monthly support package"}
  ];
  state.quotations ||= [];
  state.orders ||= [{id:"ORD-1000",customer:"Amina Travel Group",description:"CRM implementation",quantity:1,price:1500,currency:"USD",status:"Confirmed",owner:"u-manager",date:today(),due:today()}];
  state.meetings ||= [{id:"meeting-demo",title:"Customer onboarding",customer:"Metro Clinic",owner:"u-sales",start:`${today()}T10:00`,end:`${today()}T10:30`,location:"Video call",attendees:"farhan@example.com",status:"Scheduled",notes:"Review sales workflow"}];
  state.expenses ||= [{id:"expense-demo",description:"Software subscriptions",category:"Software",amount:120,currency:"USD",date:today(),status:"Paid",owner:"u-admin",vendor:"Demo vendor"}];
}
function operationsView() {
  switch(state.view) {
    case "products": return (currentUser().role === "sales" ? '<h2>Products & pricing</h2>' : toolbar("Products & pricing","product",["Active","Archived"])) + table(["Product / SKU","Category","Unit price","Status","Actions"],rowsFor("product").map(item=>`<tr><td><strong>${esc(item.name)}</strong><div class="muted">${esc(item.sku)}</div><p>${esc(item.description)}</p></td><td>${esc(item.category)}</td><td>${amount(item.price,item.currency)}</td><td>${badge(item.status)}</td><td>${actions("product",item)}</td></tr>`));
    case "quotations": return toolbar("Quotations","quotation",["Draft","Sent","Accepted","Rejected","Converted"]) + table(["Quotation","Customer","Value","Valid until","Status","Actions"],rowsFor("quotation").map(item=>`<tr><td>${esc(item.id)}</td><td>${esc(item.customer)}</td><td>${amount(CRM.totals(item).total,item.currency)}</td><td>${esc(item.due)}</td><td>${badge(item.status)}</td><td><div class="actions">${button("pdf",item.id,"file-down","Download quotation PDF","quotation")}${actions("quotation",item)}${allowed("invoices") && !item.convertedInvoiceId && item.status === "Accepted" ? button("quote-convert",item.id,"receipt","Convert to invoice") : ""}${item.convertedInvoiceId ? `<span class="muted">${esc(item.convertedInvoiceId)}</span>` : ""}</div></td></tr>`));
    case "orders": return toolbar("Orders","order",["Draft","Confirmed","In Progress","Completed","Cancelled"]) + table(["Order","Customer / Items","Owner","Value","Due","Status","Actions"],rowsFor("order").map(item=>`<tr><td>${esc(item.id)}</td><td>${esc(item.customer)}<div class="muted">${esc(item.description)} x ${item.quantity}</div></td><td>${esc(ownerName(item.owner))}</td><td>${amount(item.quantity*item.price,item.currency)}</td><td>${esc(item.due)}</td><td>${badge(item.status)}</td><td>${actions("order",item)}</td></tr>`));
    case "expenses": return toolbar("Expenses","expense",["Planned","Paid","Cancelled"]) + table(["Expense","Category / Vendor","Date","Amount","Status","Actions"],rowsFor("expense").map(item=>`<tr><td>${esc(item.description)}</td><td>${esc(item.category)}<div class="muted">${esc(item.vendor)}</div></td><td>${esc(item.date)}</td><td>${amount(item.amount,item.currency)}</td><td>${badge(item.status)}</td><td>${actions("expense",item)}</td></tr>`));
    case "payments": return paymentsView();
    case "calendar": return calendarView();
    case "timeline": return `<div class="table-toolbar"><h2>Activity timeline</h2></div>` + table(["Time","Team member","Activity"],records("activity").filter(item=>`${item.text} ${ownerName(item.owner)}`.toLowerCase().includes(state.search.toLowerCase())).map(item=>`<tr><td>${esc(item.time)}</td><td>${esc(ownerName(item.owner))}</td><td>${esc(item.text)}</td></tr>`));
    default: return "";
  }
}
function operationsConfig(type) {
  const owner={name:"owner",label:"Owner",type:"select",value:currentUser().id,options:state.users.filter(user=>user.status === "Active").map(user=>({value:user.id,label:user.name}))};
  const currency={name:"currency",label:"Currency",type:"select",value:state.settings.currency,options:["USD","AED","GBP","EUR"]};
  const date={name:"date",label:"Date",type:"date",required:true,value:today()};
  const configs={
    product:[{name:"name",label:"Product or service",required:true},{name:"sku",label:"SKU",required:true},{name:"category",label:"Category",value:"Service"},{name:"price",label:"Unit price",type:"number",required:true,value:0},currency,{name:"cost",label:"Unit cost",type:"number",value:0},{name:"status",label:"Status",type:"select",options:["Active","Archived"],value:"Active"},{name:"description",label:"Description",type:"textarea"}],
    order:[{name:"customer",label:"Customer",required:true},owner,{name:"description",label:"Order items / service",required:true,span:true},{name:"quantity",label:"Quantity",type:"number",min:0.01,value:1,required:true},{name:"price",label:"Unit price",type:"number",value:0,required:true},currency,date,{name:"due",label:"Delivery target",type:"date",value:today(),required:true},{name:"status",label:"Status",type:"select",options:["Draft","Confirmed","In Progress","Completed","Cancelled"],value:"Draft"}],
    expense:[{name:"description",label:"Expense",required:true},{name:"category",label:"Category",type:"select",options:["Software","Travel","Marketing","Payroll","Office","Other"]},{name:"vendor",label:"Vendor"},{name:"amount",label:"Amount",type:"number",required:true,min:0.01,value:1},currency,date,{name:"status",label:"Status",type:"select",options:["Planned","Paid","Cancelled"],value:"Planned"},owner],
    meeting:[{name:"title",label:"Meeting title",required:true},{name:"customer",label:"Customer / Related to"},owner,{name:"start",label:"Starts (local time)",type:"datetime-local",required:true,value:`${today()}T10:00`},{name:"end",label:"Ends (local time)",type:"datetime-local",required:true,value:`${today()}T10:30`},{name:"location",label:"Location or video link"},{name:"attendees",label:"Attendee emails"},{name:"status",label:"Status",type:"select",options:["Scheduled","Completed","Cancelled"],value:"Scheduled"},{name:"notes",label:"Agenda",type:"textarea",span:true}]
  };
  return {fields:configs[type]};
}
function validateOperations(type,data,existing) {
  if (type === "product" && state.products.some(product=>product.id !== existing?.id && product.sku.toLowerCase() === data.sku.toLowerCase())) throw new Error("This SKU already exists.");
  if (type === "order" && data.due < data.date) throw new Error("Delivery cannot be before the order date.");
  if (type === "meeting") {
    if (new Date(data.end) <= new Date(data.start)) throw new Error("Meeting end must be after its start.");
    const owner=data.owner || currentUser().id;
    if (data.status === "Scheduled" && state.meetings.some(meeting=>meeting.id !== existing?.id && meeting.owner === owner && meeting.status === "Scheduled" && meeting.start < data.end && meeting.end > data.start)) throw new Error("This owner already has a meeting at that time.");
  }
}
function paymentsView() {
  const payments=records("invoices").flatMap(invoice=>invoice.payments.map(payment=>({...payment,invoiceId:invoice.id,customer:invoice.customer,currency:invoice.currency})));
  return `<div class="table-toolbar"><h2>Payments</h2>${button("payments-export","","download","Export CSV","",true)}</div>`+table(["Date","Invoice","Customer","Method","Amount",""],payments.filter(payment=>`${payment.customer} ${payment.invoiceId} ${payment.method}`.toLowerCase().includes(state.search.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date)).map(payment=>`<tr><td>${esc(payment.date)}</td><td>${esc(payment.invoiceId)}</td><td>${esc(payment.customer)}</td><td>${esc(payment.method)}</td><td>${amount(payment.amount,payment.currency)}</td><td>${button("invoice",payment.invoiceId,"eye","View invoice")}</td></tr>`)) + '<p class="service-note">Payments are recorded against invoices. No money is collected by this demo.</p>';
}
function convertQuote(recordId) {
  const quote=accessible("quotation",recordId); if(!quote || !allowed("invoices")) return;
  if(quote.convertedInvoiceId || quote.status !== "Accepted") return showToast("Only accepted, unconverted quotations can become invoices.");
  if(!confirm("Create an invoice from this accepted quotation?")) return;
  const invoiceId=nextDocumentId("invoices","INV");
  state.invoices.unshift({id:invoiceId,customer:quote.customer,currency:quote.currency,items:structuredClone(quote.items),tax:quote.tax,discount:quote.discount,notes:quote.notes || "",issueDate:today(),due:quote.due < today() ? today() : quote.due,status:"Draft",payments:[],createdAt:stamp(),quotationId:quote.id});
  quote.convertedInvoiceId=invoiceId;quote.status="Converted";commit(`Quotation converted to ${invoiceId}`);
}
function calendarView() {
  const [year,month]=calendarMonth.split('-').map(Number);
  const offset=(new Date(year,month-1,1).getDay()+6)%7;
  const days=new Date(year,month,0).getDate();
  const meetings=rowsFor("meeting");const tasks=records("tasks").filter(task=>task.status !== "Done");
  return toolbar("Calendar & meetings","meeting",["Scheduled","Completed","Cancelled"]) + `<div class="calendar-controls">${button("month-prev","","chevron-left","Previous month")}<input id="calendar-month" aria-label="Calendar month" type="month" value="${calendarMonth}">${button("month-next","","chevron-right","Next month")}${button("month-today","","calendar-days","Today","",true)}<span class="muted">${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}</span></div><div class="calendar-scroll"><div class="calendar-grid">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=>`<strong class="weekday">${day}</strong>`).join('')}${Array.from({length:offset},()=>'<div class="calendar-day empty"></div>').join('')}${Array.from({length:days},(_,index)=>{
    const date=`${calendarMonth}-${String(index+1).padStart(2,'0')}`;
    return `<section class="calendar-day ${date === today() ? 'today' : ''}"><strong>${index+1}</strong>${meetings.filter(meeting=>meeting.start.slice(0,10) === date).map(meeting=>`<button class="calendar-event" data-action="edit" data-type="meeting" data-id="${esc(meeting.id)}">${esc(meeting.start.slice(11))} ${esc(meeting.title)}</button>`).join('')}${tasks.filter(task=>task.due === date).map(task=>`<button class="calendar-event task-event" data-action="edit" data-type="task" data-id="${esc(task.id)}">${esc(task.title)}</button>`).join('')}</section>`;
  }).join('')}</div></div><h2 class="workspace-section">Meeting agenda</h2>${table(["Meeting","Starts / Ends","Owner","Location","Status","Actions"],meetings.filter(meeting=>meeting.start.startsWith(calendarMonth)).sort((a,b)=>a.start.localeCompare(b.start)).map(meeting=>`<tr><td>${esc(meeting.title)}<div class="muted">${esc(meeting.customer)}</div></td><td>${esc(meeting.start.replace('T',' '))}<div class="muted">${esc(meeting.end.replace('T',' '))}</div></td><td>${esc(ownerName(meeting.owner))}</td><td>${esc(meeting.location)}</td><td>${badge(meeting.status)}</td><td><div class="actions">${actions("meeting",meeting)}${button("meeting-ics",meeting.id,"calendar-plus","Download meeting")}</div></td></tr>`))}`;
}
function analyticsDashboard() {
  const currency=state.settings.currency;
  const admin=allowed("payments");
  const orders=records("orders").filter(order=>order.date.startsWith(String(reportYear)) && order.status !== "Cancelled");
  const income=Array(12).fill(0),expenses=Array(12).fill(0);
  if(admin) {
    records("invoices").filter(invoice=>invoice.currency === currency && invoice.status !== "Void").forEach(invoice=>invoice.payments.forEach(payment=>{if(payment.date.startsWith(String(reportYear))) income[Number(payment.date.slice(5,7))-1]+=Number(payment.amount);}));
    records("expenses").filter(expense=>expense.currency === currency && expense.status === "Paid" && expense.date.startsWith(String(reportYear))).forEach(expense=>expenses[Number(expense.date.slice(5,7))-1]+=Number(expense.amount));
  } else records("deals").filter(deal=>deal.stage === "Won" && deal.due.startsWith(String(reportYear))).forEach(deal=>income[Number(deal.due.slice(5,7))-1]+=Number(deal.amount));
  const totalIncome=income.reduce((a,b)=>a+b,0),totalExpenses=expenses.reduce((a,b)=>a+b,0);
  const max=Math.max(...income,...expenses,1);
  const years=[...new Set([new Date().getFullYear(),reportYear,...records("deals").map(deal=>Number(deal.due?.slice(0,4))).filter(Boolean),...records("invoices").flatMap(invoice=>invoice.payments.map(payment=>Number(payment.date.slice(0,4))))])].sort((a,b)=>b-a);
  return `<div class="table-toolbar"><div><h2>${esc(currentUser().name)}'s overview</h2><span class="muted">${esc(currency)} / ${admin ? 'Cash basis' : 'Won sales by closing date'}</span></div><select id="report-year" aria-label="Report year">${years.map(year=>`<option ${year===reportYear?'selected':''}>${year}</option>`).join('')}</select></div><div class="grid cols-3 analytics-metrics">${metric("Orders",orders.length,"shopping-bag",`${amount(orders.filter(order=>order.currency === currency).reduce((sum,order)=>sum+order.quantity*order.price,0))} order value`)}${metric(admin?"Recorded income":"Won sales",amount(totalIncome),"wallet","Selected year")}${metric(admin?"Recorded profit":"Sales target",amount(admin?totalIncome-totalExpenses:state.settings.salesTarget),"chart-no-axes-combined",admin?`${amount(totalExpenses)} paid expenses / cash basis`:"Company target")}</div><section class="revenue-section"><h2>${admin?'Income & expenses':'Won sales'}</h2><div class="chart-legend"><span><i class="income-key"></i>${admin?'Income':'Sales'}</span>${admin?'<span><i class="expense-key"></i>Expenses</span>':''}</div><div class="revenue-chart" role="img" aria-label="Monthly ${admin?'income and expenses':'won sales'} chart for ${reportYear}">${income.map((value,index)=>`<div class="month-bar"><div class="bar-pair"><div class="income-bar" style="height:${value/max*160}px" title="${amount(value)}"></div>${admin?`<div class="expense-bar" style="height:${expenses[index]/max*160}px" title="${amount(expenses[index])}"></div>`:''}</div><span>${new Date(2000,index,1).toLocaleDateString('en',{month:'short'})}</span></div>`).join('')}</div><details><summary>Monthly figures</summary>${table(["Month",admin?"Income":"Sales",...(admin?["Expenses","Recorded profit"]:[])],income.map((value,index)=>`<tr><td>${new Date(2000,index,1).toLocaleDateString('en',{month:'long'})}</td><td>${amount(value)}</td>${admin?`<td>${amount(expenses[index])}</td><td>${amount(value-expenses[index])}</td>`:''}</tr>`))}</details></section>`;
}
function bindOperations() {
  document.querySelector('#calendar-month')?.addEventListener('change',event=>{if(/^\d{4}-\d{2}$/.test(event.target.value)){calendarMonth=event.target.value;render();}});
  document.querySelector('#report-year')?.addEventListener('change',event=>{reportYear=Number(event.target.value);render();});
}
document.addEventListener('click',event=>{
  const buttonEl=event.target.closest('[data-action]');if(!buttonEl || !currentUser())return;
  const {action,id:recordId}=buttonEl.dataset;
  if(action === 'theme') { const theme=document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme=theme; localStorage.setItem('salespilot-theme',theme); }
  if(action === 'notifications') {
    const tasks=records('tasks').filter(task=>task.status !== 'Done' && task.due && task.due <= today());
    const messages=records('messages').filter(message=>message.status === 'Scheduled' && message.due <= today());
    const tickets=records('tickets').filter(ticket=>ticket.status !== 'Resolved' && ticket.priority === 'High');
    dialog('Needs attention', `<h3>Due tasks (${tasks.length})</h3>${tasks.map(task=>`<p>${esc(task.title)} / ${esc(task.due)}</p>`).join('') || '<p class="muted">All caught up.</p>'}<h3>Due reminders (${messages.length})</h3>${messages.map(message=>`<p>${esc(message.subject)} / ${esc(message.recipient)}</p>`).join('') || '<p class="muted">No reminders due.</p>'}<h3>High-priority tickets (${tickets.length})</h3>${tickets.map(ticket=>`<p>${esc(ticket.issue)}</p>`).join('') || '<p class="muted">No urgent tickets.</p>'}`, null);
  }
  if(action === 'quote-convert')convertQuote(recordId);
  if(action.startsWith('month-') && allowed('calendar')) {
    if(action === 'month-today')calendarMonth=today().slice(0,7);
    else {const date=new Date(`${calendarMonth}-15T12:00:00`);date.setMonth(date.getMonth()+(action==='month-next'?1:-1));calendarMonth=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;}
    render();
  }
  if(action === 'meeting-ics')downloadMeeting(recordId);
  if(action === 'payments-export' && allowed('payments')) {
    const rows=records('invoices').flatMap(invoice=>invoice.payments.map(payment=>({invoice:invoice.id,customer:invoice.customer,currency:invoice.currency,...payment})));
    if(rows.length)download(`payments-${today()}.csv`,Papa.unparse(rows,{escapeFormulae:true}),'text/csv');else showToast('No payments to export.');
  }
});
function downloadMeeting(recordId) {
  const meeting=accessible('meeting',recordId);if(!meeting)return;
  const quote=value=>String(value||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const utc=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  download(`${meeting.id}.ics`,['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SalesPilot//CRM//EN','BEGIN:VEVENT',`UID:${meeting.id}@salespilot.local`,`DTSTAMP:${utc(stamp())}`,`DTSTART:${utc(meeting.start)}`,`DTEND:${utc(meeting.end)}`,`SUMMARY:${quote(meeting.title)}`,`DESCRIPTION:${quote(meeting.notes)}`,`LOCATION:${quote(meeting.location)}`,`STATUS:${meeting.status==='Cancelled'?'CANCELLED':'CONFIRMED'}`,'END:VEVENT','END:VCALENDAR'].join('\r\n'),'text/calendar');
}

migrate();
document.documentElement.dataset.theme=localStorage.getItem('salespilot-theme') || 'light';
render();
