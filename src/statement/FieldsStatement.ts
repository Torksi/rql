import { Query } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class FieldsStatement extends AbstractStatement {
  execute(query: Query, data: any[]): any[] {
    if (query.fields && query.fields.length > 0) {
      data = data.map((row) => {
        const result: any = {};
        for (const field of query.fields) {
          const { name, alias } = field;
          result[alias || name] = row[name];
        }
        return result;
      });
    }

    return data;
  }

  parse(query: Query, statement: string) {
    statement = statement.substring(6).trim();
    const fields = statement.split(",");
    query.fields = fields.map((s) => {
      const [name, alias] = s.trim().split(/\s+as\s+/i);
      if (alias) {
        return { name, alias: alias || name };
      }
      return { name };
    });
  }
}
