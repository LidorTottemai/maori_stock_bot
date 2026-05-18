"""
Google Places API client.
Uses Text Search + Place Details to fetch structured business info.
"""

import logging

import httpx
from pydantic import BaseModel

from app.core.config import Settings

logger = logging.getLogger(__name__)

_TEXT_SEARCH = "https://maps.googleapis.com/maps/api/place/textsearch/json"
_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"
_ACCEPT_LANG = {"Accept-Language": "he"}


class BusinessInfo(BaseModel):
    place_id: str
    name: str
    address: str
    phone: str
    website: str
    rating: float | None
    reviews: int | None


async def search_businesses(
    category: str,
    city: str,
    settings: Settings,
    client: httpx.AsyncClient,
    max_results: int = 20,
) -> list[BusinessInfo]:
    if not settings.google_maps_api_key:
        logger.warning("GOOGLE_MAPS_API_KEY not set — returning empty results")
        return []

    params = {
        "query": f"{category} {city}",
        "language": "iw",
        "key": settings.google_maps_api_key,
    }
    try:
        resp = await client.get(_TEXT_SEARCH, params=params, headers=_ACCEPT_LANG)
        resp.raise_for_status()
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.error("Places text search failed: %s", exc)
        return []

    place_ids = [
        p["place_id"]
        for p in resp.json().get("results", [])[:max_results]
        if "place_id" in p
    ]

    businesses: list[BusinessInfo] = []
    for place_id in place_ids:
        info = await _get_details(place_id, settings, client)
        if info:
            businesses.append(info)

    return businesses


async def _get_details(
    place_id: str,
    settings: Settings,
    client: httpx.AsyncClient,
) -> BusinessInfo | None:
    params = {
        "place_id": place_id,
        "fields": "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total",
        "language": "iw",
        "key": settings.google_maps_api_key,
    }
    try:
        resp = await client.get(_DETAILS, params=params, headers=_ACCEPT_LANG)
        resp.raise_for_status()
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.error("Places details failed for %s: %s", place_id, exc)
        return None

    r = resp.json().get("result", {})
    if not r:
        return None

    return BusinessInfo(
        place_id=r.get("place_id", ""),
        name=r.get("name", ""),
        address=r.get("formatted_address", ""),
        phone=r.get("formatted_phone_number", ""),
        website=r.get("website", ""),
        rating=r.get("rating"),
        reviews=r.get("user_ratings_total"),
    )
