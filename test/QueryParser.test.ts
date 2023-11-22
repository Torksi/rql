import { QueryParser } from "../src/QueryParser";

describe("Test query validation", () => {
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

  it("should fail with no dataset", () => {
    const query = "filter amount > 1000 or dueDate < date()";
    expect(() => QueryParser.parseQuery(query)).toThrow("No dataset specified");
  });

  test("it should fail with invalid dataset", () => {
    const query = "dataset";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid dataset statement: 'dataset'"
    );
  });
});

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

describe("Test 'sort' statement", () => {
  it("should return the correct sort direction", () => {
    const query = "dataset = sales_invoices | sort createdAt asc";
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

describe("Test 'dedup' statement", () => {
  it("should return the correct dedup direction", () => {
    const query = "dataset = sales_invoices | dedup customer";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.dedup).not.toBe(null);
    if (parsedQuery.dedup !== null) {
      expect(parsedQuery.dedup.sortDirection).toBe(undefined);
    }
  });

  it("should return the correct dedup field", () => {
    const query = "dataset = sales_invoices | dedup customer by createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.dedup).not.toBe(null);
    if (parsedQuery.dedup !== null) {
      expect(parsedQuery.dedup.fields[0]).toBe("customer");
    }
  });

  it("should return the correct dedup field", () => {
    const query = "dataset = sales_invoices | dedup customer, createdAt";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.dedup).not.toBe(null);
    if (parsedQuery.dedup !== null) {
      expect(parsedQuery.dedup.fields[0]).toBe("customer");
    }
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

describe("Test 'filter' statement", () => {
  it("should return the correct filter field", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].field).toBe(
      "amount"
    );
  });

  it("should return the correct filter operator", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].operator).toBe(
      "greaterThan"
    );
  });

  it("should return the correct filter operator", () => {
    const query = "dataset = sales_invoices | filter amount != 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].operator).toBe(
      "notEquals"
    );
  });

  it("should return the correct filter value", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[0].value).toBe(1000);
  });

  it("should return the correct filter operator", () => {
    const query =
      'dataset = sales_invoices | filter amount > 1000 and notes not contains "Tool tips"';
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.filters[0].blocks[0].expressions[1].operator).toBe(
      "notContains"
    );
  });

  it("should fail with invalid filter expression", () => {
    const query = "dataset = sales_invoices | filter amount > 1000 and notes";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid filter expression: 'notes'"
    );
  });

  it("should fail with invalid filter expression", () => {
    const query =
      "dataset = sales_invoices | filter amount > 1000 and notes equals 'man'";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid filter expression: 'notes equals 'man''"
    );
  });

  it("should fail with invalid filter operator", () => {
    const query =
      "dataset = sales_invoices | filter amount > 1000 and notes equalss 'man'";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid filter expression: 'notes equalss 'man''"
    );
  });
});
