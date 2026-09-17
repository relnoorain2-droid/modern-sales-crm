const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
async function login(page,role='u-super') { await page.goto('./',{waitUntil:'domcontentloaded'}); await page.locator(`[data-login="${role}"]`).click(); }
async function nav(page,view) { await page.locator(`[data-view="${view}"]`).click(); }
test('all allowed views render without script errors, desktop and mobile fit',async({page})=>{
  test.setTimeout(120000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await login(page);
  await page.screenshot({path:'test-results/dashboard-desktop.png',fullPage:true});
  for(const view of ['dashboard','pipeline','contacts','leads','customers','products','quotations','orders','payments','expenses','calendar','timeline','tasks','invoices','tickets','subscriptions','messages','reports','users','settings']) {await nav(page,view);await expect(page.locator('.content')).not.toBeEmpty();}
  await nav(page,'invoices'); await page.screenshot({path:'test-results/invoices-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for(const view of ['dashboard','pipeline','invoices','users','calendar','settings']) {await nav(page,view);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),view).toBe(true);}
  await page.screenshot({path:'test-results/settings-mobile.png',fullPage:true});
  expect(errors).toEqual([]);
});
test('invoice line totals, PDF download, partial and full payment persist',async({page})=>{
  await login(page);await nav(page,'invoices');
  await page.locator('[data-action="edit"][data-type="invoice"][data-id=""]').click();
  await page.locator('#f-customer').fill('Test Customer');
  await page.getByRole('textbox',{name:'Item description',exact:true}).fill('Implementation service');
  await page.locator('[name="quantity"]').fill('2');await page.locator('[name="rate"]').fill('100');
  await page.locator('#f-tax').fill('5');await page.locator('#f-discount').fill('10');
  await expect(page.locator('#invoice-total')).toContainText('189.00');
  await page.locator('#work-form button[type="submit"]').click();
  const row=page.locator('tr').filter({hasText:'Test Customer'});await expect(row).toContainText('189.00');
  const downloadPromise=page.waitForEvent('download');await row.locator('[data-action="pdf"]').click();
  const download=await downloadPromise;const file=await download.path();expect(fs.readFileSync(file).subarray(0,4).toString()).toBe('%PDF');
  await row.locator('[data-action="payment"]').click();await page.locator('#f-amount').fill('50');await page.locator('#work-form button[type="submit"]').click();
  await expect(row).toContainText('139.00');
  await page.reload();await expect(page.locator('tr').filter({hasText:'Test Customer'})).toContainText('139.00');
  await page.locator('tr').filter({hasText:'Test Customer'}).locator('[data-action="payment"]').click();await page.locator('#work-form button[type="submit"]').click();
  await expect(page.locator('tr').filter({hasText:'Test Customer'})).toContainText('Paid');
});
test('role restrictions, assigned data and direct handlers',async({page})=>{
  await login(page,'u-sales');
  await expect(page.locator('[data-view="users"]')).toHaveCount(0);await expect(page.locator('[data-view="invoices"]')).toHaveCount(0);
  await nav(page,'contacts');await expect(page.locator('tbody')).toContainText('Metro Clinic');await expect(page.locator('tbody')).not.toContainText('Amina Travel Group');
  await page.evaluate(()=>{editRecord('user');editRecord('contact','c1');setView('settings');});
  await expect(page.locator('.modal')).toHaveCount(0);await expect(page.locator('[data-view="contacts"]')).toHaveClass('active');
  await page.locator('#logout').click();await page.locator('[data-login="u-manager"]').click();
  await expect(page.locator('[data-view="reports"]')).toHaveCount(1);await expect(page.locator('[data-view="settings"]')).toHaveCount(0);
  await page.locator('#logout').click();await page.locator('[data-login="u-admin"]').click();await nav(page,'users');
  await page.evaluate(()=>editRecord('user','u-super'));await expect(page.locator('.modal')).toHaveCount(0);
  await page.locator('[data-action="edit"][data-id=""]').click();await expect(page.locator('#f-role option')).toHaveCount(2);
});
test('ticket conversation persists and supports reopen',async({page})=>{
  await login(page);await nav(page,'tickets');await page.locator('[data-action="ticket"]').first().click();
  await page.locator('#f-text').fill('Customer confirmed the fix.');await page.locator('#f-status').selectOption('Resolved');await page.getByRole('button',{name:'Save update'}).click();
  await page.reload();await page.locator('[data-action="ticket"]').first().click();await expect(page.locator('.conversation')).toContainText('Customer confirmed the fix.');
  await page.locator('#f-status').selectOption('Open');await page.getByRole('button',{name:'Save update'}).click();await expect(page.locator('tbody tr').first()).toContainText('Open');
});
test('WhatsApp drafts are stored without sending',async({page})=>{
  await login(page);await nav(page,'contacts');await page.locator('[data-action="whatsapp"]').first().click();
  await expect(page.locator('#f-channel')).toHaveValue('WhatsApp');await expect(page.locator('#f-recipient')).toHaveValue('+971 50 456 2201');
  await page.locator('#f-status').selectOption('Scheduled');await page.locator('#work-form button[type="submit"]').click();await nav(page,'messages');
  await expect(page.locator('tbody')).toContainText('Scheduled');await expect(page.locator('tbody')).not.toContainText('Sent');
});
test('create account, login, pause account, prevent login',async({page})=>{
  await login(page);await nav(page,'users');await page.locator('[data-action="edit"][data-id=""]').click();
  await page.locator('#f-name').fill('New Agent');await page.locator('#f-email').fill('new@example.com');await page.locator('#f-password').fill('test1234');await page.locator('#work-form button[type="submit"]').click();
  await page.locator('#logout').click();await page.locator('#email').fill('new@example.com');await page.locator('#password').fill('test1234');await page.locator('#login-form button').click();await expect(page.locator('.user-card')).toContainText('New Agent');
  await page.locator('#logout').click();await page.locator('[data-login="u-super"]').click();await nav(page,'users');
  await page.locator('tr').filter({hasText:'new@example.com'}).locator('[data-action="edit"]').click();await page.locator('#f-status').selectOption('Paused');await page.locator('#work-form button[type="submit"]').click();
  await page.locator('#logout').click();await page.locator('#email').fill('new@example.com');await page.locator('#password').fill('test1234');await page.locator('#login-form button').click();await expect(page.locator('#login-form')).toBeVisible();
});
test('contact input is escaped and CSV export neutralizes spreadsheet formulas',async({page})=>{
  await login(page);await nav(page,'contacts');await page.locator('[data-action="edit"][data-id=""]').click();
  await page.locator('#f-name').fill('=SUM(1,2)');await page.locator('#f-contact').fill('<img src=x onerror=alert(1)>');await page.locator('#work-form button[type="submit"]').click();
  await expect(page.locator('tbody')).toContainText('<img src=x onerror=alert(1)>');await expect(page.locator('tbody img')).toHaveCount(0);
  const pending=page.waitForEvent('download');await page.locator('[data-action="export"]').click();const csv=fs.readFileSync(await(await pending).path(),'utf8');expect(csv).toContain("'=SUM");
});
test('CSV import, backup restore, and calendar downloads',async({page})=>{
  await login(page);await nav(page,'settings');await page.locator('[data-action="import"]').click();
  await page.locator('#contact-csv').setInputFiles({name:'contacts.csv',mimeType:'text/csv',buffer:Buffer.from('name,contact,email,phone\nImported Company,Jane,jane@example.com,+971501234567\nDuplicate,Jane,jane@example.com,+971501234567')});
  await page.getByRole('button',{name:'Import',exact:true}).click();await nav(page,'contacts');await expect(page.locator('tbody')).toContainText('Imported Company');await expect(page.locator('tbody')).not.toContainText('Duplicate');
  await nav(page,'settings');const pending=page.waitForEvent('download');await page.locator('[data-action="backup"]').click();const backupFile=await(await pending).path();const backup=JSON.parse(fs.readFileSync(backupFile));expect(backup.data.users).toBeUndefined();
  await page.locator('#f-company').fill('Changed Company');await page.getByRole('button',{name:'Save settings'}).click();
  page.once('dialog',dialog=>dialog.accept());const choose=page.waitForEvent('filechooser');await page.locator('[data-action="restore"]').click();await(await choose).setFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(page.locator('#f-company')).toHaveValue('SalesPilot CRM');
  await nav(page,'tasks');const event=page.waitForEvent('download');await page.locator('[data-action="calendar"]').first().click();expect(fs.readFileSync(await(await event).path(),'utf8')).toContain('BEGIN:VEVENT');
});
test('edit plans and deals, lost stage, contextual add, reset reminders',async({page})=>{
  await login(page);await nav(page,'subscriptions');await page.locator('[data-action="edit"][data-type="subscription"]').nth(1).click();await page.locator('#f-price').fill('35');await page.locator('#work-form button[type="submit"]').click();await expect(page.locator('.subscription-card').first()).toContainText('35.00');
  await nav(page,'pipeline');await page.locator('[data-stage="d2"]').selectOption('Lost');await expect(page.locator('.stage').filter({has:page.getByRole('heading',{name:/Lost/})})).toContainText('Clinic support automation');
  await nav(page,'tasks');await page.locator('#quick-add').click();await expect(page.locator('#dialog-title')).toHaveText('Add task');await page.getByRole('button',{name:'Close',exact:true}).last().click();
  page.once('dialog',dialog=>dialog.accept());await page.locator('#reset-demo').click();await nav(page,'messages');await page.locator('[data-action="edit"][data-id=""]').click();await page.locator('#f-recipient').fill('test@example.com');await page.locator('#f-body').fill('Reminder after reset');await page.locator('#work-form button[type="submit"]').click();await expect(page.locator('tbody')).toContainText('test@example.com');
});
test('catalog quotation PDF and accepted conversion are linked and idempotent',async({page})=>{
  await login(page);await nav(page,'quotations');await page.locator('#quick-add').click();
  await page.locator('#f-customer').fill('Quote Customer');await page.locator('#catalog-item').selectOption('p1');await page.locator('#f-status').selectOption('Accepted');await page.locator('#work-form button[type="submit"]').click();
  const row=page.locator('tr').filter({hasText:'Quote Customer'});await expect(row).toContainText('1,575.00');
  const file=page.waitForEvent('download');await row.locator('[data-action="pdf"]').click();expect((await file).suggestedFilename()).toMatch(/QUO-.*\.pdf/);
  page.once('dialog',dialog=>dialog.accept());await row.locator('[data-action="quote-convert"]').click();await expect(row).toContainText('Converted');await expect(row.locator('[data-action="quote-convert"]')).toHaveCount(0);
  await nav(page,'invoices');await expect(page.locator('tr').filter({hasText:'Quote Customer'})).toHaveCount(1);
});
test('meetings validate schedule conflicts, calendar export and new modules obey roles',async({page})=>{
  await login(page);await nav(page,'calendar');await page.locator('#quick-add').click();await page.locator('#f-title').fill('Demo workshop');await page.locator('#f-start').fill('2026-10-15T14:00');await page.locator('#f-end').fill('2026-10-15T15:00');await page.locator('#work-form button[type="submit"]').click();
  await page.locator('#calendar-month').fill('2026-10');await page.locator('#calendar-month').dispatchEvent('change');await expect(page.locator('.calendar-grid')).toContainText('Demo workshop');
  const pending=page.waitForEvent('download');await page.locator('[data-action="meeting-ics"]').click();expect(fs.readFileSync(await(await pending).path(),'utf8')).toContain('DTSTART:');
  await page.locator('#quick-add').click();await page.locator('#f-title').fill('Conflicting workshop');await page.locator('#f-start').fill('2026-10-15T14:30');await page.locator('#f-end').fill('2026-10-15T15:30');await page.locator('#work-form button[type="submit"]').click();await expect(page.locator('#form-error')).toContainText('already has a meeting');await page.getByRole('button',{name:'Close',exact:true}).last().click();
  await page.locator('#logout').click();await page.locator('[data-login="u-sales"]').click();await nav(page,'products');await expect(page.locator('[data-action="edit"][data-type="product"]')).toHaveCount(0);await page.evaluate(()=>editRecord('product','p1'));await expect(page.locator('.modal')).toHaveCount(0);await expect(page.locator('[data-view="expenses"]')).toHaveCount(0);await expect(page.locator('[data-view="payments"]')).toHaveCount(0);
});
test('expenses, orders, lead conversion, notifications and theme work',async({page})=>{
  await login(page);await nav(page,'expenses');await page.locator('#quick-add').click();await page.locator('#f-description').fill('Travel cost');await page.locator('#f-amount').fill('100');await page.locator('#f-status').selectOption('Paid');await page.locator('#work-form button[type="submit"]').click();await expect(page.locator('tbody')).toContainText('Travel cost');
  await nav(page,'orders');await page.locator('#quick-add').click();await page.locator('#f-customer').fill('Order Customer');await page.locator('#f-description').fill('Training');await page.locator('#f-price').fill('250');await page.locator('#work-form button[type="submit"]').click();await expect(page.locator('tbody')).toContainText('250.00');
  await nav(page,'leads');await page.locator('tr').filter({hasText:'Metro Clinic'}).locator('[data-action="edit"]').click();await page.locator('#f-status').selectOption('Customer');await page.locator('#work-form button[type="submit"]').click();await expect(page.locator('tbody')).not.toContainText('Metro Clinic');await nav(page,'customers');await expect(page.locator('tbody')).toContainText('Metro Clinic');
  await page.locator('[data-action="notifications"]').click();await expect(page.locator('#dialog-title')).toHaveText('Needs attention');await page.getByRole('button',{name:'Close',exact:true}).last().click();await page.locator('[data-action="theme"]').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
