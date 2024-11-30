import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { CustomerTestData } from "../data/CustomerTestData";

describe("Test 'fields' statement execution", () => {
  test("Test filter & fields", () => {
    const query =
      "dataset = sales_invoices | filter amount >= 300 | fields customer, amount";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(3);
    expect(Object.keys(result[0]).length).toBe(2);
  });
});
