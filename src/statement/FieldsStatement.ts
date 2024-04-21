import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class FieldsStatement extends AbstractStatement {
  execute(_query: Query, statement: QueryStatement, data: any[]): any[] {
    data = data.map((row) => {
      if (!statement.fields) {
        throw new Error("Fields statement must have fields");
      }

      const result: any = {};
      for (const field of statement.fields) {
        const { name, alias } = field;
        result[alias || name] = row[name];
      }
      return result;
    });

    return data;
  }

  parse(query: Query, statement: string) {
    statement = statement.substring(6).trim();
    const fields = statement.split(",");
    const fieldsStat = fields.map((s) => {
      const [name, alias] = s.trim().split(/\s+as\s+/i);
      if (alias) {
        return { name, alias: alias || name };
      }
      return { name };
    });

    query.statements.push({ type: "fields", fields: fieldsStat });
  }
}
