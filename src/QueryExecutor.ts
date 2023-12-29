/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamicSort from "./dynamicSort";
import ipRangeCheck from "ip-range-check";
import { Query, QueryAlter } from "./types";
import { Client } from "@elastic/elasticsearch";
import dynamicField from "./dynamicField";

export class QueryExecutor {
  /**
   * Executes the provided query on the given data array.
   *
   * The data array consists of objects with key-value pairs representing the data.
   *
   * If any field or operator is not found in a row of data, an error will be thrown.
   *
   * @param {Query} query The query object containing fields, alters, filters, sort, and limit properties.
   * @param {Array} data The data to be queried, as an array of objects.
   * @returns {Array} The result of the query execution, as an array of objects.
   * @throws {Error} If any field in the query is not found in the data, or an invalid operator is used.
   * @public
   * @static
   */
  public static executeQuery(query: Query, data: any[]): any[] {
    let results = data;

    // Alter
    if (query.alters && query.alters.length > 0) {
      for (const alter of query.alters) {
        this.executeAlter(alter, results);
      }
    }

    // Fields
    if (query.fields && query.fields.length > 0) {
      results = results.map((row) => {
        const result: any = {};
        for (const field of query.fields) {
          const { name, alias } = field;
          result[alias || name] = row[name];
        }
        return result;
      });
    }

    // Filter
    if (query.filters && query.filters.length > 0) {
      results = results.filter((row) => {
        let allFiltersResult = true; // Track the result across all filters (MULTI logic)

        // Label for breaking out of nested loops
        filterLoop: for (const filter of query.filters) {
          let filterResult = false; // Assume filter fails for OR and AND logic until a passing block is found

          for (const block of filter.blocks) {
            let blockResult = true; // Assume block passes (AND logic) until a failing expression is found

            for (const expression of block.expressions) {
              const { field, operator, value } = expression;
              const rowValue = dynamicField(field, row);

              // If rowValue is null, the expression fails
              if (
                rowValue === null &&
                value.toString().toLowerCase() !== "null" &&
                value.toString().toLowerCase() !== "undefined"
              ) {
                blockResult = false;
                break; // Stop evaluating this block
              }

              operatorSwitch: switch (operator) {
                case "equals": {
                  if (
                    value.toString().toLowerCase() === "null" ||
                    value.toString().toLowerCase() === "undefined"
                  ) {
                    blockResult = rowValue === null || rowValue === undefined;
                    break operatorSwitch;
                  }

                  blockResult =
                    rowValue === value ||
                    rowValue.toString() === value.toString();
                  break;
                }

                case "notEquals": {
                  if (
                    value.toString().toLowerCase() === "null" ||
                    value.toString().toLowerCase() === "undefined"
                  ) {
                    blockResult = rowValue !== null && rowValue !== undefined;
                    break operatorSwitch;
                  }

                  blockResult =
                    rowValue !== value ||
                    rowValue.toString() !== value.toString();
                  break;
                }
                case "contains":
                  blockResult =
                    rowValue.includes(value) ||
                    rowValue.toString().includes(value.toString());
                  break;
                case "notContains":
                  blockResult =
                    !rowValue.includes(value) ||
                    !rowValue.toString().includes(value.toString());
                  break;
                case "lessThan":
                  blockResult = rowValue < value;
                  break;
                case "greaterThan":
                  blockResult = rowValue > value;
                  break;
                case "lessThanOrEquals":
                  blockResult = rowValue <= value;
                  break;
                case "greaterThanOrEquals":
                  blockResult = rowValue >= value;
                  break;
                case "matches":
                  try {
                    const regex = new RegExp(value.toString());
                    blockResult = regex.test(rowValue.toString());
                  } catch (e) {
                    throw new Error(`Invalid regex pattern: '${value}'`);
                  }
                  break;
                case "incidr":
                  blockResult = ipRangeCheck(rowValue, value.toString());
                  break;
                case "notIncidr":
                  blockResult = !ipRangeCheck(rowValue, value.toString());
                  break;
                default:
                  // This should never happen as the validator should catch this
                  throw new Error(`Invalid operator: '${operator}'`);
              }
              if (!blockResult) {
                break; // Stop evaluating this block as one expression has failed
              }
            }

            if (blockResult) {
              filterResult = true; // A block passed, so the filter passes for OR and AND logic
              break; // Stop evaluating other blocks in this filter
            }
          }

          if (!filterResult) {
            allFiltersResult = false;
            break filterLoop; // Stop the filter function as one filter has failed (MULTI logic)
          }
        }

        return allFiltersResult;
      });
    }

    // Sort
    if (query.sort && query.sort !== null && query.sort.length > 0) {
      const sorts = query.sort.map((s) => {
        if (
          query.fields &&
          query.fields.length > 0 &&
          query.fields.find(
            (f) =>
              (f.name === s.field && f.alias === undefined) ||
              (f.alias === s.field && f.alias !== undefined)
          ) === undefined
        ) {
          throw new Error(`Invalid sort field: '${s.field}'`);
        }

        if (s.direction === "desc") {
          return `-${s.field}`;
        }
        return s.field;
      });
      results = results.sort(dynamicSort(sorts));
    }

    // Dedup
    if (query.dedup && query.dedup !== null) {
      const { fields, sortBy, sortDirection } = query.dedup;

      // Validate all dedup fields
      for (const field of fields) {
        if (
          query.fields &&
          query.fields.length > 0 &&
          query.fields.find(
            (f) =>
              (f.name === field && f.alias === undefined) ||
              (f.alias === field && f.alias !== undefined)
          ) === undefined
        ) {
          throw new Error(`Invalid dedup field: '${field}'`);
        }
      }

      const dedupedResults = new Map();

      for (const row of results) {
        const compositeKeyParts = fields.map((field) => {
          const fieldValue = dynamicField(field, row);
          return fieldValue !== null && fieldValue !== undefined
            ? fieldValue.toString()
            : "";
        });

        if (!compositeKeyParts.includes("")) {
          const compositeKey = compositeKeyParts.join("|");

          // Check if the record needs to be updated based on sortDirection
          if (!dedupedResults.has(compositeKey) || (sortBy && sortDirection)) {
            const existingRow = dedupedResults.get(compositeKey);
            if (
              !existingRow ||
              (sortDirection === "desc" &&
                dynamicField(sortBy || "", row) >
                  dynamicField(sortBy || "", existingRow))
            ) {
              dedupedResults.set(compositeKey, row);
            }
          }
        }
      }

      results = Array.from(dedupedResults.values());
    }

    // Limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    // Return type

    const stats: any[] = [];

    if (query.returnType === "stats") {
      const statsRow: any = {};

      for (const comp of query.comp) {
        switch (comp.function) {
          case "count":
            statsRow[comp.returnField] = results.reduce(
              (accumulator, currentRow) => {
                if (dynamicField(comp.field, currentRow) !== null) {
                  return accumulator + 1;
                }
                return accumulator;
              },
              0
            );
            break;
          case "count_distinct":
            statsRow[comp.returnField] = new Set(
              results
                .map((row) => dynamicField(comp.field, row))
                .filter((value) => value !== null && value !== undefined)
            ).size;
            break;
          case "min":
            statsRow[comp.returnField] = Math.min(
              ...results
                .map((row) => dynamicField(comp.field, row))
                .filter((value) => value !== null && value !== undefined)
            );
            break;
          case "max":
            statsRow[comp.returnField] = Math.max(
              ...results
                .map((row) => dynamicField(comp.field, row))
                .filter((value) => value !== null && value !== undefined)
            );
            break;
          case "avg":
            statsRow[comp.returnField] =
              results
                .map((row) => dynamicField(comp.field, row))
                .filter((value) => value !== null && value !== undefined)
                .reduce((a, b) => a + b, 0) / results.length;
            break;
          case "earliest":
            statsRow[comp.returnField] = new Date(
              Math.min(
                ...results
                  .map((row) => dynamicField(comp.field, row))
                  .filter((value) => value !== null && value !== undefined)
              )
            );
            break;
          case "latest":
            statsRow[comp.returnField] = new Date(
              Math.max(
                ...results
                  .map((row) => dynamicField(comp.field, row))
                  .filter((value) => value !== null && value !== undefined)
              )
            );
            break;
          case "sum":
            statsRow[comp.returnField] = results
              .map((row) => dynamicField(comp.field, row))
              .filter((value) => value !== null && value !== undefined)
              .reduce((a, b) => a + b, 0);
            break;
          case "median": {
            const sorted = results
              .map((row) => dynamicField(comp.field, row))
              .filter((value) => value !== null && value !== undefined)
              .sort((a, b) => a - b);
            const middle = Math.floor(sorted.length / 2);
            statsRow[comp.returnField] =
              sorted.length % 2 !== 0
                ? sorted[middle]
                : (sorted[middle - 1] + sorted[middle]) / 2;
            break;
          }
          case "first":
            statsRow[comp.returnField] = results[0][comp.field];
            break;
          case "last":
            statsRow[comp.returnField] =
              results[results.length - 1][comp.field];
            break;
          case "to_array": {
            const values = new Set(
              results
                .map((row) => dynamicField(comp.field, row))
                .filter((value) => value !== null && value !== undefined)
            );
            statsRow[comp.returnField] = Array.from(values);
            break;
          }
          default:
            throw new Error(`Invalid comp function: '${comp.function}'`);
        }
      }

      stats.push(statsRow);
    }

    return query.returnType === "records" ? results : stats;
  }

