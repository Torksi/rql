import functionalField from "../../src/functionalField";

/**
 * Some of these tests might overlap with Alter statement tests, but these
 * tests focus more on some edge cases.
 */
describe("Test functions execution", () => {
  test("function: distance", () => {
    const result = functionalField("distance(lat, lon, 60.1695, 24.9354)", {
      lat: 59.4307,
      lon: 24.7624,
    });
    expect(Math.round(result)).toBe(83);
  });

  test("function: json_parse static", () => {
    const result = functionalField(`json_parse('{"key": "value"}')`, {});
    expect(result.key).toBe("value");
  });

  test("function: to_date static", () => {
    const result = functionalField(`to_date('2025-01-05')`, {});
    expect(result.toString()).toBe(new Date("2025-01-05").toString());
  });

  test("function: to_number static", () => {
    const result = functionalField(`to_number("123")`, {});
    expect(result).toBe(123);
  });

  test("function: to_number static", () => {
    const result = functionalField(`to_number('0x5')`, {});
    expect(result).toBe(5);
  });
});

describe("Test function default values", () => {
  test("function - default: Invalid statement", () => {
    const result = functionalField(`test`, {});
    expect(result).toBe(null);
  });

  test("function - default: add", () => {
    const result = functionalField(`add(1)`, {});
    expect(result).toBe(null);
  });

  test("function - default: base64_decode", () => {
    const result = functionalField(`base64_decode(string, another)`, {});
    expect(result).toBe(null);
  });

  test("function - default: base64_encode", () => {
    const result = functionalField(`base64_encode(string, another)`, {});
    expect(result).toBe(null);
  });

  test("function - default: ceil", () => {
    const result = functionalField(`ceil(string, another)`, {});
    expect(result).toBe(null);
  });

  test("function - default: ceil (NaN)", () => {
    const result = functionalField(`ceil(string)`, {});
    expect(result).toBe(null);
  });

  test("function - default: coalesce", () => {
    const result = functionalField(`coalesce()`, {});
    expect(result).toBe(null);
  });

  test("function - default: distance", () => {
    const result = functionalField(`distance(52, 63)`, {});
    expect(result).toBe(null);
  });

  test("function - default: distance (NaN)", () => {
    const result = functionalField(`distance(52, 63, "str", 14)`, {});
    expect(result).toBe(null);
  });

  test("function - default: extract_url_host", () => {
    const result = functionalField(`extract_url_host()`, {});
    expect(result).toBe(null);
  });

  test("function - default: floor", () => {
    const result = functionalField(`floor(string, another)`, {});
    expect(result).toBe(null);
  });

  test("function - default: floor (NaN)", () => {
    const result = functionalField(`floor(string)`, {});
    expect(result).toBe(null);
  });

  test("function - default: get", () => {
    const result = functionalField(`get(string, another)`, {});
    expect(result).toBe(null);
  });

  test("function - default: get (Invalid field)", () => {
    const result = functionalField(`get(foo)`, { bar: 5 });
    expect(result).toBe(null);
  });

  test("function - default: get_array", () => {
    const result = functionalField(`get_array(string, another, third)`, {});
    expect(result).toBe(null);
  });

  test("function - default: get_array (NaN)", () => {
    const result = functionalField(`get_array(val, string)`, {
      val: ["a", "b"],
    });
    expect(result).toBe(null);
  });

  test("function - default: incidr", () => {
    const result = functionalField(`incidr(val)`, {});
    expect(result).toBe(null);
  });

  test("function - default: json_parse", () => {
    const result = functionalField(`json_parse(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: json_parse (Invalid JSON)", () => {
    const result = functionalField(`json_parse("{key: 'value'}")`, {});
    expect(result).toBe(null);
  });

  test("function - default: json_stringify", () => {
    const result = functionalField(`json_stringify(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: length", () => {
    const result = functionalField(`length(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: length (Invalid type)", () => {
    const result = functionalField(`length(prop)`, { prop: 123 });
    expect(result).toBe(null);
  });

  test("function - default: lowercase", () => {
    const result = functionalField(`lowercase(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: multiply", () => {
    const result = functionalField(`multiply(val)`, {});
    expect(result).toBe(null);
  });

  test("function - default: round", () => {
    const result = functionalField(`round(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: round (NaN)", () => {
    const result = functionalField(`round(val)`, {});
    expect(result).toBe(null);
  });

  test("function - default: split", () => {
    const result = functionalField(`split(val)`, {});
    expect(result).toBe(null);
  });

  test("function - default: substring", () => {
    const result = functionalField(`substring(val)`, {});
    expect(result).toBe(null);
  });

  test("function - default: substring (NaN)", () => {
    const result = functionalField(`substring(val, 1, str)`, {});
    expect(result).toBe(null);
  });

  test("function - default: substring (Invalid type)", () => {
    const result = functionalField(`substring(prop, 1, 5)`, { prop: 123 });
    expect(result).toBe(null);
  });

  test("function - default: subtract", () => {
    const result = functionalField(`subtract(val)`, {});
    expect(result).toBe(null);
  });

  test("function - default: subtract (NaN)", () => {
    const result = functionalField(`subtract(val, str)`, {});
    expect(result).toBe(null);
  });

  test("function - default: to_date", () => {
    const result = functionalField(`to_date(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: to_number", () => {
    const result = functionalField(`to_number(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: to_number (Invalid type)", () => {
    const result = functionalField(`to_number(val)`, { val: "str" });
    expect(result).toBe(null);
  });

  test("function - default: to_string", () => {
    const result = functionalField(`to_string(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: trim", () => {
    const result = functionalField(`trim(val, second)`, {});
    expect(result).toBe(null);
  });

  test("function - default: trim (Invalid type)", () => {
    const result = functionalField(`trim(prop)`, { prop: 5 });
    expect(result).toBe(null);
  });

  test("function - default: uppercase", () => {
    const result = functionalField(`uppercase(val, second)`, {});
    expect(result).toBe(null);
  });
});
