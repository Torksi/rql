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
    notes: "Need to order tools",
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

const testData2 = [
  { id: 1, srcIp: "10.15.2.18" },
  { id: 2, srcIp: "192.168.1.13" },
  { id: 3, srcIp: "192.168.1.9" },
  { id: 4, srcIp: "0:0:0:0:0:FFFF:222.1.41.9" },
  { id: 5, srcIp: "85.25.14.92" },
];

describe("Test execution", () => {
  test("execute full query successfully", () => {
    const query =
      'dataset = sales_invoices | limit 25 | filter amount > 200 | filter canceled = false and customer contains "Daniels" and notes not contains "Need to order contains tools" | sort createdAt asc, amount desc | fields customer, createdAt, paid as isPaid, canceled, amount, dueDate, notes';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });

  test("execute full query successfully", () => {
    const query =
      'dataset = sales_invoices | limit 25 | filter amount > 200 or paid = true | filter canceled = false and notes not contains "Need to order contains tools" | sort createdAt asc, amount desc | fields customer, createdAt, paid as isPaid, canceled, amount, dueDate, notes';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(3);
  });

  test("fields: field alias & filter", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | filter money < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });

  test("fields: field alias & sort", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | sort money asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(5);
  });

  test("fields: field alias - invalid sort field with alias", () => {
    const query =
      "dataset = sales_invoices | fields amount as money | sort amount asc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid sort field: 'amount'"
    );
  });
});

describe("Test 'filter' statement execution", () => {
  test("filter: not equals", () => {
    const query = "dataset = sales_invoices | filter id != 1";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(4);
  });

  test("filter: less than", () => {
    const query = "dataset = sales_invoices | filter amount < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });

  test("filter: greater than", () => {
    const query = "dataset = sales_invoices | filter amount > 350";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: less than or equals", () => {
    const query = "dataset = sales_invoices | filter amount <= 250";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: greater than or equals", () => {
    const query = "dataset = sales_invoices | filter amount >= 300";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(3);
  });

  test("filter: incidr", () => {
    const query = "dataset = network_logs | filter srcIp incidr 192.168.1.0/24";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData2);
    expect(result.length).toBe(2);
  });

  test("filter: not incidr", () => {
    const query =
      "dataset = network_logs | filter srcIp not incidr 192.168.1.0/24";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData2);
    expect(result.length).toBe(3);
  });

  test("filter: incidr - invalid range, ipv4 to ipv6", () => {
    const query =
      "dataset = network_logs | filter srcIp incidr 2001:cdba::3257:9652";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData2);
    expect(result.length).toBe(0);
  });

  test("filter: incidr - ipv6", () => {
    const query = "dataset = network_logs | filter srcIp incidr 222.1.41.0/24";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData2);
    expect(result.length).toBe(1);
  });

  test("filter: nested field", () => {
    const query =
      'dataset = sales_invoices | filter details.industry contains "IT"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
  });

  test("filter: number equals", () => {
    const query =
      "dataset = sales_invoices | filter uniqueNumber = 727411466252";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: matches", () => {
    const query =
      "dataset = sales_invoices | filter customer matches ^\\w+\\s+D\\w*s";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: matches - ~= alias", () => {
    const query =
      "dataset = sales_invoices | filter customer ~= ^\\w+\\s+D\\w*s";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: matches - invalid regex pattern", () => {
    const query = "dataset = sales_invoices | filter customer matches ^[a-z";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid regex pattern: '^[a-z'"
    );
  });

  test("filter: multiple filters", () => {
    const query =
      "dataset = sales_invoices | filter amount > 200 | filter amount < 400";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);

    expect(result.length).toBe(2);
  });

  test("filter: equals with multiple statements", () => {
    const query =
      'dataset = sales_invoices | filter customer = "Jane Doe" | filter id = 2';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);

    expect(result.length).toBe(1);
  });

  test("filter: equals with AND", () => {
    const query =
      'dataset = sales_invoices | filter customer = "Jane Doe" and id = 2';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);

    expect(result.length).toBe(1);
  });

  test("filter: equals with OR", () => {
    const query =
      'dataset = sales_invoices | filter customer = "Jane Doe" or id = 1';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);

    expect(result.length).toBe(2);
  });
});

describe("Test 'alter' statement execution", () => {
  test("alter: uppercase", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = uppercase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].customer).toBe("JOHN DOE");
  });

  test("alter: lowercase", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = lowercase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].customer).toBe("john doe");
  });

  test("alter: substring", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = substring(customer, 1, 4)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].customer).toBe("ohn");
  });

  test("alter: multiply - static", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = multiply(amount, 3)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(600);
  });

  test("alter: multiply - dynamic", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = multiply(amount, id)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(400);
  });

  test("alter: add - static", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, 3)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(203);
  });

  test("alter: add - dynamic", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, id)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(202);
  });

  test("alter: subtract - static", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = subtract(amount, 3)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(197);
  });

  test("alter: subtract - dynamic", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = subtract(amount, id)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(198);
  });

  // Test for alter errors

  test("alter: invalid format", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = uppercase(customer";
    expect(() => QueryParser.parseQuery(query)).toThrow(
      "Invalid expression format"
    );
  });

  test("alter: invalid statement", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = middlecase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid alter statement: 'middlecase' with parameters 'customer'"
    );
  });

  test("alter: multiply - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = multiply(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(NaN);
  });

  test("alter: add - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(NaN);
  });

  test("alter: subtract - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = subtract(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(NaN);
  });
});
