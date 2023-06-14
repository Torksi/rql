import { QueryParser } from "../src/QueryParser";

describe("Test query validation", () => {
  test("It should execute", () => {
    const query = `dataset = sales_invoices | limit 25 | filter amount > 1000 or dueDate < date() | filter canceled = false and customer contains "Jane Doe" and notes not contains "Need to order special tools" | sort createdAt asc, amount desc | fields name, createdAt, paid as isPaid, canceled, amount, dueDate, notes`;
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.dataset).toBe("sales_invoices");
    expect(parsedQuery.fields.length).toBe(7);
    expect(parsedQuery.filters.length).toBe(2);
    expect(parsedQuery.filters[0].blocks.length).toBe(2);
    expect(parsedQuery.filters[1].blocks.length).toBe(1);
  });
  test("It should fail with invalid sort direction", () => {
    const query = "dataset = sales_invoices | sort createdAt asd";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid sort direction: 'asd'"
    );
  });
  test("It should fail with invalid sort statement", () => {
    const query = "dataset = sales_invoices | sort createdAt . asc";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid sort statement: 'createdAt . asc'"
    );
  });
  test("It should fail with invalid statement", () => {
    const query = "dataset = sales_invoices | sort createdAt asc | bug";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid statement: 'bug'"
    );
  });
  test("It should fail with invalid statement", () => {
    const query = "dataset = sales_invoices | sort createdAt asc |";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid statement: ''"
    );
  });
  test("It should fail with no dataset", () => {
    const query = "filter amount > 1000 or dueDate < date()";
    expect(() => QueryParser.parseQuery(query)).toThrow("No dataset specified");
  });
  test("It should fail with invalid dataset", () => {
    const query = "dataset";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid dataset statement: 'dataset'"
    );
  });
});

describe("Test 'limit' statement", () => {
  test("It should return the correct limit", () => {
    const query =
      "dataset = sales_invoices | fields name, createdAt, paid as isPaid, canceled, amount, dueDate, notes | limit 25";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.limit).toBe(25);
  });
  test("It should return the default limit", () => {
    const query = "dataset = sales_invoices | fields name, createdAt";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.limit).toBe(0);
  });
  test("It should fail with invalid limit", () => {
    const query = "filter amount > 1000 or dueDate < date() | limit";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid limit statement: 'limit'"
    );
  });
  test("It should fail with invalid limit", () => {
    const query = "filter amount > 1000 or dueDate < date() | limit ddd";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid limit statement: 'limit ddd'"
    );
  });
});

describe("Test 'fields' statement", () => {
  test("It should return the correct field alias", () => {
    const query =
      "dataset = sales_invoices | fields name, createdAt, paid as isPaid, canceled, amount, dueDate, notes";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.fields[2].alias).toBe("isPaid");
  });
  test("It should not return alias", () => {
    const query = "dataset = sales_invoices | fields name, createdAt";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.fields[0].alias).toBe(undefined);
  });
});

describe("Test 'sort' statement", () => {
  test("It should return the correct sort direction", () => {
    const query = "dataset = sales_invoices | sort createdAt asc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.sort).not.toBe(null);
    if (parsedQuery.sort !== null) {
      expect(parsedQuery.sort[0].direction).toBe("asc");
    }
  });
  test("It should return the correct sort field", () => {
    const query = "dataset = sales_invoices | sort createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.sort).not.toBe(null);
    if (parsedQuery.sort !== null) {
      expect(parsedQuery.sort[0].field).toBe("createdAt");
    }
  });
});

describe("Test 'filter' statement", () => {
  test("It should return the correct filter field", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].field).toBe(
      "amount"
    );
  });
  test("It should return the correct filter operator", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].operator).toBe(
      "greaterThan"
    );
  });
  test("It should return the correct filter operator", () => {
    const query = "dataset = sales_invoices | filter amount != 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].operator).toBe(
      "notEquals"
    );
  });
  test("It should return the correct filter value", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].value).toBe(1000);
  });
  test("It should return the correct filter operator", () => {
    const query =
      'dataset = sales_invoices | filter amount > 1000 and notes not contains "Tool tips"';
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[1].operator).toBe(
      "notContains"
    );
  });
  test("It should fail with invalid filter expression", () => {
    const query = "dataset = sales_invoices | filter amount > 1000 and notes";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid filter expression: 'notes'"
    );
  });
  test("It should fail with invalid filter expression", () => {
    const query =
      "dataset = sales_invoices | filter amount > 1000 and notes equals 'man'";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid filter expression: 'notes equals 'man''"
    );
  });
});
