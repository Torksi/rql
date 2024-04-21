import { QueryExecutor } from "../../src/QueryExecutor";
import { QueryParser } from "../../src/QueryParser";
import { DeviceTestData } from "../data/DeviceTestData";

describe("Test 'dedup' statement execution", () => {
  test("dedup: default", () => {
    const query = "dataset = signInLogs | dedup username";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result.length).toBe(3);
    expect(result[0].username).toBe("john.doe");
    expect(result[2].username).toBe("bob.builder");
  });

  test("dedup: default", () => {
    const query = "dataset = signInLogs | dedup role";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );

    expect(result.length).toBe(2);
    expect(result[0].username).toBe("john.doe");
    expect(result[1].username).toBe("jane.doe");
  });

  test("dedup: asc", () => {
    const query = "dataset = signInLogs | dedup username by createdAt asc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result.length).toBe(3);
    expect(result[0].username).toBe("john.doe");
    expect(result[2].username).toBe("bob.builder");
  });

  test("dedup: multiple fields", () => {
    const query =
      "dataset = signInLogs | dedup username, device by createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = QueryExecutor.executeQuery(
      parsedQuery,
      DeviceTestData.getData()
    );
    expect(result.length).toBe(4);
    expect(result[0].username).toBe("john.doe");
    expect(result[2].username).toBe("bob.builder");
    expect(result[3].device).toBe("win-1");
  });

  test("dedup: invalid field, return nothing", () => {
    const query =
      "dataset = signInLogs | fields username, device | dedup username, device, location by createdAt desc";
    const parsedQuery = QueryParser.parseQuery(query);
    const result = () =>
      QueryExecutor.executeQuery(parsedQuery, DeviceTestData.getData());
    expect(result.length).toBe(0);
  });
});
