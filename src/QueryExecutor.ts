import { AlterStatement } from "./statement/AlterStatement";
import { DedupStatement } from "./statement/DedupStatement";
import { FieldsStatement } from "./statement/FieldsStatement";
import { FilterStatement } from "./statement/FilterStatement";
import { LimitStatement } from "./statement/LimitStatement";
import { SearchStatement } from "./statement/SearchStatement";
import { SortStatement } from "./statement/SortStatement";
import { Query } from "./types";
import { CompStatement } from "./statement/CompStatement";

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

    for (const statement of query.statements) {
      switch (statement.type) {
        case "dataset":
        case "config":
          // Do nothing as these statements are already handled in QueryParser
          break;
        case "filter":
          results = new FilterStatement().execute(query, statement, results);
          break;
        case "fields":
          results = new FieldsStatement().execute(query, statement, results);
          break;
        case "sort":
          results = new SortStatement().execute(query, statement, results);
          break;
        case "limit":
          results = new LimitStatement().execute(query, statement, results);
          break;
        case "dedup":
          results = new DedupStatement().execute(query, statement, results);
          break;
        case "alter":
          results = new AlterStatement().execute(query, statement, results);
          break;
        case "comp":
          results = new CompStatement().execute(query, statement, results);
          break;
        case "search":
          results = new SearchStatement().execute(query, statement, results);
          break;
        default:
          throw new Error(`Invalid statement type: '${statement.type}'`);
      }
    }

    return results;
  }
}
