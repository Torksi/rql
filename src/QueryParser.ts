import {
  Query,
  QueryFilter,
  QueryFilterBlock,
  QueryFilterExpression,
  QueryParsingOptions,
} from "./types";

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
      returnType: "records",
    };

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
        if (statement.split("=").length !== 2) {
          throw new Error(`Invalid dataset statement: '${statement}'`);
        }
        query.dataset = statement.split("=")[1].trim();
      } else if (statement.startsWith("filter ")) {
        const filter = statement.substring(6).trim();
        const parsedFilter = this.parseFilter(filter);
        query.filters.push(parsedFilter);
      } else if (statement.startsWith("sort ")) {
        let sorts = statement.split(",");
        sorts[0] = sorts[0].replace("sort", "").trim();
        sorts = sorts.map((s) => s.trim());

        query.sort = [];
        for (const sort of sorts) {
          const stmtParts = sort.trim().split(" ");
          if (stmtParts.length === 1 || stmtParts.length === 2) {
            const field = stmtParts[0];
            const direction =
              stmtParts.length === 2 ? stmtParts[1].toLowerCase() : "asc";

            if (direction === "asc" || direction === "desc") {
              query.sort.push({
                field,
                direction,
              });
            } else {
              throw new Error(`Invalid sort direction: '${direction}'`);
            }
          } else {
            throw new Error(`Invalid sort statement: '${sort}'`);
          }
        }
      } else if (statement.startsWith("dedup ")) {
        const dedup = statement.replace("dedup", "").trim();
        const stmtParts = dedup.split(" ");

        let fields = [];
        let sortBy = undefined;
        let sortDirection = undefined;

        // Find the position of 'by' if it exists
        const byIndex = stmtParts.indexOf("by");

        if (byIndex !== -1) {
          // Extract fields before 'by'
          fields = stmtParts
            .slice(0, byIndex)
            .map((field) => field.replace(/,$/, ""));

          // Validate and assign sortBy and sortDirection if they exist
          if (stmtParts.length > byIndex + 2) {
            sortBy = stmtParts[byIndex + 1];
            sortDirection = stmtParts[byIndex + 2].toLowerCase();

            if (sortDirection !== "asc" && sortDirection !== "desc") {
              throw new Error(`Invalid dedup direction: '${sortDirection}'`);
            }
          } else {
            throw new Error("sortBy and sortDirection expected after 'by'");
          }
        } else {
          // All parts are considered fields if 'by' is not present
          fields = stmtParts;
        }

        // Validate that fields are present
        if (fields.length === 0) {
          throw new Error("No fields specified for dedup");
        }

        fields = fields.map((f) => f.trim().replace(/,$/, ""));

        query.dedup = {
          fields,
          sortBy,
          sortDirection: sortDirection,
        };
      } else if (statement.startsWith("fields ")) {
        const fields = statement.split(",");
        fields[0] = fields[0].replace("fields", "").trim();
        query.fields = fields.map((s) => {
          const [name, alias] = s.trim().split(/\s+as\s+/i);
          if (alias) {
            return { name, alias: alias || name };
          }
          return { name };
        });
      } else if (statement.startsWith("limit")) {
        const parts = statement.split(" ");
        if (parts.length !== 2) {
          throw new Error(`Invalid limit statement: '${statement}'`);
        }

        const limit = Number(parts[1]);
        if (isNaN(limit)) {
          throw new Error(`Invalid limit statement: '${statement}'`);
        }

        query.limit = limit;
      } else if (statement.startsWith("alter ")) {
        const pattern =
          /^(?:alter)?\s*([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\((.*?)\)$/;
        const match = statement.match(pattern);

        if (!match) {
          throw new Error("Invalid expression format");
        }

        const [, variableName, functionName, parameters] = match;

        query.alters.push({
          field: variableName,
          func: functionName,
          parameters: parameters.split(/(?<!\\),/).map((param) => param.trim()),
        });
      } else if (statement.startsWith("comp ")) {
        const parts = statement.split(" ");
        if (parts.length !== 5) {
          throw new Error(`Invalid comp statement: '${statement}'`);
        }

        const func = parts[1].trim();
        const field = parts[2].trim();
        const asField = parts[3].trim();
        const returnField = parts[4].trim();

        if (asField !== "as") {
          throw new Error(`Invalid comp statement: '${statement}'`);
        }

        query.comp.push({
          function: func,
          field,
          returnField,
        });

        query.returnType = "stats";
      } else if (statement.startsWith("config ")) {
        // | config case_sensitive = true
        const config = statement.substring(6).trim();
        const parts = config.match(
          /(['"][^'"]+['"]|\S+)\s*(=)\s*(['"][^'"]+['"]|\S+)/i
        );

        if (!parts) {
          throw new Error(`Invalid config statement: '${statement}'`);
        }

        const key = parts[1].replace(/^['"]|['"]$/g, "");
        const value = parts[3].replace(/^['"]|['"]$/g, "");

        if (!key || !value) {
          throw new Error(`Invalid config statement: '${statement}'`);
        }

        query.config.push({
          key: key.trim(),
          value: value.trim(),
        });
      } else if (statement.startsWith("search ")) {
        const search = statement.substring(7).trim();
        query.search = { value: search };
      } else {
        throw new Error(`Invalid statement: '${statement}'`);
      }
    }

    if (!query.dataset && options.strictDataset) {
      throw new Error("No dataset specified");
    }

    return query;
  }

  private static parseFilter(filter: string): QueryFilter {
    const blocks = filter.split(" or ").map((s) => s.trim());
    const filters = blocks.map((b) => this.parseFilterBlock(b));
    return { blocks: filters };
  }

  private static parseFilterBlock(block: string): QueryFilterBlock {
    const expressions = block.split(" and ").map((s) => s.trim());
    const filters = expressions.map((e) => this.parseFilterExpression(e));
    return { expressions: filters };
  }

  private static parseFilterExpression(
    expression: string
  ): QueryFilterExpression {
    const operators = [
      "=",
      "!=",
      "~=",
      "matches",
      "contains",
      "not contains",
      "<",
      ">",
      "<=",
      ">=",
      "incidr",
      "not incidr",
    ];

    const match = expression.match(
      /(['"][^'"]+['"]|\S+)\s*(=|!=|~=|contains|matches|'not contains'|"not contains"|incidr|'not incidr'|"not incidr"|<=|>=|<|>)\s*(['"][^'"]+['"]|\S+)/i
    );
    if (!match) {
      throw new Error(`Invalid filter expression: '${expression}'`);
    }

    let field = match[1].replace(/['"]/g, "");
    let operator = match[2].replace(/['"]/g, "");

    if (field === "not") {
      field = expression.split(" ")[0].replace(/['"]/g, "");
      operator = `not ${operator}`;
    }
    const value = match[3].replace(/['"]/g, "");

    if (!operators.includes(operator)) {
      // This should never happen as the regex should catch this
      throw new Error(`Invalid filter expression: '${expression}'`);
    }

    switch (operator) {
      case "=":
        return {
          field,
          operator: "equals",
          value: this.parseFilterValue(value),
        };
      case "!=":
        return {
          field,
          operator: "notEquals",
          value: this.parseFilterValue(value),
        };
      case "~=":
      case "matches":
        return {
          field,
          operator: "matches",
          value: this.parseFilterValue(value),
        };
      case "contains":
        return {
          field,
          operator: "contains",
          value: this.parseFilterValue(value),
        };
      case "not contains":
        return {
          field,
          operator: "notContains",
          value: this.parseFilterValue(value),
        };
      case "<":
        return {
          field,
          operator: "lessThan",
          value: this.parseFilterValue(value),
        };
      case ">":
        return {
          field,
          operator: "greaterThan",
          value: this.parseFilterValue(value),
        };
      case "<=":
        return {
          field,
          operator: "lessThanOrEquals",
          value: this.parseFilterValue(value),
        };
      case ">=":
        return {
          field,
          operator: "greaterThanOrEquals",
          value: this.parseFilterValue(value),
        };
      case "incidr":
        return {
          field,
          operator: "incidr",
          value: this.parseFilterValue(value),
        };
      case "not incidr":
        return {
          field,
          operator: "notIncidr",
          value: this.parseFilterValue(value),
        };
      default:
        throw new Error(`Invalid filter expression: '${expression}'`);
    }
  }

  private static parseFilterValue(
    value: string
  ): string | boolean | number | Date {
    if (value === "true" || value === "false") {
      return value === "true";
    } else if (!isNaN(Number(value))) {
      return Number(value);
    } else if (value === "date()") {
      return new Date();
    } else {
      return value;
    }
  }
}
