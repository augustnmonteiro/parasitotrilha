const {defineConfig,devices}=require('@playwright/test');
const chromiumOptions=process.env.PARASITO_CHROMIUM_PATH?{executablePath:process.env.PARASITO_CHROMIUM_PATH}:{};
module.exports=defineConfig({
 testDir:'.',testMatch:'*.spec.cjs',fullyParallel:false,workers:1,timeout:30000,retries:0,reporter:'list',
 use:{baseURL:'http://127.0.0.1:4186',trace:'retain-on-failure'},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome'],launchOptions:chromiumOptions}},
  {name:'webkit',use:{...devices['Desktop Safari']}},
  {name:'celular',use:{...devices['iPhone 13'],browserName:'chromium',launchOptions:chromiumOptions}}
 ],
 webServer:{command:'node server.cjs',url:'http://127.0.0.1:4186',reuseExistingServer:false}
});
