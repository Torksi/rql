import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { CustomerTestData } from "../data/CustomerTestData";
import { DeviceTestData } from "../data/DeviceTestData";

describe("Test 'comp' statement execution", () => {
  test("comp: count", () => {
    const query = "dataset = signInLogs | comp count username as totalUsers";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
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
      DeviceTestData.getData()
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
      DeviceTestData.getData()
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
      CustomerTestData.getData()
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
      CustomerTestData.getData()
    );
    expect(result.length).toBe(1);
    expect(result[0].earliestDate.toISOString()).toBe(
      "2020-01-01T00:00:00.000Z"
    );
    expect(result[0].latestDate.toISOString()).toBe("2020-01-05T00:00:00.000Z");
  });

  test("comp: first / last", () => {
    const query =
      "dataset = signInLogs | comp first device as firstDevice, last device as lastDevice";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
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
      DeviceTestData.getData()
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
      DeviceTestData.getData()
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
      DeviceTestData.getData()
    );

    expect(result.length).toBe(2);
    expect(result[0].totalUsers).toBe(2);
    expect(result[1].avgValue).toBe(450);
  });

  test("comp: invalid function", () => {
    const query = "dataset = signInLogs | comp countt username as totalUsers";
    const parsedQuery = QueryParser.parseQuery(query);
    expect(() =>
      QueryExecutor.executeQuery(parsedQuery, DeviceTestData.getData())
    ).toThrow("Invalid comp function: 'countt'");
  });
});
