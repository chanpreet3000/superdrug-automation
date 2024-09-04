export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
  'Accept': 'application/xml,application/xhtml+xml,text/html,text/xml',
  'Accept-Language': 'en-US,en;q=0.9',
};