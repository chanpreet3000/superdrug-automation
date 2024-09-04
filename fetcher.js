import {delay, headers} from './utils.js';
import {
  SUPERDRUG_API_HITS_DELAY_MS,
  discordMessagesConfig,
  filterProductsConfig,
  SUPERDRUG_MAX_REQUEST_ATTEMPTS,
  SUPERDRUG_RTE_DELAY_MS
} from "./data.js";
import xml2js from "xml2js";
import Logger from "./logger.js";
import {sendProductsInfoToDiscord} from "./discord.js";
import puppeteer from "puppeteer";


async function fetchXML(browser, url) {
  const page = await browser.newPage();

  for (let i = 0; i < SUPERDRUG_MAX_REQUEST_ATTEMPTS; i++) {
    try {
      await page.setExtraHTTPHeaders(headers);
      await page.goto(url, {waitUntil: 'networkidle0'});
      const content = await page.content();
      const parser = new xml2js.Parser({explicitArray: false, mergeAttrs: true});
      const jsonData = await parser.parseStringPromise(content);
      return jsonData['html']['body']['div'][0];
    } catch (error) {
      Logger.error(`Attempt ${i + 1} to fetch ${url} failed`, error);
      if (i === SUPERDRUG_MAX_REQUEST_ATTEMPTS - 1) throw error;
      await delay(SUPERDRUG_RTE_DELAY_MS);
    }
  }
}

const transformProducts = (products) => {
  return products.map(product => {
    const {
      averageRating,
      code,
      contentUnitPrice,
      images,
      inStockFlag,
      masterBrand,
      name,
      numberOfReviews,
      price,
      promotions,
      stock,
      url,
    } = product;

    let transformedPromotions = [];
    try {
      transformedPromotions = promotions ? promotions.filter(promotion => promotion.tag).map(promotion => promotion.tag.label) : [];
    } catch (_) {
    }

    const oldFormattedPrice = price.formattedOldValue || price.formattedValue;
    const newFormattedPrice = price.formattedValue;
    const oldPrice = price.oldValue || price.value;
    const newPrice = price.value;
    const discount = oldPrice > newPrice ? ((oldPrice - newPrice) / oldPrice) * 100 : 0;
    const priceObj = {
      oldFormattedPrice: oldFormattedPrice,
      newFormattedPrice: newFormattedPrice,
      oldPrice: oldPrice,
      newPrice: newPrice,
      discount: discount.toFixed(2)
    };

    return {
      "averageRating": averageRating,
      "code": code,
      "contentUnitPrice": contentUnitPrice,
      "imageUrl": images ? `https://media.superdrug.com${images.url}` : '',
      "inStockFlag": inStockFlag,
      "masterBrand": masterBrand.name,
      "name": name,
      "numberOfReviews": numberOfReviews,
      "price": priceObj,
      "isInStock": stock.stockLevelStatus === 'inStock',
      'promotions': transformedPromotions,
      "website_url": `https://www.superdrug.com${url}`,
    }
  });
}

const filterProductsForNotification = (products) => {
  // Implement the filter logic here
  return products.filter((product) => {
    if (filterProductsConfig.bannedBrandNames.includes(product.masterBrand)) return false;
    if (product.numberOfReviews < filterProductsConfig.minNumberOfReviews) return false;
    if (product.averageRating < filterProductsConfig.minRating) return false;
    return product.isInStock;
  })
}

export async function fetchAllPages(baseUrl) {
  let currentPage = 0;
  let totalPages;
  const allProducts = []
  Logger.info(`Fetching data from page=${currentPage}`);
  const browser = await puppeteer.launch({headless: true});

  do {
    const url = `${baseUrl}&currentPage=${currentPage}`;
    const result = await fetchXML(browser, url);
    const pageData = result['productCategorySearchPage'];
    const products = pageData['products'];
    totalPages = pageData['pagination']['totalPages'];

    Logger.info(`Data Fetched from Superdrug API`, {
      currentPage, totalPages, url,
    });

    // Transform the products and log the data
    const transformedProducts = transformProducts(products);
    allProducts.push(...transformedProducts);

    // Update the current page and wait for the next request
    currentPage++;
    if (currentPage < totalPages) await delay(SUPERDRUG_API_HITS_DELAY_MS);
  } while (currentPage < totalPages);
  await browser.close();

  // Get unique brands
  const brandSet = new Set();
  allProducts.map((product) => brandSet.add(product.masterBrand));

  // Filtering the products for notification
  const filteredProducts = filterProductsForNotification(allProducts);
  Logger.info(`Data After Filtering`, filteredProducts);

  // Prepare the embeds for discord
  for (const config of discordMessagesConfig) {
    const filteredProductsForConfig = filteredProducts.filter((product) => {
      const discount = parseFloat(product.price.discount);
      return discount > config.minDiscount && discount <= config.maxDiscount;
    });

    filteredProductsForConfig.sort((a, b) => {
      return parseFloat(b.price.discount) - parseFloat(a.price.discount);
    });

    // Send the products to discord
    await sendProductsInfoToDiscord(filteredProductsForConfig, config.embedColor, config.content);
  }
}

