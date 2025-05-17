import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";
import { ConfigStatement } from "./ConfigStatement";

export class SearchStatement extends AbstractStatement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(query: Query, statement: QueryStatement, data: any[]): any[] {
    const searchKey = statement.search;
    const { caseSensitive } = new ConfigStatement().execute(
      query,
      statement,
      data
    );

    if (!searchKey) {
      return data;
    }

    if (caseSensitive) {
      return data.filter((row) =>
        Object.values(row).some((value) =>
          typeof value === "string"
            ? value.includes(searchKey)
            : (value as any).toString().includes(searchKey)
        )
      );
    }

    return data.filter((row) =>
      Object.values(row).some((value) =>
        typeof value === "string"
          ? value.toLowerCase().includes(searchKey.toLowerCase())
          : (value as any).toString().includes(searchKey)
      )
    );
  }

  parse(query: Query, statement: string) {
    statement = statement.substring(6).trim();
    query.statements.push({
      type: "search",
      search: statement.replace(/^['"](.*)['"]$/, "$1"),
    });
  }
}
