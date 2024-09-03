import {delay} from './utils.js';
import {API_HITS_DELAY_MS, filterProductsConfig, MAX_REQUEST_ATTEMPTS, RTE_DELAY_MS} from "./data.js";
import axios from "axios";
import xml2js from "xml2js";
import Logger from "./logger.js";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/xml,application/xhtml+xml,text/html,text/xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchXML(url, headers) {
  for (let i = 0; i < MAX_REQUEST_ATTEMPTS; i++) {
    try {
      const {data} = await axios.get(url, {headers});
      const parser = new xml2js.Parser({explicitArray: false, mergeAttrs: true});
      return await parser.parseStringPromise(data);
    } catch (error) {
      Logger.error(`Attempt ${i + 1} to fetch ${url} failed`, error);
      if (i === MAX_REQUEST_ATTEMPTS - 1) throw error;
      await delay(RTE_DELAY_MS);
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
      "imageUrl": images ? `https://media.superdrug.com/${images.url}` : '',
      "inStockFlag": inStockFlag,
      "masterBrand": masterBrand.name,
      "name": name,
      "numberOfReviews": numberOfReviews,
      "price": priceObj,
      // "promotions": promotions,
      "isInStock": stock.stockLevelStatus === 'inStock',
      "website_url": `https://www.superdrug.com/${url}`,
    }
  });
}

const filterProductsForNotification = (products) => {
  // Implement the filter logic here
  return products.filter((product) => {
    if (filterProductsConfig.bannedBrandNames.includes(product.masterBrand)) return false;
    if (product.price.discount < filterProductsConfig.minDiscount) return false;
    if (product.numberOfReviews < filterProductsConfig.minNumberOfReviews) return false;
    if (product.averageRating < filterProductsConfig.minRating) return false;
    return product.isInStock;
  })
}

export async function fetchAllPages(baseUrl) {
  let currentPage = 0;
  let totalPages;
  let brandSet = new Set()
  Logger.info(`Fetching data from page=${currentPage}`);

  do {
    const url = `${baseUrl}&currentPage=${currentPage}`;
    const result = await fetchXML(url, headers);
    const pageData = result['productCategorySearchPage'];
    const products = pageData['products'];
    totalPages = pageData['pagination']['totalPages'];

    Logger.info(`Data Fetched from Superdrug API`, {
      currentPage,
      totalPages,
      url,
    });

    // Transform the products and log the data
    const transformedProducts = transformProducts(products);
    transformedProducts.map((product) => brandSet.add(product.masterBrand));

    const filteredProducts = filterProductsForNotification(transformedProducts);
    Logger.info(`Data After Filtering`, filteredProducts);

    // Update the current page and wait for the next request
    currentPage++;
    if (currentPage < totalPages) await delay(API_HITS_DELAY_MS);
  } while (currentPage < 1);
}

