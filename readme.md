# 🛍️ Superdrug Deal Scraper

Automatically fetch and post the best deals from Superdrug to your Discord server!

## 🚀 Quick Start

1. Clone this repository
2. Create a virtual environment and activate it:
   ```
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
   ```
3. Install the required packages:
   ```
   pip3 install -r requirements.txt
   ```
4. Create a `.env` file in the root folder with:
   ```
   DISCORD_WEBHOOK_URL = 'your_discord_webhook_url_here'
   SEND_DISCORD_NOTIFICATION = 'true'
   ```
5. Customize settings in `data.py` (optional)
6. Run `python index.py`

## 🛠️ Customization

Adjust variables in `data.py` to tailor the scraper to your needs:

### Scraping Configuration
- `super_drug_base_urls`: List of URLs to scrape (default is fragrances for her and him)
- `SUPERDRUG_RTE_DELAY_MS`: Delay between retries (default: 30 seconds)
- `SUPERDRUG_MAX_REQUEST_ATTEMPTS`: Max number of request attempts (default: 3)
- `SUPERDRUG_API_HITS_DELAY_MS`: Delay between API hits (default: 5 seconds)

### Filtering Configuration
- `filter_products_config`:
   - `bannedBrandNames`: List of brand names to exclude

### Discord Bot Configuration
- `DISCORD_BOT_NAME`: Name of your Discord bot (default: 'SuperDrug Bot')
- `DISCORD_API_HIT_DELAY_MS`: Delay between Discord API hits (default: 2 seconds)
- `DISCORD_BOT_IMAGE_URL`: URL for bot's avatar image

## 🤖 Features

- 🔍 Scrapes latest deals from Superdrug
- 🚫 Excludes specified brands
- 📢 Posts deals directly to your Discord server
- ⏱️ Customizable scraping intervals and API delays

## 📞 Support

Need help? Contact the developer [here](https://chanpreet-portfolio.vercel.app/#connect).

Happy deal hunting! 🎉
