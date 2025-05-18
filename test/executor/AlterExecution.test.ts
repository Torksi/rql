import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { CustomerTestData } from "../data/CustomerTestData";
import { DeviceTestData } from "../data/DeviceTestData";
import { LoginTestData } from "../data/LoginTestData";
import { UrlTestData } from "../data/UrlTestData";

describe("Test 'alter' statement execution", () => {
  test("alter: uppercase", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = uppercase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].customer).toBe("JOHN DOE");
  });

  test("alter: lowercase", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = lowercase(customer)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].customer).toBe("john doe");
  });

  test("alter: substring", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter customer = substring(customer, 1, 4)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].customer).toBe("ohn");
  });

  test("alter: multiply - static", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = multiply(amount, 3)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(600);
  });

  test("alter: multiply - dynamic", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = multiply(amount, id)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(400);
  });

  test("alter: add - static", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, 3)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(203);
  });

  test("alter: add - dynamic", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, id)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(202);
  });

  test("alter: add - dynamic, nested", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, details.wealth)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(360700);
  });

  test("alter: subtract - static", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = subtract(amount, 3)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(197);
  });

  test("alter: subtract - dynamic", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = subtract(amount, id)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(198);
  });

  test("alter: coalesce", () => {
    const query =
      "dataset = events | alter username = coalesce(osActorPrimaryUsername, actorPrimaryUsername, causalityActorPrimaryUsername)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      LoginTestData.getData()
    );
    expect(result[0].username).toBe("domain.local\\john.doe");
    expect(result[1].username).toBe("john.doe");
    expect(result[2].username).toBe("domain.local\\jane.doe");
    expect(result[3].username).toBe("bob.builder");
    expect(result[4].username).toBe(null);
  });

  test("alter: incidr", () => {
    const query =
      "dataset = network_logs | alter inLocal = incidr(srcIp, 192.168.0.0/16)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UrlTestData.getData()
    );
    expect(result[0].inLocal).toBe(false);
    expect(result[1].inLocal).toBe(true);
    expect(result[2].inLocal).toBe(true);
    expect(result[3].inLocal).toBe(false);
    expect(result[4].inLocal).toBe(false);
  });

  test("alter: length", () => {
    const query =
      "dataset = signInLogs | alter usernameLength = length(username)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result[0].usernameLength).toBe(8);
  });

  test("alter: split", () => {
    const query =
      "dataset = signInLogs | alter usernameParts = split(username, .)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result[0].usernameParts.length).toBe(2);
    expect(result[0].usernameParts[0]).toBe("john");
  });

  test("alter: trim", () => {
    const query =
      "dataset = signInLogs | alter description = trim(description)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result[0].description).toBe("Created, 2022-05-01");
  });

  test("alter: json_parse, json_stringify", () => {
    const query =
      "dataset = signInLogs | alter locJsonStr = json_stringify(location) | alter locJson = json_parse(locJsonStr)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result[0].locJsonStr).toBe('"US"');
    expect(result[0].locJson).toBe("US");
  });

  test("alter: extract_url_host", () => {
    const query = "dataset = trafficLogs | alter host = extract_url_host(url)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      UrlTestData.getData()
    );
    result.map((r) => {
      expect(r.host).toBe("a.b");
    });
  });

  test("alter: split, trim, length, get_array, to_date, get, to_string", () => {
    const query = `dataset = signInLogs 
      | alter descParts = split(description, \\,) 
      | alter descParts = trim(descParts) 
      | alter descPartsLength = length(descParts) 
      | alter firstPart = get_array(descParts, 0) 
      | alter lastPart = get_array(descParts, -1) 
      | alter lastPart = to_date(lastPart)
      | alter clonedLocation = get(location)
      | alter stringId = to_string(id)`;
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result[0].descParts.length).toBe(2);
    expect(result[0].descParts[0]).toBe("Created");
    expect(result[0].descPartsLength).toBe(2);
    expect(result[0].firstPart).toBe("Created");
    expect(result[0].lastPart.toISOString()).toBe("2022-05-01T00:00:00.000Z");
    expect(result[0].clonedLocation).toBe("US");
    expect(result[0].stringId).toBe("1");
  });

  test("alter: round, floor, ceil", () => {
    const query =
      "dataset = sales_invoices | filter id = 1 | alter rounded = round(decimal) | alter floored = floor(decimal) | alter ceiled = ceil(decimal)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].rounded).toBe(900);
    expect(result[0].floored).toBe(900);
    expect(result[0].ceiled).toBe(901);
  });

  test("alter: base64", () => {
    const query = `
      dataset = signInLogs
      | alter encoded = base64_encode(username)
      | alter decoded = base64_decode(encoded)`;
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result[0].encoded).toBe("am9obi5kb2U=");
    expect(result[0].decoded).toBe("john.doe");
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
    expect(() =>
      QueryExecutor.executeQuery(parsedQuery, CustomerTestData.getData())
    ).toThrow(
      "Invalid alter statement: 'middlecase' with parameters 'customer'"
    );
  });

  test("alter: multiply - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = multiply(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(null);
  });

  test("alter: add - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(null);
  });

  test("alter: subtract - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = subtract(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData()
    );
    expect(result[0].testValue).toBe(null);
  });

  test("alter: to_number - numeric", () => {
    const query = "dataset = test | alter testValue = to_number(value)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, [{ value: 200 }]);
    expect(result[0].testValue).toBe(200);
  });

  test("alter: to_number - numeric string", () => {
    const query = "dataset = test | alter testValue = to_number(value)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, [{ value: "200" }]);
    expect(result[0].testValue).toBe(200);
  });

  test("alter: to_number - hex string", () => {
    const query = "dataset = test | alter testValue = to_number(value)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, [{ value: "0xc8" }]);
    expect(result[0].testValue).toBe(200);
  });

  test("alter: to_number - exponent string", () => {
    const query = "dataset = test | alter testValue = to_number(value)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, [{ value: "2e2" }]);
    expect(result[0].testValue).toBe(200);
  });

  test("alter: to_number - NaN", () => {
    const query = "dataset = test | alter testValue = to_number(value)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, [{ value: "test" }]);
    expect(result[0].testValue).toBe(null);
  });
});
