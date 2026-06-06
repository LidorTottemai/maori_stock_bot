"""
Google Places API client.
Finds businesses by category + city and returns structured results.
"""

import requests
from config import GOOGLE_MAPS_API_KEY

PLACES_TEXT_SEARCH = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"

HEADERS = {"Accept-Language": "he"}


def search_businesses(category: str, city: str, max_results: int = 20) -> list[dict]:
    """Return a list of businesses matching category + city."""
    query = f"{category} {city}"
    params = {
        "query": query,
        "language": "iw",
        "key": GOOGLE_MAPS_API_KEY,
    }
    resp = requests.get(PLACES_TEXT_SEARCH, params=params, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    results = []
    for place in data.get("results", [])[:max_results]:
        place_id = place.get("place_id")
        if not place_id:
            continue
        details = _get_details(place_id)
        if details:
            results.append(details)

    return results


def _get_details(place_id: str) -> dict | None:
    params = {
        "place_id": place_id,
        "fields": "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total",
        "language": "iw",
        "key": GOOGLE_MAPS_API_KEY,
    }
    resp = requests.get(PLACES_DETAILS, params=params, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    result = resp.json().get("result", {})

    if not result:
        return None

    return {
        "place_id": result.get("place_id", ""),
        "name": result.get("name", ""),
        "address": result.get("formatted_address", ""),
        "phone": result.get("formatted_phone_number", ""),
        "website": result.get("website", ""),
        "rating": result.get("rating"),
        "reviews": result.get("user_ratings_total"),
    }
