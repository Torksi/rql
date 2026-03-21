import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { CustomerTestData } from "../data/CustomerTestData";
import { DeviceTestData } from "../data/DeviceTestData";
import { LoginTestData } from "../data/LoginTestData";

describe("Test 'comp' statement execution", () => {
  test("comp: count", () => {
    const query = "dataset = signInLogs | comp count username as totalUsers";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(1);
    expect(result[0].totalUsers).toBe(5);
  });

  test("comp: count - non-existing field", () => {
    const query =
      "dataset = signInLogs | comp count location as totalCountries";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(1);
    expect(result[0].totalCountries).toBe(4);
  });

  test("comp: count_distinct - non-existing field", () => {
    const query =
      "dataset = signInLogs | comp count_distinct location as totalCountries";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(1);
    expect(result[0].totalCountries).toBe(2);
  });

  test("comp: max / min / avg / sum / median", () => {
    const query =
      "dataset = sales_invoices | comp max amount as maxAmount, min amount as minAmount, avg amount as avgAmount, sum amount as sumAmount, median amount as medianAmount";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData(),
    );

    expect(result.length).toBe(1);
    expect(result[0].maxAmount).toBe(900);
    expect(result[0].minAmount).toBe(200);
    expect(result[0].avgAmount).toBe(410);
    expect(result[0].sumAmount).toBe(2050);
    expect(result[0].medianAmount).toBe(300);
  });

  test("comp: earliest / latest", () => {
    const query =
      "dataset = sales_invoices | comp earliest createdAt as earliestDate, latest createdAt as latestDate";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData(),
    );
    expect(result.length).toBe(1);
    expect(result[0].earliestDate.toISOString()).toBe(
      "2020-01-01T00:00:00.000Z",
    );
    expect(result[0].latestDate.toISOString()).toBe("2020-01-05T00:00:00.000Z");
  });

  test("comp: first / last", () => {
    const query =
      "dataset = signInLogs | comp first device as firstDevice, last device as lastDevice";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(1);
    expect(result[0].firstDevice).toBe("mac-1");
    expect(result[0].lastDevice).toBe("win-1");
  });

  test("comp: to_array", () => {
    const query = "dataset = signInLogs | comp to_array device as devices";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(1);
    expect(result[0].devices.length).toBe(3);
  });

  test("comp: count - group", () => {
    const query =
      "dataset = signInLogs | comp count username as totalUsers | config grouping = location";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(2);
    expect(result[0].totalUsers).toBe(2);
  });

  test("comp: count - group & avg", () => {
    const query =
      "dataset = signInLogs | comp count username as totalUsers, avg deviceValue as avgValue | config grouping = location";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );

    expect(result.length).toBe(2);
    expect(result[0].totalUsers).toBe(2);
    expect(result[1].avgValue).toBe(450);
  });

  test("comp: count - group v2", () => {
    const query =
      "dataset = signInLogs | comp count username by location | sort location asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );

    expect(result.length).toBe(2);
    expect(result[0].username_count).toBe(2);
    expect(result[0].location).toBe("GB");
  });

  test("comp: count - group v2, nested field", () => {
    const query =
      "dataset = signInLogs | alter username = coalesce(osActorPrimaryUsername, actorPrimaryUsername, causalityActorPrimaryUsername, webUsername) | comp count username by source.ip | sort username asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      LoginTestData.getData(),
    );

    console.log(result);

    expect(result.length).toBe(3);
    expect(result[0].source_ip).toBe("192.168.1.1");
    expect(result[2].username_count).toBe(1);
  });

  test("comp: count - group v2, nested field, aliases", () => {
    const query =
      "dataset = signInLogs | alter username = coalesce(osActorPrimaryUsername, actorPrimaryUsername, causalityActorPrimaryUsername, webUsername) | comp count username by source.ip as logins | sort username asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      LoginTestData.getData(),
    );

    console.log(result);

    expect(result.length).toBe(3);
    expect(result[0].logins).toBe(3);
    expect(result[1].source_ip).toBe("192.168.1.2");
    expect(result[1].logins).toBe(1);
  });

  test("comp: invalid function", () => {
    const query = "dataset = signInLogs | comp countt username as totalUsers";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() =>
      QueryExecutor.executeQuery(parsedQuery, DeviceTestData.getData()),
    ).toThrow("Invalid comp function: 'countt'");
  });

  // New syntax tests
  test("comp: count() without field parameter", () => {
    const query = "dataset = signInLogs | comp count() as total_events";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(1);
    expect(result[0].total_events).toBe(5);
  });

  test("comp: count() by single field", () => {
    const query = "dataset = signInLogs | comp count() as events by location";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(2);
    expect(result.some((r) => r.events === 2)).toBe(true);
    expect(result.some((r) => r.location === "US")).toBe(true);
    expect(result.some((r) => r.location === "GB")).toBe(true);
  });

  test("comp: count_distinct() with by clause", () => {
    const query =
      "dataset = signInLogs | comp count_distinct(username) as unique_users by location";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(2);
    expect(result.every((r) => r.unique_users > 0)).toBe(true);
  });

  test("comp: multiple functions with single grouping", () => {
    const query =
      "dataset = signInLogs | comp count() as events, count_distinct(username) as unique_users by location";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("events");
    expect(result[0]).toHaveProperty("unique_users");
    expect(result[0]).toHaveProperty("location");
  });

  test("comp: count() by multiple fields", () => {
    const query =
      "dataset = signInLogs | comp count() as events by location, username";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBeGreaterThan(2);
    expect(result[0]).toHaveProperty("location");
    expect(result[0]).toHaveProperty("username");
    expect(result[0]).toHaveProperty("events");
  });

  test("comp: multiple functions by multiple fields", () => {
    const query =
      "dataset = signInLogs | comp count() as events, count_distinct(device) as unique_devices by location, username";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData(),
    );
    expect(result.length).toBeGreaterThan(2);
    expect(result[0]).toHaveProperty("location");
    expect(result[0]).toHaveProperty("username");
    expect(result[0]).toHaveProperty("events");
    expect(result[0]).toHaveProperty("unique_devices");
  });

  test("comp: max/min with grouping", () => {
    const query =
      "dataset = sales_invoices | comp max(amount) as max_amount, min(amount) as min_amount by customer";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData(),
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("max_amount");
    expect(result[0]).toHaveProperty("min_amount");
    expect(result[0]).toHaveProperty("customer");
  });

  test("comp: avg and sum with multiple grouping", () => {
    const query =
      "dataset = sales_invoices | comp avg(amount) as avg_amount, sum(amount) as total_amount by paid, canceled";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      CustomerTestData.getData(),
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("avg_amount");
    expect(result[0]).toHaveProperty("total_amount");
    expect(result[0]).toHaveProperty("paid");
    expect(result[0]).toHaveProperty("canceled");
  });
});
