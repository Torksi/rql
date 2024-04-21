import { QueryParser } from "../../src/QueryParser";

describe("Test 'config' statement", () => {
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

  test("it should fail with invalid dataset", () => {
    const query = "dataset=a=b";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid dataset statement: 'dataset=a=b'"
    );
  });

  test("it should fail with invalid dataset", () => {
    const query = "dataset=a=b=/d";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid dataset statement: 'dataset=a=b=/d'"
    );
  });
});
