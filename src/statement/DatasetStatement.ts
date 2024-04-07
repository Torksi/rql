import { Query } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class DatasetStatement extends AbstractStatement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(_query: Query, _data: any[]): boolean | any[] {
    throw new Error("Method not implemented.");
  }

  parse(query: Query, statement: string) {
    if (statement.split("=").length !== 2) {
      throw new Error(`Invalid dataset statement: '${statement}'`);
    }
    query.dataset = statement.split("=")[1].trim();
  }
}
