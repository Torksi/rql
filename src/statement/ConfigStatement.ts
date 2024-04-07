import { Query } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class ConfigStatement extends AbstractStatement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(query: Query, _data: any[]): any {
    let caseSensitive = true;
    let grouping = null;
    if (query.config && query.config.length > 0) {
      for (const config of query.config) {
        if (config.key === "case_sensitive") {
          caseSensitive = config.value === "true";
        } else if (config.key === "grouping") {
          grouping = config.value;
          query.grouping = config.value;
        }
      }
    }

    return { caseSensitive, grouping };
  }

  parse(query: Query, statement: string) {
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
  }
}
