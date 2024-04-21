import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class LimitStatement extends AbstractStatement {
  execute(_query: Query, statement: QueryStatement, data: any[]): any[] {
    if (statement.limit === undefined || statement.limit === null) {
      throw new Error("Limit statement must have limit");
    }

    data = data.slice(0, statement.limit);

    return data;
  }

  parse(query: Query, statement: string) {
    const parts = statement.split(" ");
    if (parts.length !== 2) {
      throw new Error(`Invalid limit statement: '${statement}'`);
    }

    const limit = Number(parts[1]);
    if (isNaN(limit)) {
      throw new Error(`Invalid limit statement: '${statement}'`);
    }

    query.statements.push({ type: "limit", limit });
  }
}
