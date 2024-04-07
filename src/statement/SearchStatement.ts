import { Query } from "../types";
import { AbstractStatement } from "./AbstractStatement";
import { ConfigStatement } from "./ConfigStatement";

export class SearchStatement extends AbstractStatement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(query: Query, data: any[]): any[] {
    const searchKey = query.search;
    const { caseSensitive } = new ConfigStatement().execute(query, data);

    if (!searchKey) {
      return data;
    }

    if (caseSensitive) {
      return data.filter((row) =>
        Object.values(row).some((value) =>
          typeof value === "string" ? value.includes(searchKey) : false
        )
      );
    }

    return data.filter((row) =>
      Object.values(row).some((value) =>
        typeof value === "string"
          ? value.toLowerCase().includes(searchKey.toLowerCase())
          : false
      )
    );
  }

  parse(query: Query, statement: string) {
    statement = statement.substring(6).trim();
    query.search = statement.replace(/^['"](.*)['"]$/, "$1");
  }
}
