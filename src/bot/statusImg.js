const puppeteer = require('puppeteer');
const password = require('./config').password;

(async () => {
  try {
    const clipboardy = await import('clipboardy'); // Import dynamic menggunakan ES Module

    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 20,
      args: ['--disable-notifications']
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(1000000);
    await page.setViewport({ width: 1000, height: 600 });
    
    await page._client.send('Browser.grantPermissions', {
      permissions: ['notifications'],
      origin: 'https://www.facebook.com'
    });

    await page.goto('https://www.facebook.com');
    
    await page.waitForSelector('#email');
    await page.type('#email', 'ekosetiaji929@gmail.com');
    await page.type('#pass', password); 
    await page.click(`[type="submit"]`);
    
    await page.waitForNavigation();

    await page.click(`div`);

    try {
      await page.waitForSelector('[aria-label="block"]', { timeout: 5000 });
      await page.click('[aria-label="block"]');
    } catch (e) {
      console.log('Pop-up notifikasi tidak muncul atau sudah ditutup');
    }

    await page.waitForFunction(
      (text) => {
        return [...document.querySelectorAll('span')].some(el => el.textContent.includes(text) && el.offsetParent !== null);
      },
      {},
      'Apa yang Anda pikirkan, Eko?'
    );

    const elements = await page.$x("//span[contains(text(), 'Apa yang Anda pikirkan, Eko?')]");
    if (elements.length > 0) {
      await elements[0].click();
    } else {
      console.log("Tidak dapat menemukan elemen dengan teks 'Apa yang Anda pikirkan, Eko?'");
      return;
    }

    // Gabungkan semua kalimat dari sentenceList menjadi satu string
    let sentenceList = [
      `https://cek-harga-kopi.vercel.app Berbagi Informasi, Memperluas Wawasan, Menginspirasi Perkembangan.`,
      `https://firebasestorage.googleapis.com/v0/b/moneymap-17021.appspot.com/o/Sinar%20Robusta.png?alt=media&token=cbd34d01-2833-462d-beb2-b581dca62737`,
      `Buat label lebih praktis tersedia fiturnya di https://cek-harga-kopi.vercel.app.`,
    ].join('\n');

    // Copy semua teks ke clipboard
    clipboardy.default.writeSync(sentenceList); // Mengakses default export dari clipboardy

    // Paste teks dari clipboard ke elemen input
    await page.keyboard.down('Control');
    await page.keyboard.press('V');
    await page.keyboard.up('Control');

    await page.waitForSelector('[aria-label="Berikutnya"]', { visible: true });
    await page.click('[aria-label="Berikutnya"]');
    console.log('Berhasil mengklik tombol "Berikutnya"');

    await page.waitForSelector('[aria-label="Kirim"]', { visible: true });
    await page.click('[aria-label="Kirim"]');
    console.log('Berhasil mengklik tombol "Kirim"');

  } catch (error) {
    console.error(error);
  }
})();
