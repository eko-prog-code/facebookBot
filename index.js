const puppeteer = require('puppeteer');
const password = require('./config').password;

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 20
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(1000000);
    await page.setViewport({ width: 1000, height: 600 });
    await page.goto('https://www.facebook.com');
    
    // Menunggu dan mengetikkan email dan password
    await page.waitForSelector('#email');
    await page.type('#email', 'ekosetiaji929@gmail.com');
    await page.type('#pass', password); 
    await page.click(`[type="submit"]`);
    
    await page.waitForNavigation();
    await page.click(`div`); // Mengklik overlay hitam jika muncul setelah login

    // Gunakan XPath untuk menunggu elemen dengan teks "Apa yang Anda pikirkan, Eko?"
    await page.waitForXPath("//span[contains(text(), 'Apa yang Anda pikirkan, Eko?')]");
    const elements = await page.$x("//span[contains(text(), 'Apa yang Anda pikirkan, Eko?')]");

    if (elements.length > 0) {
      await elements[0].click();  // Klik elemen pertama yang ditemukan
    } else {
      console.log("Tidak dapat menemukan elemen dengan teks 'Apa yang Anda pikirkan, Eko?'");
      return;
    }

    // Mengetikkan konten di dalam post yang baru dibuat
    let sentenceList = [
      `I will give just about anything.`,
      `Robot ketik teks ini secara otomatis.`
    ];

    for (let j = 0; j < sentenceList.length; j++) {
      let sentence = sentenceList[j];
      for (let i = 0; i < sentence.length; i++) {
        await page.keyboard.press(sentence[i]);
        if (i === sentence.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));  // Menunggu 2 detik
          await page.keyboard.down('Control');
          await page.keyboard.press(String.fromCharCode(13)); // Tekan Enter (karakter kode 13)
          await page.keyboard.up('Control');
          await new Promise(resolve => setTimeout(resolve, 4000));  // Menunggu 4 detik

          console.log('done');
          await elements[0].click();  // Kembali mengklik area post setelah selesai mengetik
        }
      }
    }

    // Menunggu tombol "Item Berikutnya" dan mengkliknya
    await page.waitForSelector('[aria-label="Berikutnya"]');
    await page.click('[aria-label="Berikutnya"]');
    console.log('Berhasil mengklik tombol "Berikutnya"');

    // Memakai metode langsung untuk klik tombol "Kirim"
    await page.waitForSelector('[aria-label="Kirim"]');
    await page.click('[aria-label="Kirim"]');
    console.log('Berhasil mengklik tombol "Kirim"');

  } catch (error) {
    console.error(error);
  }
})();
