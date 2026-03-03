class EventStore {
  constructor(maxItems) {
    this.maxItems = maxItems;
    this.items = [];
  }

  add(event) {
    this.items.unshift(event);
    if (this.items.length > this.maxItems) {
      this.items.pop();
    }
  }

  list() {
    return this.items;
  }

  count() {
    return this.items.length;
  }
}

module.exports = EventStore;
