import requests
from datetime import datetime
import pytz
from data import DISCORD_API_HIT_DELAY_MS, DISCORD_BOT_IMAGE_URL, DISCORD_BOT_NAME
from config import DISCORD_WEBHOOK_URL
from utils import delay
from logger import Logger


def get_current_time():
    uk_tz = pytz.timezone('Europe/London')
    return datetime.now(uk_tz).strftime('%d %B %Y, %I:%M:%S %p %Z')


def create_embed(product, embed_color):
    discount_from_previous_scan = ((product['latestPrice'] - product['price']['newPrice']) / product[
        'latestPrice']) * 100
    embed = {
        "title": product['name'],
        "url": product['website_url'],
        "color": embed_color,
        "fields": [
            {
                "name": "Current Price",
                "value": f"{product['price']['newFormattedPrice']}",
                "inline": True,
            },
            {
                "name": "Previous Scan Price",
                "value": f"{product['latestFormattedPrice']}",
                "inline": True,
            },
            {
                "name": "EAN",
                "value": f"{product['ean']}",
                "inline": True,
            },
            {
                "name": "Overall Discount",
                "value": f"{product['price']['discount']}% Off!",
                "inline": True,
            },
            {
                "name": "Discount From Previous Scan",
                "value": f"{discount_from_previous_scan:.2f}% Off!",
                "inline": True,
            },
            {
                "name": "Brand",
                "value": f"{product['masterBrand']}",
                "inline": True,
            },
        ],
        "footer": {
            "text": f"🕒 Time: {get_current_time()} (UK)"
        }
    }

    if product.get('promotions'):
        embed['fields'].append({
            "name": "Promotions",
            "value": "\n".join(f"• {promo}" for promo in product['promotions']),
            "inline": False
        })

    return embed


async def send_products_info_to_discord(products, embed_color, content):
    Logger.info('Sending products info to Discord',
                {'products': products, 'embedColor': embed_color, 'content': content})

    chunk_size = 10
    for i in range(0, len(products), chunk_size):
        chunk = products[i:i + chunk_size]

        message_payload = {
            "username": DISCORD_BOT_NAME,
            "avatar_url": DISCORD_BOT_IMAGE_URL,
            "content": content if i == 0 else '',
            "embeds": [create_embed(product, embed_color) for product in chunk]
        }

        try:
            await send_message_to_discord(message_payload)
            Logger.info(f"Message sent successfully (Products {i + 1} to {i + len(chunk)})")
        except Exception as error:
            Logger.error(f"Error sending message (Products {i + 1} to {i + len(chunk)})", error)

        await delay(DISCORD_API_HIT_DELAY_MS)


async def send_welcome_message_to_discord(scraping_url):
    message_payload = {
        "username": DISCORD_BOT_NAME,
        "avatar_url": DISCORD_BOT_IMAGE_URL,
        "embeds": [
            {
                "color": 0x0099FF,
                "title": '🚀 Scraping Process Initiated!',
                "description": "I'll be sending you updates with amazing deals shortly. [Contact the developer](https://chanpreet-portfolio.vercel.app/#connect)",
                "fields": [
                    {
                        "name": '📅 Timestamp',
                        "value": get_current_time(),
                        "inline": True
                    },
                    {
                        "name": '🔗 Scraping URL',
                        "value": scraping_url,
                        "inline": True
                    }
                ],
                "footer": {
                    "text": 'Scraping in progress... '
                }
            }
        ]
    }

    try:
        Logger.info('Sending welcome message to Discord')
        await send_message_to_discord(message_payload)
        Logger.info('Welcome message sent successfully')
    except Exception as error:
        Logger.error('Error sending welcome message', error)

    await delay(DISCORD_API_HIT_DELAY_MS)


async def send_message_to_discord(message_payload):
    response = requests.post(DISCORD_WEBHOOK_URL, json=message_payload)
    response.raise_for_status()
