const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
puppeteer.use(stealth());

const cookiesFilePath = path.resolve(__dirname, './cookies.json');

// Function to create a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 20,
      args: ['--disable-notifications']
    });

    const page = await browser.newPage();

    // Load cookies if they exist
    if (fs.existsSync(cookiesFilePath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
      await page.setCookie(...cookies);
    }

    await page.setDefaultNavigationTimeout(600000);
    await page.setViewport({ width: 1000, height: 600 });

    // List of group URLs
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
      //'https://www.facebook.com/groups/912305268951000',
      //'https://www.facebook.com/groups/800332590059070',
      //'https://www.facebook.com/groups/136712459711842'
    ];

    let scrapedData = [];

    // Iterate through each group
    for (const groupUrl of groupUrls) {
      console.log(`Scraping group: ${groupUrl}`);
      
      // Navigate to the group
      await page.goto(groupUrl);
      await delay(5000); // Wait for group page to load

      // Scroll down to load the latest posts
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        await delay(3000); // Wait for content to load after each scroll
      }

      // Extract the latest 1 post
      const posts = await page.evaluate(() => {
        const postElements = document.querySelectorAll('div[class*="xdj266r x11i5rnm xat24cr"]');
        let postData = [];
        
        postElements.forEach((post, index) => {
          if (index === 0) {  // Limit to only the latest post
            const messageElement = post.querySelector('div[dir="auto"]');
            const content = messageElement ? messageElement.innerText : ''; // Handle null case
            postData.push({
              content,
              comments: []
            });
          }
        });
        return postData;
      });

      console.log("Scraped the latest post:", posts);

      // For the post, find and click the comment icon to display comments
      await page.evaluate(async () => {
        const post = document.querySelectorAll('div[class*="xdj266r x11i5rnm xat24cr"]')[0]; // First post
        if (post) {
          // Find and click the comment icon
          const commentIcon = post.querySelector('i[data-visualcompletion="css-img"]');
          if (commentIcon) {
            commentIcon.click(); // Open comments by clicking the icon
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for comments to load
          }
        }
      });

      // Scrape comments for the post
      posts[0].comments = await page.evaluate(() => {
        const post = document.querySelectorAll('div[class*="xdj266r x11i5rnm xat24cr"]')[0];
        const commentElements = post ? post.querySelectorAll('div[aria-label^="Komentar oleh"]') : [];
        let comments = [];

        commentElements.forEach(comment => {
          const commentText = comment.querySelector('div[dir="auto"]');
          if (commentText) {
            comments.push(commentText.innerText);
          }
        });
        return comments;
      });
      
      console.log("Scraped comments for the latest post:", posts[0].comments);

      // Add the group's data to the scrapedData array
      scrapedData.push({
        groupUrl,
        posts
      });

      console.log(`Finished scraping group: ${groupUrl}`);
    }

    // Save the results
    fs.writeFileSync('facebook_group_scraped_data.json', JSON.stringify(scrapedData, null, 2));
    console.log("Saved scraped data to facebook_group_scraped_data.json");

    await browser.close();
  } catch (error) {
    console.error('Error occurred:', error);
  }
})();
