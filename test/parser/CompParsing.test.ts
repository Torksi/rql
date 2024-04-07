import { QueryParser } from "../../src/QueryParser";

describe("Test 'comp' statement", () => {
  it("should return the correct fields", () => {
    const query = "dataset = logins | comp count userName as userCount";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(parsedQuery.comp[0].field).toBe("userName");
    expect(parsedQuery.comp[0].returnField).toBe("userCount");
    expect(parsedQuery.comp[0].function).toBe("count");
  });

  it("should fail with invalid comp", () => {
    const query = "dataset = logins | comp count userName as";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid comp statement: 'comp count userName as'"
    );
  });

  it("should fail with invalid comp", () => {
    const query = "dataset = logins | comp count userName asd userCount";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid comp statement: 'comp count userName asd userCount'"
    );
  });
});
