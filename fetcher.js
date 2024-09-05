import {delay, headers} from './utils.js';
import {
  SUPERDRUG_API_HITS_DELAY_MS,
  filterProductsConfig,
  SUPERDRUG_MAX_REQUEST_ATTEMPTS,
  SUPERDRUG_RTE_DELAY_MS, DISCORD_ROLE_ID
} from "./data.js";
import axios from "axios";
import Logger from "./logger.js";
import {sendMessageToDiscord, sendProductsInfoToDiscord} from "./discord.js";
import {DataManager} from "./DataManager.js";


async function fetchXML(url, headers) {
  for (let i = 0; i < SUPERDRUG_MAX_REQUEST_ATTEMPTS; i++) {
    try {
      const {data} = await axios.get(url, {headers});
      return data;
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
      masterBrand,
      name,
      numberOfReviews,
      price,
      promotions,
      stock,
      ean,
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
      "masterBrand": masterBrand.name,
      "name": name,
      "ean": ean,
      "numberOfReviews": numberOfReviews,
      "price": priceObj,
      "isInStock": stock.stockLevelStatus === 'inStock',
      'promotions': transformedPromotions,
      "website_url": `https://www.superdrug.com${url}`,
    }
  });
}

const filterProductsForNotification = (products) => {
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
  Logger.info(`Fetching data from page ${currentPage}`);

  do {
    const url = `${baseUrl}&currentPage=${currentPage}`;
    const result = await fetchXML(url, headers);
    const products = result.products;
    totalPages = result.pagination.totalPages;

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

  // Get unique brands
  const brandSet = new Set();
  allProducts.map((product) => brandSet.add(product.masterBrand));

  // Filtering the products for notification
  const filteredProducts = filterProductsForNotification(allProducts);

  const dataManager = new DataManager();
  const transformedProducts = filteredProducts.map(product => {
    const latestPrice = dataManager.getValue(product.code) ?? product.price.newPrice;
    const latestFormattedPrice = dataManager.getValue(product.code) ?? product.price.newFormattedPrice;
    const isNewProduct = !dataManager.getValue(product.code);
    return {...product, latestPrice, isNewProduct, latestFormattedPrice};
  })
  Logger.info(`Data After Filtering & Transformation`, transformedProducts);


  Logger.info('Saving the latest prices to the data store');
  const keyValuePairs = transformedProducts.map(product => [product.code, product.price.newPrice]);
  await dataManager.setMultipleValues(keyValuePairs);
  Logger.info('Data saved successfully');

  // Send the products to discord
  const productsWithPriceDrop = transformedProducts.filter(product => product.price.newPrice < product.latestPrice);
  const productsThatAreNew = transformedProducts.filter(product => product.isNewProduct);

  if (productsThatAreNew.length === 0) {
    const noNewProductsPayload = {
      embeds: [{
        color: 0xFF0000,
        description: "No new products found!"
      }]
    };
    await sendMessageToDiscord(noNewProductsPayload);
  } else {
    const content = `🎉 <@${DISCORD_ROLE_ID}> Exciting news! New products have just arrived. Be the first to check them out!`;
    await sendProductsInfoToDiscord(productsThatAreNew, 0x00FF00, content);
  }

  if (productsWithPriceDrop.length === 0) {
    const noPriceDropsPayload = {
      embeds: [{
        color: 0xFF0000,
        description: "No price drops found!"
      }]
    };
    await sendMessageToDiscord(noPriceDropsPayload);
  } else {
    const content = `💰 <@${DISCORD_ROLE_ID}> Alert! Price drops detected. Don't miss out on these amazing deals!`;
    await sendProductsInfoToDiscord(productsWithPriceDrop, 0xffff00, content);
  }
}

