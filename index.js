import {fetchAllPages} from './fetcher.js'
import Logger from './logger.js'
import {superDrugBaseUrls} from "./data.js";
import {sendWelcomeMessageToDiscord} from "./discord.js";

async function main() {
  for (const [index, url] of superDrugBaseUrls.entries()) {
    try {
      // Send a welcome message to Discord channel
      await sendWelcomeMessageToDiscord(url);

      // Fetch data from Superdrug API
      Logger.info(`Fetching data from Superdrug API ${index + 1} of ${superDrugBaseUrls.length}`, url);
      await fetchAllPages(url);
    } catch (error) {
      Logger.error(`Error fetching data from Superdrug API ${index + 1} of ${superDrugBaseUrls.length} - ${url}`, error);
    } finally {
      Logger.info(`Finished fetching data from Superdrug API ${index + 1} of ${superDrugBaseUrls.length}`, url);
    }
  }
}

try {
  main()
} catch (error) {
  Logger.critical('Something went wrong!', error);
}
