from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    google_maps_api_key: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    min_booking_score: int = 40
    daily_limit: int = 10
    db_url: str = "sqlite:///./scanner.db"
    daily_scan_hour: int = 9
    daily_scan_minute: int = 0

    # Rebuild pipeline
    github_token: str = ""
    github_username: str = ""
    rebuild_daily_limit: int = 3
    rebuild_scan_hour: int = 10
    rebuild_scan_minute: int = 0
    github_repos_private: bool = False
    vercel_token: str = ""
    telegram_webhook_secret: str = ""
    report_hour: int = 8
    report_minute: int = 0
    resend_api_key: str = ""
    outreach_from_email: str = "hello@example.com"
    outreach_price_ils: int = 1250
    daily_combos: int = 3

    # Quality loop
    anthropic_api_key: str = ""
    quality_min_score: int = 8
    quality_max_attempts: int = 3


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Static rotation data — not user-configurable
CITIES: list[str] = [
    # major cities
    "תל אביב", "ירושלים", "חיפה", "באר שבע",
    "ראשון לציון", "פתח תקווה", "נתניה", "אשדוד",
    "רמת גן", "הרצליה", "רעננה", "כפר סבא", "מודיעין",
    # medium towns
    "אשקלון", "חולון", "בני ברק", "בת ים",
    "רחובות", "לוד", "רמלה", "הוד השרון",
    "כפר יונה", "טבריה", "נצרת עילית", "עפולה",
    "קריית גת", "קריית ביאליק", "קריית ים", "קריית מוצקין",
    "אור יהודה", "יהוד", "גבעתיים", "אלעד",
    "ביתר עילית", "מעלה אדומים",
]

SERVICE_CATEGORIES: list[str] = [
    "בריכת שחיה", "חוג כושר", "מתנס", "סטודיו פילאטיס",
    "סטודיו יוגה", "חדר כושר", "מספרה", "מכון יופי",
    "קליניקה פיזיותרפיה", "ספא", "חוגי ריקוד", "חוגי אמנות",
]

RETAIL_CATEGORIES: list[str] = [
    "חנות פרחים", "חנות בגדים", "חנות בשמים",
    "חנות מתנות", "חנות תכשיטים", "חנות נעליים",
    "חנות ילדים", "מאפייה", "קונדיטוריה", "חנות יודאיקה",
]

ALL_CATEGORIES: list[str] = SERVICE_CATEGORIES + RETAIL_CATEGORIES
