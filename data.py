"""
Below are the configurations for the SuperDrug Bot. Change the values as per your requirements.
"""

super_drug_base_urls = [
    'https://api.superdrug.com/api/v2/sd/search?fields=PLP&categoryCode=fragranceforher&lang=en_GB&curr=GBP&pageSize=200',
    'https://api.superdrug.com/api/v2/sd/search?fields=PLP&query=%3Aranking%3AmarketplaceProduct%3Afalse&categoryCode=fragranceforhim&lang=en_GB&curr=GBP&pageSize=200'
]

filter_products_config = {
    'bannedBrandNames': ['brand1', 'brand2']
}

DISCORD_ROLE_ID = '663796251212644358'

"""




Don't change the values below unless you know what you're doing
"""

SUPERDRUG_RTE_DELAY_MS = 30 * 1000  # 30 Seconds

SUPERDRUG_MAX_REQUEST_ATTEMPTS = 3

SUPERDRUG_API_HITS_DELAY_MS = 0 * 1000  # 5 Seconds

DISCORD_BOT_NAME = 'SuperDrug Bot'

DISCORD_API_HIT_DELAY_MS = 2 * 1000  # 2 Seconds

DISCORD_BOT_IMAGE_URL = 'https://scontent.fdel27-6.fna.fbcdn.net/v/t39.30808-1/307721359_10159348879486775_4961596108656500775_n.jpg?stp=dst-jpg_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=f4b9fd&_nc_ohc=2hu1T0TL4PUQ7kNvgErHqQG&_nc_ht=scontent.fdel27-6.fna&oh=00_AYAT4QBNzX6VGlH4kV-MCqwnMet3K-VGhTs2avaxusycVQ&oe=66DD26AA'
