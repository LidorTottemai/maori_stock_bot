"""GCS V4 signed URL generation for product image uploads."""
import datetime
import json
import uuid
from typing import TYPE_CHECKING

from fastapi import HTTPException

if TYPE_CHECKING:
    from app.core.config import Settings

_ALLOWED_CONTENT_TYPES: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}

_EXPIRY = datetime.timedelta(minutes=15)


def generate_upload_signed_url(
    place_id: str,
    filename: str,
    content_type: str,
    settings: "Settings",
) -> tuple[str, str]:
    """
    Generate a GCS V4 signed PUT URL for direct browser upload.

    Returns (signed_put_url, public_url).
    Raises HTTP 503 if GCS is not configured.
    Raises HTTP 415 if content_type is not an allowed image type.
    """
    if not settings.gcs_bucket_name or not settings.gcs_credentials_json:
        raise HTTPException(
            status_code=503,
            detail="Image uploads are not configured on this server.",
        )

    ext = _ALLOWED_CONTENT_TYPES.get(content_type)
    if ext is None:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported image type: {content_type}. "
                f"Allowed: {', '.join(_ALLOWED_CONTENT_TYPES)}"
            ),
        )

    # Extension derived from content_type (not filename) to prevent spoofing
    blob_name = f"{place_id}/products/{uuid.uuid4()}.{ext}"

    from google.cloud import storage as gcs
    from google.oauth2 import service_account

    info = json.loads(settings.gcs_credentials_json)
    credentials = service_account.Credentials.from_service_account_info(
        info,
        scopes=["https://www.googleapis.com/auth/devstorage.read_write"],
    )

    client = gcs.Client(
        project=info.get("project_id"),
        credentials=credentials,
    )
    bucket = client.bucket(settings.gcs_bucket_name)
    blob = bucket.blob(blob_name)

    signed_url: str = blob.generate_signed_url(
        version="v4",
        expiration=_EXPIRY,
        method="PUT",
        content_type=content_type,
    )

    if settings.cdn_base_url:
        public_url = f"{settings.cdn_base_url.rstrip('/')}/{blob_name}"
    else:
        public_url = (
            f"https://storage.googleapis.com/{settings.gcs_bucket_name}/{blob_name}"
        )

    return signed_url, public_url
