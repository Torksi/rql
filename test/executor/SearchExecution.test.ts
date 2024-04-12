import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { CustomerTestData } from "../data/CustomerTestData";
import { LoginTestData } from "../data/LoginTestData";

describe("Test 'search' statement execution", () => {
  test("search", () => {
    const query = "dataset = signInLogs | search 'doe'";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      LoginTestData.getData()
    );
    expect(result.length).toBe(4);
  });

  test("search: case-insensitive", () => {
    const query =
      "dataset = customers | search 'doe' | config case_sensitive = false";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(3);
  });
});
