import functionalField from "../../src/functionalField";

/**
 * Some of these tests might overlap with Alter statement tests, but these
 * tests focus more on some edge cases.
 */
describe("Test functions execution", () => {
  test("function: ago", () => {
    const result = functionalField(`ago('7d')`, {});
    expect(result).toBeInstanceOf(Date);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 7);

    expect(result.toISOString().slice(0, 10)).toBe(
      daysAgo.toISOString().slice(0, 10)
    );
  });

  test("function: fnv1a", () => {
    const result = functionalField(`fnv1a(password)`, {});
    expect(result).toBe(910909208);
  });

  test("function: future", () => {
    const result = functionalField(`future('7d')`, {});
    expect(result).toBeInstanceOf(Date);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() + 7);

    expect(result.toISOString().slice(0, 10)).toBe(
      daysAgo.toISOString().slice(0, 10)
    );
  });

  test("function: geo_distance", () => {
    const result = functionalField("geo_distance(lat, lon, 60.1695, 24.9354)", {
      lat: 59.4307,
      lon: 24.7624,
    });
    expect(Math.round(result)).toBe(83);
  });

  test("function: geo_in_polygon (in area)", () => {
    const result = functionalField(
      `geo_in_polygon(lat, lon, '{"coordinates":[[[24.8708,60.1895],[24.8708,60.1340],[24.9963,60.1340],[24.9963,60.1895],[24.8708,60.1895]]],"type":"Polygon"}')`,
      {
        lat: 60.1709,
        lon: 24.9412,
      }
    );
    expect(result).toBe(true);
  });

  test("function: geo_in_polygon (not in area)", () => {
    const result = functionalField(
      `geo_in_polygon(lat, lon, '{"coordinates":[[[24.8708,60.1895],[24.8708,60.1340],[24.9963,60.1340],[24.9963,60.1895],[24.8708,60.1895]]],"type":"Polygon"}')`,
      {
        lat: 60.167706024979,
        lon: 24.768868054852277,
      }
    );
    expect(result).toBe(false);
  });

  test("function: json_parse static", () => {
    const result = functionalField(`json_parse('{"key": "value"}')`, {});
    expect(result.key).toBe("value");
  });

  test("function: md5", () => {
    const result = functionalField(`md5(password)`, {});
    expect(result).toBe("5f4dcc3b5aa765d61d8327deb882cf99");
  });

  test("function: now", () => {
    const result = functionalField(`now()`, {});
    expect(result).toBeInstanceOf(Date);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate());

    expect(result.toISOString().slice(0, 10)).toBe(
      daysAgo.toISOString().slice(0, 10)
    );
  });

  test("function: sha1", () => {
    const result = functionalField(`sha1(password)`, {});
    expect(result).toBe("5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8");
  });

  test("function: sha256", () => {
    const result = functionalField(`sha256(password)`, {});
    expect(result).toBe(
      "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
    );
  });

  test("function: to_date static", () => {
    const result = functionalField(`to_date('2025-01-05')`, {});
    expect(result.toString()).toBe(new Date("2025-01-05").toString());
  });

  test("function: to_number static", () => {
    const result = functionalField(`to_number("123")`, {});
    expect(result).toBe(123);
  });

  test("function: to_number static (hex)", () => {
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

  test("function - default: ago", () => {
    const result = functionalField(`ago(str, str)`, {});
    expect(result).toBe(null);
  });

  test("function - default: ago (Invalid type)", () => {
    const result = functionalField(`ago(string)`, {});
    expect(result).toBe(null);
  });

  test("function - default: ago (Invalid type)", () => {
    const result = functionalField(`ago(str)`, {});
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

  test("function - default: fnv1a", () => {
    const result = functionalField(`fnv1a()`, {});
    expect(result).toBe(null);
  });

  test("function - default: future", () => {
    const result = functionalField(`future(string, another)`, {});
    expect(result).toBe(null);
  });

  test("function - default: future (Invalid type)", () => {
    const result = functionalField(`future(string)`, {});
    expect(result).toBe(null);
  });

  test("function - default: geo_distance", () => {
    const result = functionalField(`geo_distance(52, 63)`, {});
    expect(result).toBe(null);
  });

  test("function - default: geo_distance (NaN)", () => {
    const result = functionalField(`geo_distance(52, 63, "str", 14)`, {});
    expect(result).toBe(null);
  });

  test("function - default: geo_in_polygon (Invalid type)", () => {
    const result = functionalField(
      `geo_in_polygon(lat, lon, '{"coordinates": [24.768868054852277,60.167706024979],"type": "Point"}')`,
      {
        lat: 60.1673495262923,
        lon: 24.940618564773132,
      }
    );
    expect(result).toBe(null);
  });

  test("function - default: geo_in_polygon (Invalid JSON)", () => {
    const result = functionalField(`geo_in_polygon(lat, lon, str)`, {
      lat: 60.1673495262923,
      lon: 24.940618564773132,
    });
    expect(result).toBe(null);
  });

  test("function - default: geo_in_polygon (NaN)", () => {
    const result = functionalField(`geo_in_polygon(lat, lon, str)`, {});
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

  test("function - default: md5", () => {
    const result = functionalField(`md5()`, {});
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

  test("function - default: sha1", () => {
    const result = functionalField(`sha1()`, {});
    expect(result).toBe(null);
  });

  test("function - default: sha256", () => {
    const result = functionalField(`sha256()`, {});
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
