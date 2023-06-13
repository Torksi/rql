import {
  Query,
  QueryFilter,
  QueryFilterBlock,
  QueryFilterExpression,
} from "./types";

export class QueryParser {
  public static parseQuery(queryString: string): Query {
    const query: Query = {
      dataset: "",
      fields: [],
      filters: [],
      alters: [],
      sort: null,
      limit: 0,
    };

    const queryParts = queryString.split("|");
    for (const part of queryParts) {
      const statement = part.trim();
      if (statement.startsWith("dataset")) {
        query.dataset = statement.split("=")[1].trim();
      } else if (statement.startsWith("filter")) {
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
          if (stmtParts.length === 2) {
            const field = stmtParts[0];
            const direction = stmtParts[1].toLowerCase();

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
      } else if (statement.startsWith("alter")) {
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
          parameters: parameters.split(",").map((param) => param.trim()),
        });
      } else {
        throw new Error(`Invalid statement: '${statement}'`);
      }
    }

    if (!query.dataset) {
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
    const operators = ["=", "!=", "contains", "not contains", "<", ">"];

    // The operator capturing group now treats "not contains" as a single operator
    const match = expression.match(
      /("[^"]+"|\S+)\s*(=|!=|contains|"not contains"|<|>)\s*("[^"]+"|\S+)/i
    );
    if (!match) {
      throw new Error(`Invalid filter expression: '${expression}'`);
    }

    let field = match[1].replace(/"/g, "");
    let operator = match[2].replace(/"/g, "");
    if (field === "not") {
      field = expression.split(" ")[0].replace(/"/g, "");
      operator = `not ${operator}`;
    }
    const value = match[3].replace(/"/g, "");

    if (!operators.includes(operator)) {
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
