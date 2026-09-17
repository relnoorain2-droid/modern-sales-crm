const {test} = require('node:test');
const assert = require('node:assert/strict');
const CRM = require('../core.js');
test('invoice rounding, discount, tax, partial payment and overdue status', () => {
  const invoice = {items:[{quantity:2,rate:19.99},{quantity:1,rate:100}],discount:10,tax:5,payments:[{amount:50}],status:'Sent',due:'2026-01-01'};
  assert.deepEqual(CRM.totals(invoice),{subtotal:139.98,discount:14,tax:6.30,total:132.28,paid:50,balance:82.28});
  assert.equal(CRM.invoiceStatus(invoice,'2026-02-01'),'Overdue');
  invoice.payments.push({amount:82.28});
  assert.equal(CRM.invoiceStatus(invoice,'2026-02-01'),'Paid');
});
test('old invoices preserve total and paid status without adding tax',()=>{
  assert.equal(CRM.totals({amount:100,status:'Paid'}).balance,0);
  assert.equal(CRM.totals({amount:100,status:'Sent'}).total,100);
});
test('message links validate recipients and encode message content',()=>{
  assert.equal(CRM.messageLink('WhatsApp','+971 50 123 4567','','Hello & thanks'),'https://wa.me/971501234567?text=Hello%20%26%20thanks');
  assert.throws(()=>CRM.messageLink('WhatsApp','invalid','',''));
  assert.throws(()=>CRM.messageLink('Email','x@example.com?bcc=bad@example.com','',''));
  assert.match(CRM.messageLink('Email','x@example.com','A&B','Line\n2'),/subject=A%26B&body=Line%0A2/);
});
test('user text is escaped; malformed backups rejected',()=>{
  assert.equal(CRM.escape('<img src="x">'), '&lt;img src=&quot;x&quot;&gt;');
  assert.throws(()=>CRM.validateBackup({format:'salespilot-backup',version:1,data:{}}));
});
