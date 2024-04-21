import { Query, QueryStatement } from "../types";

export abstract class AbstractStatement {
  abstract parse(query: Query, statement: string): void;
  abstract execute(
    query: Query,
    statement: QueryStatement,
    data: any[]
  ): any[] | boolean | any;
}
