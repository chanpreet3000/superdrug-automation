import {fetchAllPages} from './fetcher.js'
import Logger from './logger.js'
import {superDrugBaseUrls} from "./data.js";
import {sendWelcomeMessageToDiscord} from "./discord.js";
import cron from 'node-cron';

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

// Schedule the main function to run at 1 AM, 10 AM, and 5 PM GMT
cron.schedule('0 1 * * *', () => {
  Logger.info('Running the script at 1 AM GMT');
  main();
});

cron.schedule('0 10 * * *', () => {
  Logger.info('Running the script at 10 AM GMT');
  main();
});

cron.schedule('0 17 * * *', () => {
  Logger.info('Running the script at 5 PM GMT');
  main();
});

// Start immediately if you want to run it now as well
main();
