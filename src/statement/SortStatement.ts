import dynamicSort from "../dynamicSort";
import { Query } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class SortStatement extends AbstractStatement {
  execute(query: Query, data: any[]): any[] {
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
      data = data.sort(dynamicSort(sorts));
    }

    return data;
  }

  parse(query: Query, statement: string) {
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
  }
}
