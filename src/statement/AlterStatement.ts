import dynamicField from "../dynamicField";
import ipRangeCheck from "ip-range-check";
import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";
import functionalField from "../functionalField";

export class AlterStatement extends AbstractStatement {
  execute(_query: Query, statement: QueryStatement, data: any[]) {
    if (!statement.alter) {
      throw new Error("Alter statement must have alters");
    }

    const alter = statement.alter;

    const USE_FUNCTIONAL_FIELDS = true;

    try {
      data.map((row) => {
        const fieldValue = dynamicField(alter.parameters[0], row);

        if (USE_FUNCTIONAL_FIELDS) {
          row[alter.field] = functionalField(
            alter.func + "(" + alter.rawParameters + ")",
            row
          );
        } else {
          switch (alter.func) {
            case "lowercase":
              row[alter.field] = fieldValue.toLowerCase();
              break;
            case "uppercase":
              row[alter.field] = fieldValue.toUpperCase();
              break;
            case "substring":
              row[alter.field] = fieldValue.substring(
                isNaN(Number(alter.parameters[1]))
                  ? Number(dynamicField(alter.parameters[1], row))
                  : Number(alter.parameters[1]),
                isNaN(Number(alter.parameters[2]))
                  ? Number(dynamicField(alter.parameters[2], row))
                  : Number(alter.parameters[2])
              );
              break;
            case "multiply":
              row[alter.field] =
                fieldValue *
                (isNaN(Number(alter.parameters[1]))
                  ? Number(dynamicField(alter.parameters[1], row))
                  : Number(alter.parameters[1]));
              break;
            case "add":
              row[alter.field] =
                fieldValue +
                (isNaN(Number(alter.parameters[1]))
                  ? Number(dynamicField(alter.parameters[1], row))
                  : Number(alter.parameters[1]));
              break;
            case "subtract":
              row[alter.field] =
                fieldValue -
                (isNaN(Number(alter.parameters[1]))
                  ? Number(dynamicField(alter.parameters[1], row))
                  : Number(alter.parameters[1]));
              break;
            case "coalesce":
              for (const param of alter.parameters) {
                if (dynamicField(param, row) !== null) {
                  row[alter.field] = dynamicField(param, row);
                  break;
                }
              }
              if (row[alter.field] === undefined) {
                row[alter.field] = null;
              }
              break;
            case "incidr":
              row[alter.field] = ipRangeCheck(fieldValue, alter.parameters[1]);
              break;
            case "split":
              if (!fieldValue || typeof fieldValue !== "string") break;
              row[alter.field] = fieldValue.split(
                alter.parameters[1].replace("\\,", ",")
              );
              break;
            case "to_string":
              row[alter.field] = fieldValue.toString();
              break;
            case "to_date":
              row[alter.field] = new Date(fieldValue);
              break;
            case "to_number":
              row[alter.field] = Number(fieldValue);
              break;
            case "trim": {
              if (
                !fieldValue ||
                (typeof fieldValue !== "string" && !Array.isArray(fieldValue))
              ) {
                break;
              }
              if (Array.isArray(fieldValue)) {
                row[alter.field] = fieldValue.map((value) => value.trim());
              } else {
                row[alter.field] = fieldValue.trim();
              }
              break;
            }
            case "length": {
              if (
                !fieldValue ||
                (typeof fieldValue !== "string" && !Array.isArray(fieldValue))
              ) {
                break;
              }

              if (Array.isArray(fieldValue)) {
                row[alter.field] = fieldValue.length;
              } else {
                row[alter.field] = fieldValue.toString().length;
              }

              break;
            }
            case "get": {
              if (!fieldValue) {
                row[alter.field] = null;
                break;
              }
              row[alter.field] = fieldValue;
              break;
            }
            case "get_array": {
              if (!fieldValue || !Array.isArray(fieldValue)) {
                row[alter.field] = null;
                break;
              }

              if (alter.parameters[1] === "-1") {
                row[alter.field] = fieldValue[fieldValue.length - 1];
                break;
              }

              row[alter.field] = fieldValue[Number(alter.parameters[1])];
              break;
            }
            case "base64_encode":
              row[alter.field] = Buffer.from(fieldValue).toString("base64");
              break;
            case "base64_decode":
              row[alter.field] = Buffer.from(fieldValue, "base64").toString(
                "utf-8"
              );
              break;
            case "round":
              row[alter.field] = Math.round(fieldValue);
              break;
            case "ceil":
              row[alter.field] = Math.ceil(fieldValue);
              break;
            case "floor":
              row[alter.field] = Math.floor(fieldValue);
              break;
            case "extract_url_host": {
              if (!fieldValue || typeof fieldValue !== "string") break;
              try {
                const url = new URL(
                  !fieldValue.match(/^http[s]?:\/\//)
                    ? "http://" + fieldValue
                    : fieldValue
                );
                row[alter.field] = url.hostname;
              } catch (err) {
                row[alter.field] = null;
              }
              break;
            }
            case "json_parse":
              try {
                row[alter.field] = JSON.parse(fieldValue);
              } catch (err) {
                row[alter.field] = null;
              }
              break;
            case "json_stringify":
              try {
                row[alter.field] = JSON.stringify(fieldValue);
              } catch (err) {
                row[alter.field] = null;
              }
              break;
            default:
              throw new Error(
                `Invalid alter statement: '${
                  alter.func
                }' with parameters '${alter.parameters.join(", ")}'`
              );
          }
        }
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
