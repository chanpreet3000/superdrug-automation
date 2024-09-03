export const superDrugBaseUrls = [
  'https://api.superdrug.com/api/v2/sd/search?fields=PLP&categoryCode=fragranceforher&lang=en_GB&curr=GBP&pageSize=200'
];

export const SUPERDRUG_RTE_DELAY_MS = 30 * 1000; // 30 Seconds

export const SUPERDRUG_MAX_REQUEST_ATTEMPTS = 3;

export const SUPERDRUG_API_HITS_DELAY_MS = 2 * 1000; // 2 Seconds

export const filterProductsConfig = {
  minNumberOfReviews: 10,
  minRating: 3.6,
  bannedBrandNames: ['brand1', 'brand2']
}

export const DISCORD_BOT_NAME = 'SuperDrug Bot';

export const DISCORD_API_HIT_DELAY_MS = 2 * 1000; // 2 Seconds

export const DISCORD_BOT_IMAGE_URL = 'https://scontent.fdel27-6.fna.fbcdn.net/v/t39.30808-1/307721359_10159348879486775_4961596108656500775_n.jpg?stp=dst-jpg_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=f4b9fd&_nc_ohc=2hu1T0TL4PUQ7kNvgErHqQG&_nc_ht=scontent.fdel27-6.fna&oh=00_AYAT4QBNzX6VGlH4kV-MCqwnMet3K-VGhTs2avaxusycVQ&oe=66DD26AA';

export const discordMessagesConfig = [
  {
    minDiscount: 60,
    maxDiscount: 100,
    content: '**🚨 Massive Sale Alert!**\nGet **60% - 100%** off on select items! This is your chance to grab premium products at unbeatable prices. Don’t miss out!',
    embedColor: 0xff0000, // Red for urgency
  },
  {
    minDiscount: 40,
    maxDiscount: 60,
    content: '**🔥 Hot Deals!**\nSave **40% - 60%** on top brands. Limited-time offers on some of your favorite products. Act fast before they’re gone!',
    embedColor: 0xff8000, // Orange for attention
  },
  {
    minDiscount: 33,
    maxDiscount: 40,
    content: '**💥 Great Savings!**\nEnjoy **33% - 40%** off. Quality products at discounted prices just for you. Hurry, these deals won’t last long!',
    embedColor: 0xffff00, // Yellow for optimism
  },
];
