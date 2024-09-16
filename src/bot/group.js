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
    'https://www.facebook.com/groups/912305268951000',
    'https://www.facebook.com/groups/800332590059070',
    'https://www.facebook.com/groups/136712459711842'
  ];

  const sentenceList = [
    `Harga kopi di kota anda berapa??...`,
    `Yuk commeent kota..Harga/grade?`
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
