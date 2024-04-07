import { QueryExecutor } from "../../src/legacy/LegacyQueryExecutor";
import { QueryParser } from "../../src/legacy/LegacyQueryParser";

const testData = [
  {
    id: 1,
    customer: "John Doe",
    createdAt: new Date("2020-01-01"),
    paid: false,
    canceled: false,
    amount: 900,
    decimal: 900.45,
    dueDate: new Date("2025-12-12"),
    notes: "This is a note",
    flags: ["LOAYLTY", "STAFF"],
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
    details: {
      wealth: 360500,
    },
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
    flags: ["STAFF"],
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
  { id: 1, srcIp: "10.15.2.18", url: "//user:password@a.b:80/path?query" },
  { id: 2, srcIp: "192.168.1.13", url: "https://a.b/test" },
  { id: 3, srcIp: "192.168.1.9", url: "http://a.b" },
  {
    id: 4,
    srcIp: "0:0:0:0:0:FFFF:222.1.41.9",
    url: "https://a.b/path/another",
  },
  { id: 5, srcIp: "85.25.14.92", url: "http://user:password@a.b:8080" },
];

const testData3 = [
  {
    id: 1,
    username: "john.doe",
    device: "mac-1",
    createdAt: "2022-05-01",
    location: "US",
    role: undefined,
    description: " Created, 2022-05-01 ",
  },
  {
    id: 2,
    username: "john.doe",
    device: "mac-1",
    createdAt: "2022-02-01",
    location: "US",
    role: "user",
  },
  {
    id: 3,
    username: "jane.doe",
    device: "win-1",
    createdAt: "2022-05-01",
    location: "GB",
    role: "admin",
  },
  {
    id: 4,
    username: "bob.builder",
    device: "win-2",
    createdAt: "2022-05-02",
    role: null,
  },
  {
    id: 5,
    username: "john.doe",
    device: "win-1",
    createdAt: "2022-05-02",
    location: "GB",
  },
];

const testData4 = [
  { id: 1, osActorPrimaryUsername: "domain.local\\john.doe" },
  { id: 2, causalityActorPrimaryUsername: "john.doe" },
  {
    id: 3,
    actorPrimaryUsername: "jane.doe",
    osActorPrimaryUsername: "domain.local\\jane.doe",
  },
  {
    id: 4,
    actorPrimaryUsername: "bob.builder",
    causalityActorPrimaryUsername: "bob.builder",
  },
  {
    id: 5,
    webUsername: "john.doe",
  },
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
  test("filter: equals null", () => {
    const query = "dataset = users | filter role = null";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(3);
  });

  test("filter: not equals null", () => {
    const query = "dataset = users | filter role != null";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(2);
  });

  test("filter: not equals", () => {
    const query = "dataset = sales_invoices | filter id != 1";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(4);
  });

  test("filter: not equals / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer != 'john doe' | filter id != 2";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: equals / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer = 'john doe'";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: contains / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer contains 'doe'";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(3);
  });

  test("filter: not contains / case-insensitive", () => {
    const query =
      "dataset = sales_invoices | config case_sensitive = false | filter customer not contains 'doe'";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
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

  test("filter: not incidr with quotes", () => {
    const query =
      "dataset = network_logs | filter srcIp 'not incidr' 192.168.1.0/24";
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

  test("filter: matches", () => {
    const query =
      'dataset = sales_invoices | filter customer matches "^\\w+\\s+D\\w*s"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);
  });

  test("filter: matches", () => {
    const query = 'dataset = sales_invoices | filter notes matches "is not"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
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

  test("filter: contains - array", () => {
    const query = 'dataset = sales_invoices | filter flags contains "STAFF"';
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(2);

    const query2 = 'dataset = sales_invoices | filter flags contains "LOAYLTY"';
    const parsedQuery2 = QueryParser.parseQuery(query2);
    const result2 = QueryExecutor.executeQuery(parsedQuery2, testData);
    expect(result2.length).toBe(1);
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

  test("alter: add - dynamic, nested", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, details.wealth)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(360700);
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

  test("alter: coalesce", () => {
    const query =
      "dataset = events | alter username = coalesce(osActorPrimaryUsername, actorPrimaryUsername, causalityActorPrimaryUsername)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData4);
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
    const result = QueryExecutor.executeQuery(parsedQuery, testData2);
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
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result[0].usernameLength).toBe(8);
  });

  test("alter: split", () => {
    const query =
      "dataset = signInLogs | alter usernameParts = split(username, .)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result[0].usernameParts.length).toBe(2);
    expect(result[0].usernameParts[0]).toBe("john");
  });

  test("alter: trim", () => {
    const query =
      "dataset = signInLogs | alter description = trim(description)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result[0].description).toBe("Created, 2022-05-01");
  });

  test("alter: json_parse, json_stringify", () => {
    const query =
      "dataset = signInLogs | alter locJsonStr = json_stringify(location) | alter locJson = json_parse(locJsonStr)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result[0].locJsonStr).toBe('"US"');
    expect(result[0].locJson).toBe("US");
  });

  test("alter: extract_url_host", () => {
    const query = "dataset = trafficLogs | alter host = extract_url_host(url)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData2);
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
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
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
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
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
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
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
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData)).toThrow(
      "Invalid alter statement: 'middlecase' with parameters 'customer'"
    );
  });

  test("alter: multiply - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = multiply(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(0);
  });

  test("alter: add - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = add(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(200);
  });

  test("alter: subtract - invalid dynamic field", () => {
    const query =
      "dataset = sales_invoices | filter id = 2 | alter testValue = subtract(amount, test)";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result[0].testValue).toBe(200);
  });
});

describe("Test 'dedup' statement execution", () => {
  test("dedup: default", () => {
    const query = "dataset = signInLogs | dedup username";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(3);
    expect(result[0].username).toBe("john.doe");
    expect(result[2].username).toBe("bob.builder");
  });

  test("dedup: default", () => {
    const query = "dataset = signInLogs | dedup role";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);

    expect(result.length).toBe(2);
    expect(result[0].username).toBe("john.doe");
    expect(result[1].username).toBe("jane.doe");
  });

  test("dedup: asc", () => {
    const query = "dataset = signInLogs | dedup username by createdAt asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(3);
    expect(result[0].username).toBe("john.doe");
    expect(result[2].username).toBe("bob.builder");
  });

  test("dedup: multiple fields", () => {
    const query =
      "dataset = signInLogs | dedup username, device by createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(4);
    expect(result[0].username).toBe("john.doe");
    expect(result[2].username).toBe("bob.builder");
    expect(result[3].device).toBe("win-1");
  });

  test("dedup: invalid field", () => {
    const query =
      "dataset = signInLogs | fields username, device | dedup username, device, location by createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData3)).toThrow(
      "Invalid dedup field: 'location'"
    );
  });

  /*test("dedup: invalid field", () => {
    const query =
      "dataset = signInLogs| dedup username, device, location by createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData3)).toThrow(
      "Invalid dedup field: 'location'"
    );
  });*/
});

