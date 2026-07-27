export class QueryBuilder {
  private url: string;
  private params: URLSearchParams;

  constructor(baseUrl: string) {
    this.url = baseUrl;
    this.params = new URLSearchParams();
  }

  static generateURL(path: string): QueryBuilder {
    return new QueryBuilder(path);
  }

  setQueryParam(key: string, value: string | number | boolean | null | undefined): this {
    if (value === null || value === undefined || value === '') {
      this.params.delete(key);
    } else {
      this.params.set(key, String(value));
    }
    return this;
  }

  build(): string {
    const queryString = this.params.toString();
    return queryString ? `${this.url}?${queryString}` : this.url;
  }
}
