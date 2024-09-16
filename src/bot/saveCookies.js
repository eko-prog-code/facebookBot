const puppeteer = require('puppeteer');
const fs = require('fs');
const password = require('./config').password;

const cookiesFilePath = './cookies.json';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 20,
    args: ['--disable-notifications'] // Disable notification popups
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(1000000);
  await page.setViewport({ width: 1000, height: 600 });

  await page.goto('https://www.facebook.com');

  // Proses login manual atau otomatis
  await page.waitForSelector('#email');
  await page.type('#email', 'ekosetiaji929@gmail.com');
  await page.type('#pass', password); 
  await page.click(`[type="submit"]`);

  await page.waitForNavigation();

  // Simpan cookies ke file
  const cookies = await page.cookies();
  fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));

  console.log('Cookies telah disimpan ke', cookiesFilePath);

  await browser.close();
})();
