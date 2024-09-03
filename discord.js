import axios from "axios";
import {DISCORD_API_HIT_DELAY_MS, DISCORD_BOT_IMAGE_URL, DISCORD_BOT_NAME} from "./data.js";
import {delay} from "./utils.js";
import Logger from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

const getStars = (rating) => {
  const fullStars = Math.floor(parseFloat(rating));
  const emptyStars = 5 - fullStars;
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
};

// Get the current time in the UK timezone
const currentTimeUK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}).format(new Date());

const createEmbed = (product, embedColor) => ({
  title: product.name,
  url: product.website_url,
  thumbnail: {
    url: product.imageUrl,
  },
  color: embedColor,
  fields: [
    {
      name: 'Price',
      value: `~~${product.price.oldFormattedPrice}~~  **${product.price.newFormattedPrice}**`,
      inline: true,
    },
    {
      name: 'Discount',
      value: `**${product.price.discount}%** Off!`,
      inline: true,
    },
    {
      name: 'Rating',
      value: `${getStars(product.averageRating)} ${product.averageRating}\n(${product.numberOfReviews} reviews)`,
      inline: true,
    },
    {
      name: 'Brand',
      value: `${product.masterBrand}`,
      inline: true,
    },
    {
      name: 'Unit Price',
      value: product.contentUnitPrice,
      inline: true,
    },
    {
      name: 'Stock Status',
      value: product.isInStock ? 'In Stock' : '~~Out of Stock~~',
      inline: true,
    },
  ],
  footer: {
    text: `🕒 Time: ${currentTimeUK} (UK)`
  }
});

export const sendProductsInfoToDiscord = async (products, embedColor, content) => {
  Logger.info('Sending products info to Discord', {products: products, embedColor, content});

  const chunkSize = 10;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);

    const messagePayload = {
      username: DISCORD_BOT_NAME,
      avatar_url: DISCORD_BOT_IMAGE_URL,
      content: i === 0 ? content : '',
      embeds: chunk.map(product => createEmbed(product, embedColor))
    };
    try {
      await axios.post(webhookUrl, messagePayload);
      Logger.info(`Message sent successfully (Products ${i + 1} to ${i + chunk.length})`);
    } catch (error) {
      Logger.error(`Error sending message (Products ${i + 1} to ${i + chunk.length})`, error);
    }

    await delay(DISCORD_API_HIT_DELAY_MS);
  }
};