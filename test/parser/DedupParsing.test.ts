import { QueryParser } from "../../src/QueryParser";

describe("Test 'dedup' statement", () => {
  it("should return the correct dedup direction", () => {
    const query = "dataset = sales_invoices | dedup customer";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].dedup).not.toBe(null);
    expect(parsedQuery.statements[0].dedup?.sortDirection).toBe(undefined);
  });

  it("should return the correct dedup field", () => {
    const query = "dataset = sales_invoices | dedup customer by createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].dedup).not.toBe(null);
    expect(parsedQuery.statements[0].dedup?.fields[0]).toBe("customer");
  });

  it("should return the correct dedup field", () => {
    const query = "dataset = sales_invoices | dedup customer, createdAt";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].dedup).not.toBe(null);
    expect(parsedQuery.statements[0].dedup?.fields[1]).toBe("createdAt");
  });

  it("should fail with invalid dedup sort direction", () => {
    const query = "dataset = sales_invoices | dedup customer by createdAt test";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid dedup direction: 'test'"
    );
  });

  it("should fail with missing dedup sort direction", () => {
    const query = "dataset = sales_invoices | dedup customer by createdAt";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "sortBy and sortDirection expected after 'by'"
    );
  });
  it("should fail with missing dedup fields", () => {
    const query = "dataset = sales_invoices | dedup by createdAt asc";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "No fields specified for dedup"
    );
  });
});