  /**
   * WIP: Executes the provided query on the Elasticsearch client and index.
   *
   * The data array consists of objects with key-value pairs representing the data.
   *
   * If any field or operator is not found in a row of data, an error will be thrown.
   *
   * @deprecated This function is still under development.
   * @param {Query} query The query object containing fields, alters, filters, sort, and limit properties.
   * @param {Array} data The data to be queried, as an Elasticsearch response.
   * @returns {Array} The result of the query execution, as an array of objects.
   * @throws {Error} If any field in the query is not found in the data, or an invalid operator is used.
   * @public
   * @static
   */
  public static async executeElasticQuery(
    client: Client,
    index: string,
    query: Query
  ): Promise<any[]> {
    const body: any = {};

    // Fields
    if (query.fields && query.fields.length > 0) {
      body._source = query.fields.map((field) => field.name);
    }

    // Sorting
    if (query.sort && query.sort.length > 0) {
      const sorts: any[] = query.sort.map((s) => {
        return { [s.field]: { order: s.direction } };
      });

      body.sort = sorts;
    }

    // TODO: Implement all other statements here too, so that the whole query can be executed on Elasticsearch.

    let response: any;

    try {
      response = await client.search({ index, ...body });
    } catch (err: any) {
      throw new Error(`Elasticsearch error: ${err.message}`);
    }

    const data = response.hits.hits.map((hit: any) => ({
      _id: hit._id,
      ...hit._source,
    }));

    return this.executeQuery(query, data); // Once we have all statements implemented, we can remove this line as the result should already be parsed.
  }

