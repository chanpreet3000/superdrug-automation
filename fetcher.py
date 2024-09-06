import traceback

import requests
from utils import delay
from data import (
    SUPERDRUG_API_HITS_DELAY_MS,
    filter_products_config,
    SUPERDRUG_MAX_REQUEST_ATTEMPTS,
    SUPERDRUG_RTE_DELAY_MS,
    DISCORD_ROLE_ID
)
from logger import Logger
from discord import send_message_to_discord, send_products_info_to_discord
from data_manager import DataManager


async def fetch_xml(url):
    for i in range(SUPERDRUG_MAX_REQUEST_ATTEMPTS):
        try:
            cookies = {
                'cookies': 'cookies'
            }

            headers = {
                'User-Agent': 'PostmanRuntime/7.41.2',
                'Accept': '*/*',
            }
            response = requests.get(url, cookies=cookies,
                                    headers=headers)

            # response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as error:
            Logger.error(f"Attempt {i + 1} to fetch {url} failed", error)
            if i == SUPERDRUG_MAX_REQUEST_ATTEMPTS - 1:
                raise
            await delay(SUPERDRUG_RTE_DELAY_MS)


def transform_products(products):
    transformed_products = []
    for product in products:
        transformed_promotions = []
        try:
            transformed_promotions = [promotion['tag']['label'] for promotion in product.get('promotions', []) if
                                      promotion.get('tag')]
        except:
            pass

        def get_min_price():
            prices = [product['price']['value']]
            if 'otherPrices' in product:
                prices.extend([p['value'] for p in product['otherPrices']])
            return min(prices)

        def get_min_formatted_price():
            prices = [(product['price']['value'], product['price']['formattedValue'])]
            if 'otherPrices' in product:
                prices.extend([(p['value'], p['formattedValue']) for p in product['otherPrices']])
            return min(prices, key=lambda x: x[0])[1]

        old_formatted_price = product['price'].get('formattedOldValue') or product['price']['formattedValue']
        new_formatted_price = get_min_formatted_price()
        old_price = product['price'].get('oldValue') or product['price']['value']
        new_price = get_min_price()
        discount = ((old_price - new_price) / old_price) * 100 if old_price > new_price else 0

        price_obj = {
            "oldFormattedPrice": old_formatted_price,
            "newFormattedPrice": new_formatted_price,
            "oldPrice": old_price,
            "newPrice": new_price,
            "discount": f"{discount:.2f}"
        }

        try:
            transformed_product = {
                "averageRating": product['averageRating'],
                "code": product['code'],
                "masterBrand": product.get('masterBrand', {}).get('name', ''),
                "name": product['name'],
                "ean": product['ean'],
                "price": price_obj,
                "isInStock": product['stock']['stockLevelStatus'] == 'inStock',
                'promotions': transformed_promotions,
                "website_url": f"https://www.superdrug.com{product['url']}",
            }
            transformed_products.append(transformed_product)
        except Exception as error:

            traceback.print_exc()
            Logger.error(f"Error transforming product {product}", error)

    return transformed_products


def filter_products_for_notification(products):
    return [
        product for product in products
        if product['masterBrand'] not in filter_products_config['bannedBrandNames'] and product['isInStock']
    ]


async def fetch_all_pages(base_url):
    current_page = 0
    all_products = []
    Logger.info(f"Fetching data from page {current_page}")

    while True:
        url = f"{base_url}&currentPage={current_page}"
        result = await fetch_xml(url)
        products = result['products']
        total_pages = result['pagination']['totalPages']

        Logger.info(f"Data Fetched from Page no {current_page + 1}/{total_pages}")

        transformed_products = transform_products(products)
        all_products.extend(transformed_products)

        current_page += 1
        if current_page >= total_pages:
            break

        await delay(SUPERDRUG_API_HITS_DELAY_MS)

    brand_set = set(product['masterBrand'] for product in all_products)

    filtered_products = filter_products_for_notification(all_products)

    data_manager = DataManager()
    transformed_products = []
    for product in filtered_products:
        latest_price = data_manager.get_value(product['code']) or product['price']['newPrice']
        latest_formatted_price = data_manager.get_value(product['code']) or product['price']['newFormattedPrice']
        is_new_product = not data_manager.get_value(product['code'])
        transformed_products.append({**product, 'latestPrice': latest_price, 'isNewProduct': is_new_product,
                                     'latestFormattedPrice': latest_formatted_price})

    Logger.info('Saving the latest prices to the data store')
    key_value_pairs = [(product['code'], product['price']['newPrice']) for product in transformed_products]
    data_manager.set_multiple_values(key_value_pairs)
    Logger.info('Data saved successfully')

    products_with_price_drop = [product for product in transformed_products if
                                product['price']['newPrice'] < product['latestPrice']]
    products_that_are_new = [product for product in transformed_products if product['isNewProduct']]

    if not products_that_are_new:
        no_new_products_payload = {
            "embeds": [{
                "color": 0xFF0000,
                "description": "No new products found!"
            }]
        }
        await send_message_to_discord(no_new_products_payload)
    else:
        content = f"🎉 <@{DISCORD_ROLE_ID}> Exciting news! New products have just arrived. Be the first to check them out!"
        await send_products_info_to_discord(products_that_are_new, 0x00FF00, content)

    if not products_with_price_drop:
        no_price_drops_payload = {
            "embeds": [{
                "color": 0xFF0000,
                "description": "No price drops found!"
            }]
        }
        await send_message_to_discord(no_price_drops_payload)
    else:
        content = f"💰 <@{DISCORD_ROLE_ID}> Alert! Price drops detected. Don't miss out on these amazing deals!"
        await send_products_info_to_discord(products_with_price_drop, 0xffff00, content)
