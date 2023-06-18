import { QueryExecutor } from "../src/QueryExecutor";
import { QueryParser } from "../src/QueryParser";

const testData = [
  {
    id: 1,
    customer: "John Doe",
    createdAt: new Date("2020-01-01"),
    paid: false,
    canceled: false,
    amount: 900,
    dueDate: new Date("2025-12-12"),
    notes: "This is a note",
  },
  {
    id: 2,
    customer: "Jane Doe",
    createdAt: new Date("2020-01-01"),
    paid: true,
    canceled: false,
    amount: 200,
    dueDate: new Date("2023-12-12"),
    notes: "This is a note",
    uniqueNumber: 727411466252,
  },
  {
    id: 3,
    customer: "Jack Daniels",
    createdAt: new Date("2020-01-03"),
    paid: true,
    canceled: false,
    amount: 300,
    dueDate: new Date("2020-01-01"),
    notes: "",
    uniqueNumber: "727411466252",
  },
  {
    id: 4,
    customer: "John Doe",
    createdAt: new Date("2020-01-04"),
    paid: false,
    canceled: false,
    amount: 250,
    dueDate: new Date("2020-01-01"),
    notes: "This is a note",
    details: {
      wealth: 5560000,
    },
  },
  {
    id: 5,
    customer: "Jack Daniels",
    createdAt: new Date("2020-01-05"),
    paid: false,
    canceled: true,
    amount: 400,
    dueDate: new Date("2020-01-01"),
    notes: "This is not a note",
    details: {
      industry: "IT",
    },
  },
];

describe("Test execution", () => {
  test("It should execute: full expression", () => {
    const query = `dataset = sales_invoices | limit 25 | filter amount > 1000 or dueDate < date() | filter canceled = false and customer contains "Jane Doe" and notes not contains "Need to order contains tools" | sort createdAt asc, amount desc | fields customer, createdAt, paid as isPaid, canceled, amount, dueDate, notes`;
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });
  test("It should execute: not equal filter", () => {
    const query = "dataset = sales_invoices | filter id != 1";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(4);
  });
  test("It should execute: less than filter", () => {
    const query = "dataset = sales_invoices | filter amount < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });
  test("It should execute: nested filter", () => {
    const query =
      'dataset = sales_invoices | filter details.industry contains "IT"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });
  test("It should execute: number equals filter", () => {
    const query =
      "dataset = sales_invoices | filter uniqueNumber = 727411466252";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });
  /*test("It should fail with invalid field", () => {
    const query = "dataset = sales_invoices | filter amoun < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid field: 'amoun'"
    );
  });
  test("It should fail with invalid field", () => {
    const query =
      'dataset = sales_invoices | filter details.industry.x contains "IT"';
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid field: 'details.industry.x'"
    );
  });*/
  test("It should execute with alias", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | filter money < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });
  /*test("It should fail with invalid field with alias", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | filter amount < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid field: 'amount'"
    );
  });*/
  test("It should execute with alias", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | sort money asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(5);
  });
  test("It should fail with invalid sort field with alias", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | sort amount asc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid sort field: 'amount'"
    );
  });
});

describe("Test 'alter' statement execution", () => {
  test("It should return uppercase name", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = uppercase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].customer).toBe("JOHN DOE");
  });
  test("It should return lowercase name", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = lowercase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].customer).toBe("john doe");
  });
  test("It should fail with invalid expression format", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = uppercase(customer";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid expression format"
    );
  });
  test("It should fail with invalid alter statement", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = middlecase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid alter statement: 'middlecase' with parameters 'customer'"
    );
  });
});
