import { QueryParser } from "../../src/QueryParser";

describe("Test 'fields' statement", () => {
  it("should return the correct field alias", () => {
    const query =
      "dataset = sales_invoices | fields name, createdAt, paid as isPaid, canceled, amount, dueDate, notes";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.fields[2].alias).toBe("isPaid");
  });

  it("should not return alias", () => {
    const query = "dataset = sales_invoices | fields name, createdAt";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.fields[0].alias).toBe(undefined);
  });
});
