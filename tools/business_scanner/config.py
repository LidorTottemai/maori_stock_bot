import os
from dotenv import load_dotenv

load_dotenv()

_HERE = os.path.dirname(os.path.abspath(__file__))

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
MIN_BOOKING_SCORE = int(os.getenv("MIN_BOOKING_SCORE", "40"))
DAILY_LIMIT = int(os.getenv("DAILY_LIMIT", "10"))
DB_PATH = os.getenv("DB_PATH", os.path.join(_HERE, "scanner.db"))

SERVICE_CATEGORIES = [
    "בריכת שחיה",
    "חוג כושר",
    "מתנס",
    "סטודיו פילאטיס",
    "סטודיו יוגה",
    "חדר כושר",
    "מספרה",
    "מכון יופי",
    "קליניקה פיזיותרפיה",
    "ספא",
    "חוגי ריקוד",
    "חוגי אמנות",
]

RETAIL_CATEGORIES = [
    "חנות פרחים",
    "חנות בגדים",
    "חנות בשמים",
    "חנות מתנות",
    "חנות תכשיטים",
    "חנות נעליים",
    "חנות ילדים",
    "מאפייה",
    "קונדיטוריה",
    "חנות יודאיקה",
]

ALL_CATEGORIES = SERVICE_CATEGORIES + RETAIL_CATEGORIES

CITIES = [
    "תל אביב",
    "ירושלים",
    "חיפה",
    "באר שבע",
    "ראשון לציון",
    "פתח תקווה",
    "נתניה",
    "אשדוד",
    "רמת גן",
    "הרצליה",
    "רעננה",
    "כפר סבא",
    "מודיעין",
]
