export const superDrugBaseUrls = [
  'https://api.superdrug.com/api/v2/sd/search?fields=PLP&categoryCode=fragranceforher&lang=en_GB&curr=GBP&pageSize=200'
];


//
export const RTE_DELAY_MS = 10 * 1000; // 10 Minutes
export const MAX_REQUEST_ATTEMPTS = 3;


export const API_HITS_DELAY_MS = 2 * 1000; // 2 Seconds


export const filterProductsConfig = {
  minDiscount: 33,
  minNumberOfReviews: 10,
  minRating: 3.6,
  bannedBrandNames: ['brand1', 'brand2']
}