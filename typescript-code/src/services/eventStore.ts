export default class EventStore<T> {
  private readonly items: T[] = [];

  public constructor(private readonly maxItems: number) {}

  public add(event: T): void {
    this.items.unshift(event);
    if (this.items.length > this.maxItems) {
      this.items.pop();
    }
  }

  public list(): T[] {
    return this.items;
  }

  public count(): number {
    return this.items.length;
  }
}
