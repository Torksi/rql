import dynamicField from "./dynamicField";
import ipRangeCheck from "ip-range-check";

export default (field: string, data: any) => {
  // Match the function name and its arguments using regex
  const match = field.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)$/);

  if (!match) {
    return;
  }

  const functionName = match[1];
  const rawArgs = match[2]
    .split(/(?<!\\),/)
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0);

  const args = match[2]
    .split(/(?<!\\),/)
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0)
    .map((arg) => {
      const df = dynamicField(arg, data);
      if (df !== null) return df;
      return arg;
    });

  switch (functionName) {
    case "add": {
      if (args.length !== 2) {
        return null;
      }

      const [num1, num2] = args.map((arg) => parseFloat(arg));
      if (isNaN(num1) || isNaN(num2)) {
        return null;
      }
      return num1 + num2;
    }
    case "base64_decode": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;
      return Buffer.from(str, "base64").toString("utf-8");
    }
    case "base64_encode": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;
      return Buffer.from(str).toString("base64");
    }
    case "ceil": {
      if (args.length !== 1) {
        return null;
      }

      const [num] = args.map((arg) => parseFloat(arg));
      if (isNaN(num)) {
        return null;
      }
      return Math.ceil(num);
    }
    case "coalesce": {
      if (args.length < 1) {
        return null;
      }
      for (const arg of rawArgs) {
        if (dynamicField(arg, data) !== null) {
          return dynamicField(arg, data);
        }
      }
      return null;
    }
    case "distance": {
      if (args.length !== 4) {
        return null;
      }

      const [lat1, lon1, lat2, lon2] = args.map((arg) => parseFloat(arg));
      if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        return null;
      }

      const R = 6371; // Radius of the Earth in kilometers
      const toRadians = (d: number) => (d * Math.PI) / 180;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }
    case "extract_url_host": {
      if (args.length !== 1) {
        return null;
      }
      const [url] = args;
      try {
        const parsedUrl = new URL(
          !url.match(/^http[s]?:\/\//) ? "http://" + url : url
        );
        return parsedUrl.hostname;
      } catch (err) {
        return null;
      }
    }
    case "floor": {
      if (args.length !== 1) {
        return null;
      }

      const [num] = args.map((arg) => parseFloat(arg));
      if (isNaN(num)) {
        return null;
      }
      return Math.floor(num);
    }
    case "get": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;

      if (!str || (typeof str !== "string" && !Array.isArray(str))) {
        return null;
      }

      return str;
    }
    case "get_array": {
      if (args.length !== 2) {
        return null;
      }
      const [arr, index] = args;

      if (!arr || !Array.isArray(arr)) {
        return null;
      }

      const idx = parseInt(index, 10);

      if (isNaN(idx)) {
        return null;
      }

      if (idx < 0) {
        return arr[arr.length + idx];
      }

      return arr[idx];
    }
    case "incidr": {
      if (args.length !== 2) {
        return null;
      }

      return ipRangeCheck(args[0], args[1]);
    }
    case "json_parse": {
      if (args.length !== 1) {
        return null;
      }
      const [jsonString] = args;
      try {
        return JSON.parse(jsonString);
      } catch (err) {
        return null;
      }
    }
    case "json_stringify": {
      if (args.length !== 1) {
        return null;
      }
      const [jsonObject] = args;
      return JSON.stringify(jsonObject);
    }
    case "length": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;
      if (!str || (typeof str !== "string" && !Array.isArray(str))) {
        return null;
      }

      return str.length;
    }
    case "lowercase": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;
      return str.toLowerCase();
    }
    case "multiply": {
      if (args.length !== 2) {
        return null;
      }

      const [num1, num2] = args.map((arg) => parseFloat(arg));
      if (isNaN(num1) || isNaN(num2)) {
        return null;
      }
      return num1 * num2;
    }
    case "round": {
      if (args.length !== 1) {
        return null;
      }

      const [num] = args.map((arg) => parseFloat(arg));
      if (isNaN(num)) {
        return null;
      }
      return Math.round(num);
    }
    case "split": {
      if (args.length !== 2) {
        return null;
      }

      const [str, delimiter] = args;

      const result = str.split(delimiter.replace("\\,", ","));
      return result.length > 1 ? result : null;
    }
    case "substring": {
      if (args.length !== 3) {
        return null;
      }

      const [str, startArg, endArg] = args;
      const start = parseInt(startArg, 10);
      const end = parseInt(endArg, 10);

      if (isNaN(start) || isNaN(end)) {
        return null;
      }
      return str.substring(start, end);
    }
    case "subtract": {
      if (args.length !== 2) {
        return null;
      }

      const [num1, num2] = args.map((arg) => parseFloat(arg));
      if (isNaN(num1) || isNaN(num2)) {
        return null;
      }
      return num1 - num2;
    }
    case "to_date": {
      if (args.length !== 1) {
        return null;
      }
      const [value] = args;
      return new Date(value);
    }
    case "to_number": {
      if (args.length !== 1) {
        return null;
      }
      const [value] = args;
      return Number(value);
    }
    case "to_string": {
      if (args.length !== 1) {
        return null;
      }
      const [value] = args;
      return value.toString();
    }
    case "trim": {
      if (args.length !== 1) {
        return null;
      }
      const [value] = args;
      if (!value || (typeof value !== "string" && !Array.isArray(value))) {
        return null;
      }
      if (Array.isArray(value)) {
        return value.map((val) => val.trim());
      } else {
        return value.trim();
      }
    }
    case "uppercase": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;
      return str.toUpperCase();
    }
    default:
      throw new Error(`Unknown function: ${functionName}.`);
  }
};
