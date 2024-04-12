import { QueryParser } from "../../src/QueryParser";

describe("Test 'sort' statement", () => {
  it("should return the correct sort direction", () => {
    const query = "dataset = sales_invoices | sort createdAt asc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.sort).not.toBe(null);
    if (parsedQuery.sort !== null) {
      expect(parsedQuery.sort[0].direction).toBe("asc");
    }
  });

  it("should return the correct sort direction - not specified", () => {
    const query = "dataset = sales_invoices | sort createdAt";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.sort).not.toBe(null);
    if (parsedQuery.sort !== null) {
      expect(parsedQuery.sort[0].direction).toBe("asc");
    }
  });

  it("should return the correct sort field", () => {
    const query = "dataset = sales_invoices | sort createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.sort).not.toBe(null);
    if (parsedQuery.sort !== null) {
      expect(parsedQuery.sort[0].field).toBe("createdAt");
    }
  });
});
