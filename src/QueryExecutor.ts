/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamicSort from "./dynamicSort";
import ipRangeCheck from "ip-range-check";
import { Query, QueryAlter } from "./types";
import { Client } from "@elastic/elasticsearch";

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

    // Alter
    if (query.alters && query.alters.length > 0) {
      for (const alter of query.alters) {
        this.executeAlter(alter, results);
      }
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
              const fieldPath = field.split(".");
              let rowValue = row;

              // Evaluate the rowValue based on fieldPath
              for (const path of fieldPath) {
                if (!Object.prototype.hasOwnProperty.call(rowValue, path)) {
                  rowValue = null;
                  break;
                }
                rowValue = rowValue[path];
              }

              // If rowValue is null, the expression fails
              if (rowValue === null) {
                blockResult = false;
                break; // Stop evaluating this block
              }

              switch (operator) {
                case "equals":
                  blockResult =
                    rowValue === value ||
                    rowValue.toString() === value.toString();
                  break;
                case "notEquals":
                  blockResult =
                    rowValue !== value ||
                    rowValue.toString() !== value.toString();
                  break;
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

    // Limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
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

    // TODO: Implement all other statements here too, so that the whole query can be executed on Elasticsearch.

    body.size = 5000;

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
      if (alter.func === "lowercase") {
        data.map((row) => {
          row[alter.field] = row[alter.parameters[0]].toLowerCase();
        });
      } else if (alter.func === "uppercase") {
        data.map((row) => {
          row[alter.field] = row[alter.parameters[0]].toUpperCase();
        });
      } else if (alter.func === "substring") {
        data.map((row) => {
          row[alter.field] = row[alter.parameters[0]].substring(
            Number(alter.parameters[1]),
            Number(alter.parameters[2])
          );
        });
      } else if (alter.func === "multiply") {
        if (!isNaN(Number(alter.parameters[1]))) {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] * Number(alter.parameters[1]);
          });
        } else {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] * Number(row[alter.parameters[1]]);
          });
        }
      } else if (alter.func === "add") {
        if (!isNaN(Number(alter.parameters[1]))) {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] + Number(alter.parameters[1]);
          });
        } else {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] + Number(row[alter.parameters[1]]);
          });
        }
      } else if (alter.func === "subtract") {
        if (!isNaN(Number(alter.parameters[1]))) {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] - Number(alter.parameters[1]);
          });
        } else {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] - Number(row[alter.parameters[1]]);
          });
        }
      } else {
        throw new Error(
          `Invalid alter statement: '${
            alter.func
          }' with parameters '${alter.parameters.join(", ")}'`
        );
      }
    } catch (e) {
      throw new Error(
        `Invalid alter statement: '${
          alter.func
        }' with parameters '${alter.parameters.join(", ")}'`
      );
    }
  }
}
