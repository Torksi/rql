import dynamicField from "./dynamicField";
import ipRangeCheck from "ip-range-check";
import { createHash } from "crypto";

export default (field: string, data: any) => {
  // Match the function name and its arguments using regex
  const match = field.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)$/);

  if (!match) {
    return null;
  }

  const functionName = match[1];
  const rawArgs = match[2]
    .split(/(?<!\\),/)
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0)
    .map((arg) => {
      let trimmedArg = arg.trim();

      // Remove quotes if present
      if (trimmedArg.startsWith('"') && trimmedArg.endsWith('"')) {
        trimmedArg = trimmedArg.slice(1, -1);
      } else if (trimmedArg.startsWith("'") && trimmedArg.endsWith("'")) {
        trimmedArg = trimmedArg.slice(1, -1);
      }

      return trimmedArg;
    });

  const args = match[2]
    .split(/(?<!\\),/)
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0)
    .map((arg) => {
      let trimmedArg = arg.trim();

      // Remove quotes if present
      if (trimmedArg.startsWith('"') && trimmedArg.endsWith('"')) {
        trimmedArg = trimmedArg.slice(1, -1);
      } else if (trimmedArg.startsWith("'") && trimmedArg.endsWith("'")) {
        trimmedArg = trimmedArg.slice(1, -1);
      }

      const df = dynamicField(trimmedArg, data);
      if (df !== null) return df;
      return trimmedArg;
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
    case "ago": {
      if (args.length !== 1) {
        return null;
      }

      const [dateString] = args;

      const parsed = parseRelativeTime(dateString, "past");
      if (!parsed) {
        return null;
      }

      return parsed;
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
    case "extract_url_host": {
      if (args.length !== 1) {
        return null;
      }
      const [url] = args;
      try {
        const parsedUrl = new URL(
          !url.match(/^.{1,10}?:\/\//) ? "http://" + url : url
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
    case "fnv1a": {
      if (args.length !== 1) {
        return null;
      }

      const [str] = args;

      let hash = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
      }
      return hash >>> 0;
    }
    case "future": {
      if (args.length !== 1) {
        return null;
      }

      const [dateString] = args;

      const parsed = parseRelativeTime(dateString, "future");
      if (!parsed) {
        return null;
      }

      return parsed;
    }
    case "geo_distance": {
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
    case "geo_in_polygon": {
      if (args.length < 3) {
        return null;
      }

      const [lat, lon] = args;
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);

      // concat all rest args to a single polygon string
      let polygon = args.slice(2).join(",").replace(/\\,/g, ",");

      if (
        (polygon.startsWith("'") && polygon.endsWith("'")) ||
        (polygon.startsWith('"') && polygon.endsWith('"'))
      ) {
        polygon = polygon.slice(1, -1);
      }

      if (isNaN(latNum) || isNaN(lonNum)) {
        return null;
      }

      let parsedPolygon;
      try {
        parsedPolygon = JSON.parse(polygon);
      } catch (err) {
        return null;
      }

      if (
        !parsedPolygon ||
        parsedPolygon.type !== "Polygon" ||
        !Array.isArray(parsedPolygon.coordinates) ||
        parsedPolygon.coordinates.length === 0
      ) {
        return null;
      }

      const coordinates = parsedPolygon.coordinates[0]; // exterior ring
      if (!Array.isArray(coordinates) || coordinates.length < 3) {
        return null;
      }

      // Ray-casting algorithm
      let inside = false;
      for (
        let i = 0, j = coordinates.length - 1;
        i < coordinates.length;
        j = i++
      ) {
        const [xi, yi] = coordinates[i];
        const [xj, yj] = coordinates[j];

        const intersect =
          yi > latNum !== yj > latNum &&
          lonNum < ((xj - xi) * (latNum - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
      }

      return inside;
    }
    case "get": {
      if (rawArgs.length !== 1) {
        return null;
      }
      const [str] = rawArgs;

      if (dynamicField(str, data) !== null) {
        return dynamicField(str, data);
      }

      return null;
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
    case "md5": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;

      const hash = createHash("md5");
      hash.update(str);
      return hash.digest("hex");
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
    case "now": {
      return new Date();
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
    case "sha1": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;

      const hash = createHash("sha1");
      hash.update(str);
      return hash.digest("hex");
    }
    case "sha256": {
      if (args.length !== 1) {
        return null;
      }
      const [str] = args;

      const hash = createHash("sha256");
      hash.update(str);
      return hash.digest("hex");
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

      if (typeof str !== "string") {
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

      const result = Number(value);

      if (isNaN(result)) {
        return null;
      }

      return result;
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

const parseRelativeTime = (
  timeString: string,
  direction: "future" | "past"
) => {
  const relativeDateRegex = /^(\d+)([dhms])$/;
  const relativeDateMatch = timeString
    .toString()
    .trim()
    .match(relativeDateRegex);

  if (relativeDateMatch) {
    const now = new Date();
    const relativeDate = new Date(now);

    const dateVal = parseInt(relativeDateMatch[1], 10);
    const unit = relativeDateMatch[2];
    const sign = direction === "past" ? -1 : 1;

    switch (unit) {
      case "d":
        relativeDate.setDate(relativeDate.getDate() + sign * dateVal);
        break;
      case "h":
        relativeDate.setHours(relativeDate.getHours() + sign * dateVal);
        break;
      case "m":
        relativeDate.setMinutes(relativeDate.getMinutes() + sign * dateVal);
        break;
      case "s":
        relativeDate.setSeconds(relativeDate.getSeconds() + sign * dateVal);
        break;
      default:
        throw new Error(`Invalid relative date unit: '${unit}'`);
    }

    return relativeDate;
  }

  return null;
};
