const puppeteer = require('puppeteer');
const fs = require('fs');

const cookiesFilePath = './cookies.json';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 20,
    args: ['--disable-notifications'] // Disable notification popups
  });

  const page = await browser.newPage();

  // Memuat cookies dari file
  if (fs.existsSync(cookiesFilePath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
    await page.setCookie(...cookies);
  }

  await page.setDefaultNavigationTimeout(1000000);
  await page.setViewport({ width: 1000, height: 600 });
  await page.goto('https://www.facebook.com');

  // Cek dan tutup popup notifikasi jika ada
  const popupCloseButtonSelector = '[aria-label="Block"]'; // Sesuaikan dengan tombol "Block" popup
  if (await page.$(popupCloseButtonSelector)) {
    await page.click(popupCloseButtonSelector);
    console.log('Popup notifikasi ditutup.');
  }

  // Lakukan operasi lain seperti posting
  // ...

  await browser.close();
})();
