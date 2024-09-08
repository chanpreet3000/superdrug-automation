import logging
import requests

logging.basicConfig(level=logging.DEBUG)

headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.7',
    'origin': 'https://www.superdrug.com',
    'priority': 'u=1, i',
    'referer': 'https://www.superdrug.com/',
    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Brave";v="128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'x-anonymous-consents': '%5B%5D'
}

params = {
    'fields': 'PLP',
    'categoryCode': 'fragranceforher',
    'lang': 'en_GB',
    'curr': 'GBP',
    'pageSize': '5',
}
try:
    response = requests.get('https://api.superdrug.com/api/v2/sd/search', params=params,
                            headers=headers)
    print(response.json())
except Exception as e:
    print(e)
