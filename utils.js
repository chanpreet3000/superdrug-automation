export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/xml,application/xhtml+xml,text/html,text/xml',
  'Accept-Language': 'en-US,en;q=0.9',
};