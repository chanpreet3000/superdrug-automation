import {fetchAllPages} from './fetcher.js'
import Logger from './logger.js'
import {superDrugBaseUrls} from "./data.js";

async function main() {
  superDrugBaseUrls.map(async (url, index) => {
    try {
      Logger.info(`Fetching data from Superdrug API ${index + 1} of ${superDrugBaseUrls.length}`, url);
      await fetchAllPages(url);
    } catch (error) {
      Logger.error(`Error fetching data from Superdrug API ${index + 1} of ${superDrugBaseUrls.length} - ${url}`, error);
    } finally {
      Logger.info(`Finished fetching data from Superdrug API ${index + 1} of ${superDrugBaseUrls.length}`, url);
    }
  })
}

try {
  main()
} catch (error) {
  Logger.critical('Something went wrong!', error);
}
