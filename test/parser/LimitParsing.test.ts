import { QueryParser } from "../../src/QueryParser";

describe("Test 'limit' statement", () => {
  it("should return the correct limit", () => {
    const query =
      "dataset = sales_invoices | fields name, createdAt, paid as isPaid, canceled, amount, dueDate, notes | limit 25";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.limit).toBe(25);
  });

  it("should return the default limit", () => {
    const query = "dataset = sales_invoices | fields name, createdAt";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.limit).toBe(0);
  });

  it("should fail with invalid limit", () => {
    const query = "filter amount > 1000 or dueDate < date() | limit";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid limit statement: 'limit'"
    );
  });

  it("should fail with invalid limit", () => {
    const query = "filter amount > 1000 or dueDate < date() | limit ddd";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid limit statement: 'limit ddd'"
    );
  });
});
