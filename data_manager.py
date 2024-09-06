import json
from logger import Logger


class DataManager:
    def __init__(self):
        self.filename = 'latest_price_db.json'
        self.data = self.init()

    def init(self):
        try:
            with open(self.filename, 'r') as file:
                return json.load(file)
        except FileNotFoundError:
            return {}
        except json.JSONDecodeError as error:
            Logger.error('Error initializing DataManager:', error)
            raise

    def save(self):
        try:
            with open(self.filename, 'w') as file:
                json.dump(self.data, file, indent=2)
        except IOError as error:
            Logger.error('Error saving data:', error)
            raise

    def get_value(self, key):
        return self.data.get(key)

    def set_multiple_values(self, key_value_pairs):
        for key, value in key_value_pairs:
            self.data[key] = value
        self.save()
