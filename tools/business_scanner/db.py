import sqlite3
from config import DB_PATH


def _conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def init_db():
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS scanned_businesses (
                place_id    TEXT PRIMARY KEY,
                name        TEXT,
                url         TEXT,
                score       INTEGER,
                scanned_at  TEXT DEFAULT (datetime('now'))
            )
        """)


def already_scanned(place_id: str) -> bool:
    with _conn() as c:
        row = c.execute(
            "SELECT 1 FROM scanned_businesses WHERE place_id = ?", (place_id,)
        ).fetchone()
        return row is not None


def mark_scanned(place_id: str, name: str, url: str, score: int):
    with _conn() as c:
        c.execute(
            "INSERT OR REPLACE INTO scanned_businesses (place_id, name, url, score) VALUES (?, ?, ?, ?)",
            (place_id, name, url, score),
        )
