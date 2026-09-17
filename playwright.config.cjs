const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({
  testDir:'./tests/browser', workers:1, timeout:60000,
  use:{baseURL:process.env.CRM_TEST_URL || 'http://127.0.0.1:8891', headless:true, ...(process.env.CRM_BROWSER ? {launchOptions:{executablePath:process.env.CRM_BROWSER}} : {channel:'msedge'})},
  webServer:process.env.CRM_TEST_URL ? undefined : {command:'python -m http.server 8891 --bind 127.0.0.1',url:'http://127.0.0.1:8891',reuseExistingServer:false}
});
