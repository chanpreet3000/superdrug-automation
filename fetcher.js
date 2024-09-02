import {delay} from './utils.js';
import {API_HITS_DELAY_MS, MAX_REQUEST_ATTEMPTS, RTE_DELAY_MS} from "./data.js";
import axios from "axios";
import xml2js from "xml2js";
import Logger from "./logger.js";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/xml,application/xhtml+xml,text/html,text/xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function fetchXML(url, headers) {
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

export async function fetchAllPages(baseUrl) {
  let currentPage = 0;
  let totalPages;

  do {
    const url = `${baseUrl}&currentPage=${currentPage}`;
    const result = await fetchXML(url, headers);
    const pageData = result['productCategorySearchPage'];
    const products = pageData['products'];
    totalPages = pageData['pagination']['totalPages'];
    Logger.info(`Data Fetched from Superdrug API ${url}`, {currentPage, totalPages, url, products: products});
    currentPage++;
    if (currentPage < totalPages) await delay(API_HITS_DELAY_MS);
  } while (currentPage < totalPages);
}

