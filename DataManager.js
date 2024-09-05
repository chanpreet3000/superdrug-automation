import fs from 'fs';
import Logger from "./logger.js";

export class DataManager {
  constructor() {
    this.filename = 'latest_price_db.json';
    this.data = this.init();
  }

  init() {
    try {
      const fileContent = fs.readFileSync(this.filename, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      } else {
        Logger.error('Error initializing DataManager:', error);
        throw error;
      }
    }
  }

  async save() {
    try {
      await fs.promises.writeFile(this.filename, JSON.stringify(this.data, null, 2));
    } catch (error) {
      Logger.error('Error saving data:', error);
      throw error;
    }
  }

  getValue(key) {
    return this.data[key];
  }

  async setMultipleValues(keyValuePairs) {
    for (const [key, value] of keyValuePairs) {
      this.data[key] = value;
    }
    await this.save();
  }
}