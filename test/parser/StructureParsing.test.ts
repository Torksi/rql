import { QueryParser } from "../../src/QueryParser";

describe("Test query structure validation", () => {
  it("should validate the full query", () => {
    const query = `dataset = sales_invoices | limit 25 | filter amount > 1000 or dueDate < date() | filter canceled = false and customer contains "Jane Doe" and notes not contains "Need to order special tools" | sort createdAt asc, amount desc | fields name, createdAt, paid as isPaid, canceled, amount, dueDate, notes`;
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.dataset).toBe("sales_invoices");
    expect(parsedQuery.fields.length).toBe(7);
    expect(parsedQuery.filters.length).toBe(2);
    expect(parsedQuery.filters[0].blocks.length).toBe(2);
    expect(parsedQuery.filters[1].blocks.length).toBe(1);
  });

  it("should validate the full query", () => {
    const query = `dataset = sales_invoices \n#Limit results to 25\n| limit 25 | filter amount > 1000 or dueDate < date() | filter canceled = false and customer contains "Jane Doe" and notes not contains "Need to order special tools" | sort createdAt asc, amount desc | fields name, createdAt, paid as isPaid, canceled, amount, dueDate, notes`;
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.dataset).toBe("sales_invoices");
    expect(parsedQuery.fields.length).toBe(7);
    expect(parsedQuery.limit).toBe(25);
    expect(parsedQuery.filters.length).toBe(2);
    expect(parsedQuery.filters[0].blocks.length).toBe(2);
    expect(parsedQuery.filters[1].blocks.length).toBe(1);
  });

  it("should fail with invalid sort direction", () => {
    const query = "dataset = sales_invoices | sort createdAt asd";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid sort direction: 'asd'"
    );
  });

  it("should fail with invalid sort statement", () => {
    const query = "dataset = sales_invoices | sort createdAt . asc";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid sort statement: 'createdAt . asc'"
    );
  });

  it("should fail with invalid statement", () => {
    const query = "dataset = sales_invoices | sort createdAt asc | bug";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid statement: 'bug'"
    );
  });

  it("should fail with invalid statement", () => {
    const query = "dataset = sales_invoices | sort createdAt asc |";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid statement: ''"
    );
  });
});
