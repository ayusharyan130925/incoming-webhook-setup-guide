from collections import deque
from typing import Deque, List

from app.models.ppe import StoredEvent


class EventStore:
    def __init__(self, max_items: int) -> None:
        self._items: Deque[StoredEvent] = deque(maxlen=max_items)

    def add(self, event: StoredEvent) -> None:
        self._items.appendleft(event)

    def list(self) -> List[StoredEvent]:
        return list(self._items)

    def count(self) -> int:
        return len(self._items)