  private static executeAlter(alter: QueryAlter, data: any[]) {
    try {
      data.map((row) => {
        const fieldValue = dynamicField(alter.parameters[0], row);

        switch (alter.func) {
          case "lowercase":
            row[alter.field] = fieldValue.toLowerCase();
            break;
          case "uppercase":
            row[alter.field] = fieldValue.toUpperCase();
            break;
          case "substring":
            row[alter.field] = fieldValue.substring(
              isNaN(Number(alter.parameters[1]))
                ? Number(dynamicField(alter.parameters[1], row))
                : Number(alter.parameters[1]),
              isNaN(Number(alter.parameters[2]))
                ? Number(dynamicField(alter.parameters[2], row))
                : Number(alter.parameters[2])
            );
            break;
          case "multiply":
            row[alter.field] =
              fieldValue *
              (isNaN(Number(alter.parameters[1]))
                ? Number(dynamicField(alter.parameters[1], row))
                : Number(alter.parameters[1]));
            break;
          case "add":
            row[alter.field] =
              fieldValue +
              (isNaN(Number(alter.parameters[1]))
                ? Number(dynamicField(alter.parameters[1], row))
                : Number(alter.parameters[1]));
            break;
          case "subtract":
            row[alter.field] =
              fieldValue -
              (isNaN(Number(alter.parameters[1]))
                ? Number(dynamicField(alter.parameters[1], row))
                : Number(alter.parameters[1]));
            break;
          case "coalesce":
            for (const param of alter.parameters) {
              if (dynamicField(param, row) !== null) {
                row[alter.field] = dynamicField(param, row);
                break;
              }
            }
            if (row[alter.field] === undefined) {
              row[alter.field] = null;
            }
            break;
          case "incidr":
            row[alter.field] = ipRangeCheck(fieldValue, alter.parameters[1]);
            break;
          case "split":
            if (!fieldValue || typeof fieldValue !== "string") break;
            row[alter.field] = fieldValue.split(
              alter.parameters[1].replace("\\,", ",")
            );
            break;
          case "to_string":
            row[alter.field] = fieldValue.toString();
            break;
          case "to_date":
            row[alter.field] = new Date(fieldValue);
            break;
          case "trim": {
            if (
              !fieldValue ||
              (typeof fieldValue !== "string" && !Array.isArray(fieldValue))
            ) {
              break;
            }
            if (Array.isArray(fieldValue)) {
              row[alter.field] = fieldValue.map((value) => value.trim());
            } else {
              row[alter.field] = fieldValue.trim();
            }
            break;
          }
          case "length": {
            if (
              !fieldValue ||
              (typeof fieldValue !== "string" && !Array.isArray(fieldValue))
            ) {
              break;
            }

            if (Array.isArray(fieldValue)) {
              row[alter.field] = fieldValue.length;
            } else {
              row[alter.field] = fieldValue.toString().length;
            }

            break;
          }
          case "get": {
            if (!fieldValue) {
              row[alter.field] = null;
              break;
            }
            row[alter.field] = fieldValue;
            break;
          }
          case "get_array": {
            if (!fieldValue || !Array.isArray(fieldValue)) {
              row[alter.field] = null;
              break;
            }

            if (alter.parameters[1] === "-1") {
              row[alter.field] = fieldValue[fieldValue.length - 1];
              break;
            }

            row[alter.field] = fieldValue[Number(alter.parameters[1])];
            break;
          }
          case "base64_encode":
            row[alter.field] = Buffer.from(fieldValue).toString("base64");
            break;
          case "base64_decode":
            row[alter.field] = Buffer.from(fieldValue, "base64").toString(
              "utf-8"
            );
            break;
          case "round":
            row[alter.field] = Math.round(fieldValue);
            break;
          case "ceil":
            row[alter.field] = Math.ceil(fieldValue);
            break;
          case "floor":
            row[alter.field] = Math.floor(fieldValue);
            break;
          case "extract_url_host": {
            if (!fieldValue || typeof fieldValue !== "string") break;
            try {
              const url = new URL(
                !fieldValue.match(/^http[s]?:\/\//)
                  ? "http://" + fieldValue
                  : fieldValue
              );
              row[alter.field] = url.hostname;
            } catch (err) {
              row[alter.field] = null;
            }
            break;
          }
          case "json_parse":
            try {
              row[alter.field] = JSON.parse(fieldValue);
            } catch (err) {
              row[alter.field] = null;
            }
            break;
          case "json_stringify":
            try {
              row[alter.field] = JSON.stringify(fieldValue);
            } catch (err) {
              row[alter.field] = null;
            }
            break;
          default:
            throw new Error(
              `Invalid alter statement: '${
                alter.func
              }' with parameters '${alter.parameters.join(", ")}'`
            );
        }
      });
    } catch (e) {
      throw new Error(
        `Invalid alter statement: '${
          alter.func
        }' with parameters '${alter.parameters.join(", ")}'`
      );
    }
  }
}
