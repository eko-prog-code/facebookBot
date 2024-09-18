const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

// Import the password from the config file
const { password } = require('./config');

puppeteer.use(stealth());

const cookiesFilePath = path.resolve(__dirname, './cookies.json');

(async () => {
  // Dynamic import for clipboardy
  const { default: clipboardy } = await import('clipboardy');

  const groupUrls = [
    'https://www.facebook.com/groups/173219855023', //STIKES BHAMADA SLAWI
    'https://www.facebook.com/groups/313975032061603', //STIKES INDONESIA PADANG
    'https://www.facebook.com/groups/237895017791947', //PPNI (PERSATUAN PERAWAT NASIONAL INDONESIA)
    'https://www.facebook.com/groups/173474462664261', //STIKES JENDRAL ACHMAD YANI CIMAHI
    'https://www.facebook.com/groups/169645779731418', //STIKES, D3 KEBIDANAN, D3 KEPERAWATAN NWU UNGARAN
    'https://www.facebook.com/groups/145117078878555', //STIKES SANTO BORROMEUS
    'https://www.facebook.com/groups/164289776933433', //STIKES BHAKTI KENCANA ALUMNUS
    'https://www.facebook.com/groups/102612199669', //STIKES ST.ELISABETH - SEMARANG
    'https://www.facebook.com/groups/stikesmh', //STIKes Maluku Husada
    'https://www.facebook.com/groups/2220466661538254', //PRODI KESMAS STIKES MALUKU HUSADA
    'https://www.facebook.com/groups/614824051999337', //Stikes Maluku Husada 2015
    'https://www.facebook.com/groups/224112662436172', //Stikes Bina Bangsa Majene 
    'https://www.facebook.com/groups/90409058754', //STIKes Dharma Husada Bandung
    'https://www.facebook.com/groups/118177181582117', //IKA - STIKES Insan Unggul Surabaya
    'https://www.facebook.com/groups/193993520612884', //IKA STIKES ABI SURABAYA
    'https://www.facebook.com/groups/1438896363012858', //Forum Alumni Stikes A.Yani Cimahi

    //'https://www.facebook.com/stikesyayasanrsdrsoetomo', //Stikes YRSDS 
    //'https://www.facebook.com/stikeshangtuahsurabaya', //Stikes.hangtuahsby
    //'https://www.facebook.com/profile.php?id=100066803319027', //STIKes Dharma Husada Bandung
    //'https://www.facebook.com/stikesbhaktipertiwi.id', //STIKes Bhakti Pertiwi Indonesia 
    //'https://www.facebook.com/profile.php?id=100066803319027', //STIKes Dharma Husada Bandung 
    //'https://www.facebook.com/stikessumedan', //STIKES Sumatera Utara 
    //'https://www.facebook.com/stikessantaelisabethmedan', //STIKes Santa Elisabeth Medan
    //'https://www.facebook.com/stikesngestiwaluyo.parakan.3', //Stikes Ngesti Waluyo Parakan
    //'https://www.facebook.com/profile.php?id=100083353901881', //PROGRAM STUDI DIII KEPERAWATAN STIKES PERINTIS SUMATERA BARAT
    //'https://www.facebook.com/groups/mwibut', //ALUMNI PERAWAT STIKES BORROMEUS BANDUNG
    // 'https://www.facebook.com/stikes.williamboothsurabaya', //Stikes William Booth Surabaya 
    // 'https://www.facebook.com/perawatstikesby', //Keperawatan Stikes Surabaya
    //'https://www.facebook.com/alumniunusa', //Alumni Unusa / Stikes Yarsis 
  ];

  const sentenceList = [
    `https://youtu.be/7twuULLhdrs`,
    `Karir tenaga medis sering kali dimulai dari tahap **fresh graduate**, di mana lulusan baru menempuh **internship** atau magang klinis sebagai langkah awal. Setelah itu, biasanya mereka mulai bekerja di rumah sakit (RS) atau klinik untuk mendapatkan pengalaman lebih lanjut dan membangun kompetensi klinis yang solid.

Namun, ada masa **gap** di mana mereka mungkin merasa tidak pasti atau menghadapi tantangan untuk memulai langkah karir berikutnya. Di sinilah konsep **"mulai aja dahulu"** muncul sebagai dorongan untuk memanfaatkan peluang praktis seperti membuka layanan seperti **Rawat Luka**, **Sunat Modern**, atau **Pengobatan Umum**. Ini adalah transisi alami yang memungkinkan tenaga medis tetap produktif dan terus berkembang, meskipun berada di masa peralihan.

Untuk mendukung transformasi ini, lahirlah **MedicTech RME**, sebuah solusi digital yang mengubah cara fasilitas kesehatan (fasyankes) mencatat dan mengelola riwayat pengobatan pasien. Dengan digitalisasi, catatan pengobatan pasien menjadi lebih aman, terintegrasi, dan dapat diakses secara **real-time**, termasuk melalui platform **Satu Sehat Kemenkes**. 

**MedicTech RME** memungkinkan pengobatan yang lebih cepat, presisi, dan aman dengan rekomendasi obat yang didasarkan pada data kesehatan yang akurat. Hal ini membawa manfaat besar bagi tenaga medis dan masyarakat, meningkatkan keamanan, efisiensi, dan kepercayaan terhadap layanan kesehatan.

Inilah visi karir medis yang berkembang: beranjak dari pengalaman klinis dasar, melalui masa transisi dengan inovasi dan adaptasi, hingga menjadi bagian dari ekosistem **digital health** yang berfokus pada kualitas, keselamatan, dan presisi.`,
    `MedicTech RME vendor resmi satu sehat`
  ].join('\n'); // Gabungkan kalimat menjadi satu string

  // Function to create a delay
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  try {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 20,
      args: ['--disable-notifications']
    });

    const page = await browser.newPage();

    // Load cookies if they exist
    if (fs.existsSync(cookiesFilePath)) {
      try {
        const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
        if (Array.isArray(cookies)) {
          await page.setCookie(...cookies);
          console.log('Cookies have been loaded.');
        } else {
          console.log('Cookies file is not a valid JSON array.');
        }
      } catch (error) {
        console.log('Error loading cookies:', error.message);
      }
    }

    await page.setDefaultNavigationTimeout(600000); // Increased timeout
    await page.setViewport({ width: 1000, height: 600 });

    // Verify if already logged in by checking the URL or a logged-in element
    await page.goto('https://www.facebook.com');
    console.log('Navigated to Facebook');
    console.log('Current URL:', page.url());

    // Example: Check if the user is logged in by looking for a specific element
    const isLoggedIn = await page.$('div[role="banner"]'); // Update with an actual element that appears when logged in
    if (isLoggedIn) {
      console.log('User is logged in. Proceeding to groups.');
    } else {
      console.log('User is not logged in or unable to find logged-in element.');
      return;
    }

    // Iterate through each group URL
    for (const groupUrl of groupUrls) {
      console.log(`Mengunjungi grup: ${groupUrl}`);
      await page.goto(groupUrl);
      await delay(10000); // Wait for the page to fully load

      // Check and close notification popup if available
      const popupCloseButtonSelector = '[aria-label="Block"]'; // Adjust to the actual selector
      if (await page.$(popupCloseButtonSelector)) {
        await page.click(popupCloseButtonSelector);
        console.log('Popup notifikasi ditutup.');
      }

      // Wait for the "Tulis sesuatu..." input field to appear and be ready
      const inputFieldXPath = '//span[contains(text(), "Tulis sesuatu...")]';
      await page.waitForXPath(inputFieldXPath, { timeout: 60000 }); // Wait until the element is available
      const [inputField] = await page.$x(inputFieldXPath);
      if (inputField) {
        await inputField.click();
        console.log("Clicked on the input field.");

        // Ensure the input field is ready for text input
        await delay(3000); // Wait for any potential animations or field loading to complete

        // Copy the sentenceList to clipboard using clipboardy
        clipboardy.writeSync(sentenceList);
        console.log("sentenceList copied to clipboard.");

        // Simulate paste using keyboard shortcuts
        await page.keyboard.down('Control');
        await page.keyboard.press('V');
        await page.keyboard.up('Control');
        console.log("Pasted sentenceList into the input field.");

        // Wait for "Posting" button and click
        await page.waitForSelector('[aria-label="Posting"]', { timeout: 60000 });
        await page.click('[aria-label="Posting"]');
        console.log(`Berhasil memposting di grup: ${groupUrl}`);

        // Wait for potential pop-up after posting
        await delay(5000); // Allow time for the pop-up to appear

        // Handle the "Leave or Stay on Page" pop-up
        const exitPopupSelector = '[aria-label="Leave or Stay on Page"]'; // Adjust this selector
        const stayButtonSelector = '[aria-label="Stay on Page"]'; // Adjust the selector for the "Stay on Page" button

        if (await page.$(exitPopupSelector)) {
          console.log('Detected exit popup after posting.');
          await page.click(stayButtonSelector); // Click to stay on page
          console.log('Closed exit popup, staying on the page.');
        }

      } else {
        console.log('Tidak dapat menemukan elemen input "Tulis sesuatu..."');
        continue;
      }

      // Wait a few seconds before moving to the next group
      await delay(5000);
    }

    await browser.close();

  } catch (error) {
    console.error('Error occurred:', error);
  }
})();
