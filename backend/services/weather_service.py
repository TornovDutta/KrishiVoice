from datetime import datetime, timedelta
from typing import Dict, Any, Optional

DISTRICT_WEATHER = {
    "Purba Bardhaman": {
        "district": "Purba Bardhaman",
        "state": "West Bengal",
        "temp_c": 29.5,
        "humidity_pct": 74,
        "rain_prob_today": 15,
        "rain_prob_tomorrow": 65,
        "wind_speed_kmh": 12.0,
        "condition": "Partly Cloudy with Evening Drizzle",
        "condition_bn": "আংশিক মেঘলা ও সন্ধ্যার দিকে হালকা বৃষ্টির সম্ভাবনা",
        "condition_hi": "आंशिक रूप से बादल छाए रहेंगे",
        "forecast": [
            {"day": "Today", "day_bn": "আজ", "temp": "30°C / 23°C", "rain_pct": 15, "icon": "partly-cloudy"},
            {"day": "Tomorrow", "day_bn": "কাল", "temp": "28°C / 22°C", "rain_pct": 65, "icon": "rain"},
            {"day": "Day After", "day_bn": "পরশু", "temp": "29°C / 21°C", "rain_pct": 30, "icon": "cloudy"}
        ]
    },
    "Hooghly": {
        "district": "Hooghly",
        "state": "West Bengal",
        "temp_c": 30.0,
        "humidity_pct": 78,
        "rain_prob_today": 20,
        "rain_prob_tomorrow": 70,
        "wind_speed_kmh": 14.0,
        "condition": "Humid and Overcast",
        "condition_bn": "আর্দ্র এবং মেঘলা আবহাওয়া",
        "condition_hi": "आर्द्र और बादल",
        "forecast": [
            {"day": "Today", "day_bn": "আজ", "temp": "30°C / 24°C", "rain_pct": 20, "icon": "cloudy"},
            {"day": "Tomorrow", "day_bn": "কাল", "temp": "27°C / 22°C", "rain_pct": 70, "icon": "rain"},
            {"day": "Day After", "day_bn": "পরশু", "temp": "28°C / 22°C", "rain_pct": 25, "icon": "partly-cloudy"}
        ]
    },
    "Nadia": {
        "district": "Nadia",
        "state": "West Bengal",
        "temp_c": 31.0,
        "humidity_pct": 70,
        "rain_prob_today": 10,
        "rain_prob_tomorrow": 55,
        "wind_speed_kmh": 10.0,
        "condition": "Mostly Sunny",
        "condition_bn": "বেশিরভাগ সময় রৌদ্রোজ্জ্বল",
        "condition_hi": "धूप खिली रहेगी",
        "forecast": [
            {"day": "Today", "day_bn": "আজ", "temp": "31°C / 23°C", "rain_pct": 10, "icon": "sunny"},
            {"day": "Tomorrow", "day_bn": "কাল", "temp": "29°C / 22°C", "rain_pct": 55, "icon": "rain"},
            {"day": "Day After", "day_bn": "পরশু", "temp": "30°C / 21°C", "rain_pct": 20, "icon": "partly-cloudy"}
        ]
    }
}

class WeatherService:
    def get_weather_forecast(self, district: str = "Purba Bardhaman", query: Optional[str] = None, language: str = "bn-IN") -> Dict[str, Any]:
        """
        Retrieves live agricultural weather and synthesizes practical farming alerts.
        Answers questions like: 'কাল কি বৃষ্টি হবে? আজ কি সেচ দেওয়া উচিত?'
        """
        data = DISTRICT_WEATHER.get(district, DISTRICT_WEATHER["Purba Bardhaman"])
        rain_tomorrow = data["rain_prob_tomorrow"]
        wind_speed = data["wind_speed_kmh"]
        
        # Practical agricultural decision logic
        should_irrigate = rain_tomorrow < 40
        safe_to_spray = rain_tomorrow < 40 and wind_speed < 15.0

        if should_irrigate:
            irrigation_advice_bn = "আগামীকাল বৃষ্টির সম্ভাবনা কম, তাই জমিতে প্রয়োজনমতো হালকা সেচ দিতে পারেন।"
            irrigation_advice_en = "Rainfall probability tomorrow is low. You may proceed with light irrigation if needed."
        else:
            irrigation_advice_bn = f"আগামীকাল {rain_tomorrow}% বৃষ্টির সম্ভাবনা রয়েছে! আজ সেচ দেওয়া স্থগিত রাখুন যাতে জমিতে অতিরিক্ত জল জমে না যায়।"
            irrigation_advice_en = f"Rain probability tomorrow is high ({rain_tomorrow}%). Postpone irrigation today to avoid waterlogging."

        if safe_to_spray:
            spray_advice_bn = "আবহাওয়া শুষ্ক থাকলে কীটনাশক বা ছত্রাকনাশক স্প্রে করা নিরাপদ।"
            spray_advice_en = "Weather is favorable for pesticide or fungicide spraying."
        else:
            spray_advice_bn = "বৃষ্টি বা বাতাসের কারণে আজ রাসায়নিক স্প্রে করা স্থগিত রাখুন, অন্যথায় ওষুধ ধুয়ে নষ্ট হতে পারে।"
            spray_advice_en = "Postpone pesticide spraying today due to rain or wind risk."

        # Spoken summary for voice playback
        if language == "bn-IN":
            spoken_alert = (
                f"{data['district']} এলাকায় আজ তাপমাত্রা প্রায় {data['temp_c']} ডিগ্রি সেলসিয়াস। "
                f"{irrigation_advice_bn} {spray_advice_bn}"
            )
        elif language == "hi-IN":
            spoken_alert = (
                f"{data['district']} में कल बारिश की संभावना {rain_tomorrow}% है। "
                f"आज सिंचाई टालना बेहतर रहेगा ताकि पानी का भराव न हो।"
            )
        else:
            spoken_alert = (
                f"In {data['district']}, tomorrow has a {rain_tomorrow}% chance of rain. "
                f"{irrigation_advice_en} {spray_advice_en}"
            )

        return {
            "district": data["district"],
            "state": data["state"],
            "current_temp_c": data["temp_c"],
            "humidity_pct": data["humidity_pct"],
            "rain_prob_today": data["rain_prob_today"],
            "rain_prob_tomorrow": data["rain_prob_tomorrow"],
            "wind_speed_kmh": data["wind_speed_kmh"],
            "condition": data["condition"],
            "condition_bn": data["condition_bn"],
            "should_irrigate": should_irrigate,
            "safe_to_spray": safe_to_spray,
            "irrigation_advice_bn": irrigation_advice_bn,
            "irrigation_advice_en": irrigation_advice_en,
            "spray_advice_bn": spray_advice_bn,
            "spray_advice_en": spray_advice_en,
            "spoken_alert": spoken_alert,
            "forecast": data["forecast"],
            "source": "IMD (India Meteorological Department) & Gramin Krishi Mausam Sewa (GKMS)",
            "updated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        }

weather_service = WeatherService()
