import { AlterStatement } from "./statement/AlterStatement";
import { CompStatement } from "./statement/CompStatement";
import { ConfigStatement } from "./statement/ConfigStatement";
import { DatasetStatement } from "./statement/DatasetStatement";
import { DedupStatement } from "./statement/DedupStatement";
import { FieldsStatement } from "./statement/FieldsStatement";
import { FilterStatement } from "./statement/FilterStatement";
import { LimitStatement } from "./statement/LimitStatement";
import { SearchStatement } from "./statement/SearchStatement";
import { SortStatement } from "./statement/SortStatement";
import { Query, QueryParsingOptions } from "./types";

export class QueryParser {
  /**
   * Parses the provided query string into a Query object.
   *
   * Example query string:
   * `dataset = myDataset | filter price > 100 | sort price desc, name asc | fields name, price as cost, description | limit 10`
   *
   * The returned Query object has properties matching the parsed elements of the query string. If any part of the query string cannot be parsed correctly, an error will be thrown.
   *
   * @param {string} queryString The query string to be parsed.
   * @param {QueryParsingOptions} options Options for parsing the query string.
   * @returns {Query} The parsed query as a Query object.
   * @throws {Error} If any part of the query string cannot be parsed, or if no dataset is specified.
   * @public
   * @static
   */
  public static parseQuery(
    queryString: string,
    options: QueryParsingOptions = { strictDataset: true }
  ): Query {
    const query: Query = {
      dataset: "",
      fields: [],
      filters: [],
      alters: [],
      comp: [],
      config: [],
      search: null,
      sort: null,
      dedup: null,
      limit: 0,
      grouping: null,
      returnType: "records",
    };

    // Remove comments from the query string
    const queryLines = queryString.split("\n");
    let constructedQuery = "";
    queryLines.map((l) => {
      if (l.startsWith("#") || l.startsWith("//")) {
        return;
      }
      constructedQuery += l;
    });

    const queryParts = constructedQuery.split("|");
    for (const part of queryParts) {
      const statement = part.trim();
      if (statement.startsWith("dataset")) {
        new DatasetStatement().parse(query, statement);
      } else if (statement.startsWith("filter")) {
        new FilterStatement().parse(query, statement);
      } else if (statement.startsWith("fields")) {
        new FieldsStatement().parse(query, statement);
      } else if (statement.startsWith("sort")) {
        new SortStatement().parse(query, statement);
      } else if (statement.startsWith("limit")) {
        new LimitStatement().parse(query, statement);
      } else if (statement.startsWith("dedup")) {
        new DedupStatement().parse(query, statement);
      } else if (statement.startsWith("alter")) {
        new AlterStatement().parse(query, statement);
      } else if (statement.startsWith("config")) {
        new ConfigStatement().parse(query, statement);
      } else if (statement.startsWith("comp")) {
        new CompStatement().parse(query, statement);
      } else if (statement.startsWith("search")) {
        new SearchStatement().parse(query, statement);
      } else {
        throw new Error(`Invalid statement: '${statement}'`);
      }
    }

    if (!query.dataset && options.strictDataset) {
      throw new Error("No dataset specified");
    }

    return query;
  }
}
