import { QueryParser } from "../../src/QueryParser";

describe("Test 'comp' statement", () => {
  it("should return the correct fields", () => {
    const query = "dataset = logins | comp count userName as userCount";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].field).toBe("userName");
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("userCount");
    expect(parsedQuery.statements[0].comp![0].function).toBe("count");
  });

  it("should fail with invalid comp", () => {
    const query = "dataset = logins | comp count userName as";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid comp statement: 'count userName as'",
    );
  });

  it("should fail with invalid comp", () => {
    const query = "dataset = logins | comp count userName as test by";
    expect(() => QueryParser.parseQuery(query)).toThrow();
  });

  it("should fail with invalid comp", () => {
    const query = "dataset = logins | comp count userName asd userCount";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid comp statement: 'count userName asd userCount'",
    );
  });

  // New syntax tests
  it("should parse count() with parentheses", () => {
    const query = "dataset = logins | comp count() as events";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].field).toBe("");
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("events");
    expect(parsedQuery.statements[0].comp![0].function).toBe("count");
  });

  it("should parse count_distinct() with field parameter", () => {
    const query =
      "dataset = logins | comp count_distinct(username) as unique_users";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].field).toBe("username");
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("unique_users");
    expect(parsedQuery.statements[0].comp![0].function).toBe("count_distinct");
  });

  it("should parse single grouping field with by clause", () => {
    const query = "dataset = logins | comp count() as events by hostname";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("events");
    expect(parsedQuery.statements[0].groupingFields).toEqual(["hostname"]);
  });

  it("should parse multiple grouping fields with by clause", () => {
    const query =
      "dataset = logins | comp count() as events by hostname, src_ip";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("events");
    expect(parsedQuery.statements[0].groupingFields).toEqual([
      "hostname",
      "src_ip",
    ]);
  });

  it("should parse multiple comp functions with grouping", () => {
    const query =
      "dataset = logins | comp count() as events, count_distinct(username) as unique_users by hostname, src_ip";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp!.length).toBe(2);
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("events");
    expect(parsedQuery.statements[0].comp![1].returnField).toBe("unique_users");
    expect(parsedQuery.statements[0].groupingFields).toEqual([
      "hostname",
      "src_ip",
    ]);
  });

  it("should parse max() with field parameter", () => {
    const query =
      "dataset = logins | comp max(amount) as max_amount by hostname";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].field).toBe("amount");
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("max_amount");
    expect(parsedQuery.statements[0].comp![0].function).toBe("max");
  });

  it("should parse function without alias", () => {
    const query = "dataset = logins | comp count()";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].returnField).toBe("count");
  });

  it("should parse function with field but no alias", () => {
    const query = "dataset = logins | comp count_distinct(username)";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.statements[0].comp![0].returnField).toBe(
      "username_count_distinct",
    );
  });
});
