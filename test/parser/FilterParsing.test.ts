import { QueryParser } from "../../src/QueryParser";

describe("Test 'filter' statement", () => {
  it("should return the correct filter field", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[0].field
    ).toBe("amount");
  });

  it("should return the correct filter operator", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[0].operator
    ).toBe("greaterThan");
  });

  it("should return the correct filter operator", () => {
    const query = "dataset = sales_invoices | filter amount != 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[0].operator
    ).toBe("notEquals");
  });

  it("should return the correct filter value", () => {
    const query = "dataset = sales_invoices | filter amount > 1000";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[0].value
    ).toBe(1000);
  });

  it("should return the correct filter operator", () => {
    const query =
      'dataset = sales_invoices | filter amount > 1000 and notes not contains "Tool tips"';
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[1].operator
    ).toBe("notContains");
  });

  it("should return the correct filter value", () => {
    const query =
      "dataset = sales_invoices | filter amount > 1000 and notes not contains 'Tool tips'";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[1].value
    ).toBe("Tool tips");
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

  it("should return the correct values for in expression", () => {
    const query = "dataset = users | filter role in ('admin', 'root')";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[0].operator
    ).toBe("in");
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[0].value
    ).toStrictEqual(["admin", "root"]);
  });

  it("should fail with unsupported filter value", () => {
    const query = "dataset = users | filter role in 'man'";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Unsupported filter value: 'man'"
    );
  });

  it("shouldn't be treated as list even if the field name contains 'in'", () => {
    const query = "dataset = unifi_flows | filter _ctx.domain != null";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(
      parsedQuery.statements[0].filter!.blocks[0].expressions[0].field
    ).toBe("_ctx.domain");
  });
});
