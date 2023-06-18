/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamicSort from "./dynamicSort";
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
        for (const filter of query.filters) {
          let filterResult = true;
          for (const block of filter.blocks) {
            let blockResult = false;
            for (const expression of block.expressions) {
              const { field, operator, value } = expression;
              const fieldPath = field.split(".");
              let rowValue = row;

              for (let i = 0; i < fieldPath.length; i += 1) {
                const path = fieldPath[i];

                if (!Object.prototype.hasOwnProperty.call(rowValue, path)) {
                  rowValue = null;
                  break;
                }

                // TODO: Fix this
                /*if (fieldPath.length === 1) {
                  if (!Object.prototype.hasOwnProperty.call(rowValue, path)) {
                    throw new Error(`Invalid field: '${field}'`);
                  }
                  rowValue = rowValue[path];
                  break;
                }

                if (i < fieldPath.length - 1) {
                  if (!Object.prototype.hasOwnProperty.call(rowValue, path)) {
                    rowValue = null;
                    break;
                  }
                  rowValue = rowValue[path];
                  continue;
                }

                if (!Object.prototype.hasOwnProperty.call(rowValue, path)) {
                  throw new Error(
                    `Invalid field: '${field}' ${path} ${i}:${
                      fieldPath.length - 1
                    }`
                  );
                }*/
                rowValue = rowValue[path];
              }

              if (rowValue === null) {
                break;
              }

              switch (operator) {
                case "equals":
                  blockResult = rowValue === value;
                  break;
                case "notEquals":
                  blockResult = rowValue !== value;
                  break;
                case "contains":
                  blockResult = rowValue.includes(value);
                  break;
                case "notContains":
                  blockResult = !rowValue.includes(value);
                  break;
                case "lessThan":
                  blockResult = rowValue < value;
                  break;
                case "greaterThan":
                  blockResult = rowValue > value;
                  break;
                default:
                  throw new Error(`Invalid operator: '${operator}'`);
              }
              if (!blockResult) {
                break;
              }
            }
            if (!blockResult) {
              filterResult = false;
              break;
            }
          }
          if (filterResult) {
            return true;
          }
        }
        return false;
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

    return this.executeQuery(query, data);
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
