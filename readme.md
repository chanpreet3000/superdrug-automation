# 🛍️ Superdrug Deal Scraper

Automatically fetch and post the best deals from Superdrug to your Discord server!

## 🚀 Quick Start

1. Clone this repository
2. Run `yarn install`
3. Create a `.env` file in the root folder with:
   ```
   DISCORD_WEBHOOK_URL = 'your_discord_webhook_url_here'
   ```
4. Customize settings in `data.js` (optional)
5. Run `node index.js`

## 🛠️ Customization

Adjust variables in `data.js` to tailor the scraper to your needs:

### Scraping Configuration
- `superDrugBaseUrls`: Array of URLs to scrape (default is fragrances for her)
- `SUPERDRUG_RTE_DELAY_MS`: Delay between retries (default: 30 seconds)
- `SUPERDRUG_MAX_REQUEST_ATTEMPTS`: Max number of request attempts (default: 3)
- `SUPERDRUG_API_HITS_DELAY_MS`: Delay between API hits (default: 2 seconds)

### Filtering Configuration
- `filterProductsConfig`:
   - `minNumberOfReviews`: Minimum number of reviews (default: 10)
   - `minRating`: Minimum product rating (default: 3.6)
   - `bannedBrandNames`: Array of brand names to exclude

### Discord Bot Configuration
- `DISCORD_BOT_NAME`: Name of your Discord bot (default: 'SuperDrug Bot')
- `DISCORD_API_HIT_DELAY_MS`: Delay between Discord API hits (default: 2 seconds)
- `DISCORD_BOT_IMAGE_URL`: URL for bot's avatar image

### Discount Thresholds
- `discordMessagesConfig`: Array of objects defining discount ranges and corresponding message styles

## 🤖 Features

- 🔍 Scrapes latest deals from Superdrug
- 💰 Filters deals based on discount percentage, ratings, and number of reviews
- 🚫 Excludes specified brands
- 📊 Sorts deals by best discounts
- 📢 Posts deals directly to your Discord server with customized messages for different discount ranges
- ⏱️ Customizable scraping intervals and API delays

## 📞 Support

Need help? Contact the developer [here](https://chanpreet-portfolio.vercel.app/#connect).

Happy deal hunting! 🎉