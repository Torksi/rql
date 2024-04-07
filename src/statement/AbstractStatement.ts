import { Query } from "../types";

export abstract class AbstractStatement {
  abstract parse(query: Query, statement: string): void;
  abstract execute(query: Query, data: any[]): any[] | boolean | any;
}
