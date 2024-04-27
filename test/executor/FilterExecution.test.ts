import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { CustomerTestData } from "../data/CustomerTestData";
import { DeviceTestData } from "../data/DeviceTestData";
import { UnstrLogTestData } from "../data/UnstrLogTestData";
import { UrlTestData } from "../data/UrlTestData";
import { UuidTestData } from "../data/UuidTestData";

describe("Test 'filter' statement execution", () => {
  test("filter: equals null", () => {
    const query = "dataset = users | filter role = null";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result.length).toBe(3);
  });

  test("filter: not equals null", () => {
    const query = "dataset = users | filter role != null";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: not equals", () => {
    const query = "dataset = sales_invoices | filter id != 1";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(4);
  });

  test("filter: not equals / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer != 'john doe' | filter id != 2";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: equals / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer = 'john doe'";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: contains / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer contains 'doe'";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(3);
  });

  test("filter: not contains / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer not contains 'doe'";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: less than", () => {
    const query = "dataset = sales_invoices | filter amount < 201";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(1);
  });

  test("filter: greater than", () => {
    const query = "dataset = sales_invoices | filter amount > 350";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: less than or equals", () => {
    const query = "dataset = sales_invoices | filter amount <= 250";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: greater than or equals", () => {
    const query = "dataset = sales_invoices | filter amount >= 300";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(3);
  });

  test("filter: incidr", () => {
    const query = "dataset = network_logs | filter srcIp incidr 192.168.1.0/24";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UrlTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: not incidr", () => {
    const query =
      "dataset = network_logs | filter srcIp not incidr 192.168.1.0/24";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UrlTestData.getData()
    );
    expect(result.length).toBe(3);
  });

  test("filter: incidr - invalid range, ipv4 to ipv6", () => {
    const query =
      "dataset = network_logs | filter srcIp incidr 2001:cdba::3257:9652";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UrlTestData.getData()
    );
    expect(result.length).toBe(0);
  });

  test("filter: incidr - ipv6", () => {
    const query = "dataset = network_logs | filter srcIp incidr 222.1.41.0/24";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UrlTestData.getData()
    );
    expect(result.length).toBe(1);
  });

  test("filter: nested field", () => {
    const query =
      'dataset = sales_invoices | filter details.industry contains "IT"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(1);
  });

  test("filter: number equals", () => {
    const query =
      "dataset = sales_invoices | filter uniqueNumber = 727411466252";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: matches", () => {
    const query =
      "dataset = sales_invoices | filter customer matches ^\\w+\\s+D\\w*s";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: matches", () => {
    const query =
      'dataset = sales_invoices | filter customer matches "^\\w+\\s+D\\w*s"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: matches", () => {
    const query = 'dataset = sales_invoices | filter notes matches "is not"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(1);
  });

  test("filter: matches - ~= alias", () => {
    const query =
      "dataset = sales_invoices | filter customer ~= ^\\w+\\s+D\\w*s";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);
  });

  test("filter: matches - invalid regex pattern", () => {
    const query = "dataset = sales_invoices | filter customer matches ^[a-z";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() =>
      QueryExecutor.executeQuery(parsedQuery, CustomerTestData.getData())
    ).toThrow("Invalid regex pattern: '^[a-z'");
  });

  test("filter: contains - array", () => {
    const query = 'dataset = sales_invoices | filter flags contains "STAFF"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(2);

    const query2 = 'dataset = sales_invoices | filter flags contains "LOAYLTY"';
    const parsedQuery2 = QueryParser.parseQuery(query2);
    const result2 = QueryExecutor.executeQuery(
      parsedQuery2,
      CustomerTestData.getData()
    );
    expect(result2.length).toBe(1);
  });

  test("filter: multiple filters", () => {
    const query =
      "dataset = sales_invoices | filter amount > 200 | filter amount < 400";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );

    expect(result.length).toBe(2);
  });

  test("filter: equals with multiple statements", () => {
    const query =
      'dataset = sales_invoices | filter customer = "Jane Doe" | filter id = 2';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );

    expect(result.length).toBe(1);
  });

  test("filter: equals with AND", () => {
    const query =
      'dataset = sales_invoices | filter customer = "Jane Doe" and id = 2';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );

    expect(result.length).toBe(1);
  });

  test("filter: equals with OR", () => {
    const query =
      'dataset = sales_invoices | filter customer = "Jane Doe" or id = 1';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );

    expect(result.length).toBe(2);
  });
});

describe("Test 'filter' statement execution with UUIDs", () => {
  test("filter - uuid: equals", () => {
    const query =
      'dataset = logs | filter id = "d29f6582-80d7-4c7b-b7cf-45d2aae9ace0"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UuidTestData.getData()
    );
    expect(result.length).toBe(1);
  });

  test("filter - uuid: not equals", () => {
    const query =
      "dataset = logs | filter id != d29f6582-80d7-4c7b-b7cf-45d2aae9ace0";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UuidTestData.getData()
    );
    expect(result.length).toBe(2);
  });
});

describe("Test 'filter' statement execution for date filtering", () => {
  test("filter - date: basic", () => {
    const query = "dataset = logs | filter date > 2024-04-13";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UnstrLogTestData.getData()
    );
    expect(result.length).toBe(4);
  });

  test("filter - date: basic with hours", () => {
    const query = "dataset = logs | filter date > 2024-04-13T23:50";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UnstrLogTestData.getData()
    );
    expect(result.length).toBe(3);
  });

  test("filter - date: relative neg", () => {
    const query = "dataset = live_logs | filter createdAt > -1d";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(0);
  });

  test("filter - date: relative pos", () => {
    const query = "dataset = live_logs | filter createdAt > 1h";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result.length).toBe(0);
  });

  test("filter - date: relative pos", () => {
    const query = "dataset = live_logs | filter date < 5m";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UnstrLogTestData.getData()
    );
    expect(result.length).toBe(7);
  });

  test("filter - date: relative pos", () => {
    const query = "dataset = live_logs | filter date <= -30s";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UnstrLogTestData.getData()
    );
    expect(result.length).toBe(7);
  });
});
