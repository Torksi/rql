import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";
import functionalField from "../functionalField";

export class AlterStatement extends AbstractStatement {
  execute(_query: Query, statement: QueryStatement, data: any[]) {
    if (!statement.alter) {
      throw new Error("Alter statement must have alters");
    }

    const alter = statement.alter;

    try {
      data.map((row) => {
        row[alter.field] = functionalField(
          alter.func + "(" + alter.rawParameters + ")",
          row
        );
      });
    } catch (e) {
      throw new Error(
        `Invalid alter statement: '${
          alter.func
        }' with parameters '${alter.parameters.join(", ")}'`
      );
    }

    return data;
  }

  parse(query: Query, statement: string) {
    const pattern =
      /^(?:alter)?\s*([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\((.*?)\)$/;
    const match = statement.match(pattern);

    if (!match) {
      throw new Error("Invalid expression format");
    }

    const [, variableName, functionName, parameters] = match;

    query.statements.push({
      type: "alter",
      alter: {
        field: variableName,
        func: functionName,
        parameters: parameters.split(/(?<!\\),/).map((param) => param.trim()),
        rawParameters: parameters,
      },
    });
  }
}