describe("Test 'comp' statement execution", () => {
  test("comp: count", () => {
    const query = "dataset = signInLogs | comp count username as totalUsers";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(1);
    expect(result[0].totalUsers).toBe(5);
  });

  test("comp: count - non-existing field", () => {
    const query =
      "dataset = signInLogs | comp count location as totalCountries";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(1);
    expect(result[0].totalCountries).toBe(4);
  });

  test("comp: count_distinct - non-existing field", () => {
    const query =
      "dataset = signInLogs | comp count_distinct location as totalCountries";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(1);
    expect(result[0].totalCountries).toBe(2);
  });

  test("comp: max / min / avg / sum / median", () => {
    const query =
      "dataset = sales_invoices | comp max amount as maxAmount | comp min amount as minAmount | comp avg amount as avgAmount | comp sum amount as sumAmount | comp median amount as medianAmount";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
    expect(result[0].maxAmount).toBe(900);
    expect(result[0].minAmount).toBe(200);
    expect(result[0].avgAmount).toBe(410);
    expect(result[0].sumAmount).toBe(2050);
    expect(result[0].medianAmount).toBe(300);
  });

  test("comp: earliest / latest", () => {
    const query =
      "dataset = sales_invoices | comp earliest createdAt as earliestDate | comp latest createdAt as latestDate";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData);
    expect(result.length).toBe(1);
    expect(result[0].earliestDate.toISOString()).toBe(
      "2020-01-01T00:00:00.000Z"
    );
    expect(result[0].latestDate.toISOString()).toBe("2020-01-05T00:00:00.000Z");
  });

  test("comp: first / last", () => {
    const query =
      "dataset = signInLogs | comp first device as firstDevice | comp last device as lastDevice";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(1);
    expect(result[0].firstDevice).toBe("mac-1");
    expect(result[0].lastDevice).toBe("win-1");
  });

  test("comp: to_array", () => {
    const query = "dataset = signInLogs | comp to_array device as devices";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(parsedQuery, testData3);
    expect(result.length).toBe(1);
    expect(result[0].devices.length).toBe(3);
  });

  test("comp: invalid function", () => {
    const query = "dataset = signInLogs | comp countt username as totalUsers";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() => QueryExecutor.executeQuery(parsedQuery, testData3)).toThrow(
      "Invalid comp function: 'countt'"
    );
  });
});
