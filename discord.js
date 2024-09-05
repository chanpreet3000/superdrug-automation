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
const getCurrentTime = () => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(new Date());
}

const createEmbed = (product, embedColor) => {
  const discountFromPreviousScan = ((product.latestPrice - product.price.newPrice) / product.latestPrice) * 100;
  const embed = {
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
        name: 'Previous Scan Price',
        value: `${product.latestFormattedPrice}`,
        inline: true,
      },
      {
        name: 'EAN',
        value: `${product.ean}`,
        inline: true,
      },
      {
        name: 'Overall Discount',
        value: `**${product.price.discount}%** Off!`,
        inline: true,
      },
      {
        name: 'Discount From Previous Scan',
        value: `**${discountFromPreviousScan}%** Off!`,
        inline: true,
      },
      {
        name: 'Brand',
        value: `${product.masterBrand}`,
        inline: true,
      },
      {
        name: 'Rating',
        value: `${getStars(product.averageRating)} ${product.averageRating}\n(${product.numberOfReviews} reviews)`,
        inline: true,
      },
      {
        name: 'Unit Price',
        value: product.contentUnitPrice,
        inline: true,
      },
    ],
    footer: {
      text: `🕒 Time: ${getCurrentTime()} (UK)`
    }
  };

  // Add promotions field if promotions exist
  if (product.promotions && product.promotions.length > 0) {
    embed.fields.push({
      name: 'Promotions',
      value: product.promotions.map(promo => `• ${promo}`).join('\n'),
      inline: false
    });
  }

  return embed;
};

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

    // Send the message to Discord
    try {
      await sendMessageToDiscord(messagePayload);
      Logger.info(`Message sent successfully (Products ${i + 1} to ${i + chunk.length})`);
    } catch (error) {
      Logger.error(`Error sending message (Products ${i + 1} to ${i + chunk.length})`, error);
    }

    await delay(DISCORD_API_HIT_DELAY_MS);
  }
};

export const sendWelcomeMessageToDiscord = async (scrapingUrl) => {

  const messagePayload = {
    username: DISCORD_BOT_NAME,
    avatar_url: DISCORD_BOT_IMAGE_URL,
    embeds: [
      {
        color: 0x0099FF, // Blue color
        title: '🚀 Scraping Process Initiated!',
        description: "I'll be sending you updates with amazing deals shortly. [Contact the developer](https://chanpreet-portfolio.vercel.app/#connect)",
        fields: [
          {
            name: '📅 Timestamp',
            value: getCurrentTime(),
            inline: true
          },
          {
            name: '🔗 Scraping URL',
            value: scrapingUrl,
            inline: true
          }
        ],
        footer: {
          text: 'Scraping in progress... '
        }
      }
    ]
  };

  try {
    Logger.info('Sending welcome message to Discord');
    await sendMessageToDiscord(messagePayload);
    Logger.info('Welcome message sent successfully');
  } catch (error) {
    Logger.error('Error sending welcome message', error);
  }

  await delay(DISCORD_API_HIT_DELAY_MS);
}

export const sendMessageToDiscord = async (messagePayload) => {
  await axios.post(webhookUrl, messagePayload);
}