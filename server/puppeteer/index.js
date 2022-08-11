const fs = require('fs');
const connectDB = require('../db/connect');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--disable-site-isolation-trials'],
  });

  // Create a new page
  const page = await browser.newPage();

  let results = [];

  // Loop through pagination and collect the data
  for (let index = 3; index < 4; index++) {
    await page.goto(`https://gogoanime.sk/?page=${index}`);

    // Get all the data from "Recent release" section, i.e: Anime image, title and url
    const itemList = await page.evaluate(() => {
      let items = [];
      const allItems = document.querySelectorAll('.items li');

      allItems.forEach((item) => {
        let itemImg = item.querySelector('.img a img[src]').getAttribute('src');
        let itemTitle = item.querySelector('.name').innerText;
        let itemEpisode = item.querySelector('.episode').innerText;
        let itemId = item.querySelector('.name a[href]').getAttribute('href');
        let itemUrl =
          'https://gogoanime.sk' +
          item.querySelector('.name a[href]').getAttribute('href');
        newItem = {
          urlId: itemId.slice(1),
          title: itemTitle,
          episode: itemEpisode,
          url: itemUrl,
          img: itemImg,
        };
        items.push(newItem);
      });
      return [...items];
    });

    results = [...results, ...itemList];
  }

  let urlArray = [];
  results.forEach((obj) => {
    urlArray.push(obj.url);
  });

  let videoUrls = [];
  for (let index = 0; index < urlArray.length; index++) {
    await page.goto(urlArray[index], { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('.headnav');

    const grabLinks = await page.evaluate(() => {
      let videoLink = document
        .querySelector('.play-video iframe[src]')
        .getAttribute('src');
      videoLink = 'https:' + videoLink;
      return videoLink;
    });

    videoUrls.push(grabLinks);
  }

  // Concat the videoURLs array with the results array
  for (let i = 0; i < videoUrls.length; i++) {
    for (let j = 0; j < results.length; j++) {
      results[i].videoUrl = videoUrls[i];
      delete results[i].url;
    }
  }

  let values = results.reduce((o, a) => {
    let ini = [];
    ini.push(a.title);
    ini.push(a.episode);
    ini.push(a.img);
    ini.push(a.urlId);
    ini.push(a.videoUrl);
    o.push(ini);
    return o;
  }, []);

  // Insert anime to DB
  connectDB.query(
    'INSERT INTO anime (anime_title, anime_ep, anime_img, anime_url, video_url) VALUES ?',
    [values],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Anime added to DB');
      }
    }
  );

  await browser.close();
})();
