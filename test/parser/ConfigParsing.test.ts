import { QueryParser } from "../../src/QueryParser";

describe("Test 'config' statement", () => {
  it("should return the correct config", () => {
    const query = "dataset = x | config timezone = 'America/New_York'";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.config[0].key).toBe("timezone");
    expect(parsedQuery.config[0].value).toBe("America/New_York");
  });

  it("should fail with invalid config", () => {
    const query = "config timezone =";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid config statement: 'config timezone ='"
    );
  });

  it("should fail with invalid config", () => {
    const query = "config timezone = '";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid config statement: 'config timezone = ''"
    );
  });

  it("should fail with invalid config", () => {
    const query = "config timezone";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid config statement: 'config timezone'"
    );
  });
});
