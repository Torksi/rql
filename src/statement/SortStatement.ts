import dynamicSort from "../dynamicSort";
import { Query, QuerySort, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class SortStatement extends AbstractStatement {
  execute(_query: Query, statement: QueryStatement, data: any[]): any[] {
    if (!statement.sort) {
      throw new Error("Sort statement must have sort");
    }

    const sorts = statement.sort.map((s: QuerySort) => {
      // TODO: Check if sort fields are present in the dataset
      /*if (
        query.fields &&
        query.fields.length > 0 &&
        query.fields.find(
          (f) =>
            (f.name === s.field && f.alias === undefined) ||
            (f.alias === s.field && f.alias !== undefined)
        ) === undefined
      ) {
        throw new Error(`Invalid sort field: '${s.field}'`);
      }*/

      if (s.direction === "desc") {
        return `-${s.field}`;
      }
      return s.field;
    });
    data = data.sort(dynamicSort(sorts));

    return data;
  }

  parse(query: Query, statement: string) {
    let sorts = statement.split(",");
    sorts[0] = sorts[0].replace("sort", "").trim();
    sorts = sorts.map((s) => s.trim());

    const stat: QueryStatement = { type: "sort", sort: [] };
    for (const sort of sorts) {
      const stmtParts = sort.trim().split(" ");
      if (stmtParts.length === 1 || stmtParts.length === 2) {
        const field = stmtParts[0];
        const direction =
          stmtParts.length === 2 ? stmtParts[1].toLowerCase() : "asc";

        if (direction === "asc" || direction === "desc") {
          stat.sort!.push({
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

    query.statements.push(stat);
  }
}
