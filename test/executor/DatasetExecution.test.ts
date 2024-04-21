import { QueryParser } from "../../src/QueryParser";
import { DatasetStatement } from "../../src/statement/DatasetStatement";

describe("Test 'dataset' statement execution", () => {
  test("it should fail: not implemented", () => {
    const query = "dataset = signInLogs | comp countt username as totalUsers";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() =>
      new DatasetStatement().execute(parsedQuery, parsedQuery.statements[0], [])
    ).toThrow("Method not implemented.");
  });
});
