import { Query } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class LimitStatement extends AbstractStatement {
  execute(query: Query, data: any[]): any[] {
    if (query.limit) {
      data = data.slice(0, query.limit);
    }

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

    query.limit = limit;
  }
}
