import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { CustomerTestData } from "../data/CustomerTestData";

describe("Test execution", () => {
  test("execute full query successfully", () => {
    const query =
      'dataset = sales_invoices | limit 25 | filter amount > 200 | filter canceled = false and customer contains "Daniels" and notes not contains "Need to order some tools" | sort createdAt asc, amount desc | fields customer, createdAt, paid as isPaid, canceled, amount, dueDate, notes';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(1);
  });

  test("execute full query successfully", () => {
    const query =
      'dataset = sales_invoices | limit 25 | filter amount > 200 or paid = true | filter canceled = false and notes not contains "Need to order tools" | sort createdAt asc, amount desc | fields customer, createdAt, paid as isPaid, canceled, amount, dueDate, notes';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(3);
  });

  test("fields: field alias & filter", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | filter money < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(1);
  });

  test("fields: field alias & sort", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | sort money asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(5);
  });

  test("fields: field alias - invalid sort field with alias, do nothing", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | sort amount asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );

    expect(result.length).toBe(5);
  });
});
