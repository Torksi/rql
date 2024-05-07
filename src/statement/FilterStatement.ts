import dynamicField from "../dynamicField";
import ipRangeCheck from "ip-range-check";
import {
  Query,
  QueryFilter,
  QueryFilterBlock,
  QueryFilterExpression,
  QueryStatement,
} from "../types";
import { AbstractStatement } from "./AbstractStatement";
import { ConfigStatement } from "./ConfigStatement";

export class FilterStatement extends AbstractStatement {
  execute(query: Query, statement: QueryStatement, data: any[]): any[] {
    const { caseSensitive } = new ConfigStatement().execute(
      query,
      statement,
      data
    );

    data = data.filter((row) => {
      let filterResult = false; // Assume filter fails for OR and AND logic until a passing block is found

      if (!statement.filter) {
        throw new Error("Filter statement is missing filter object");
      }

      for (const block of statement.filter.blocks) {
        let blockResult = true; // Assume block passes (AND logic) until a failing expression is found

        for (const expression of block.expressions) {
          const { field, operator } = expression;
          let { value } = expression;
          let rowValue = dynamicField(field, row);

          // If rowValue is null, the expression fails
          if (
            rowValue === null &&
            value.toString().toLowerCase() !== "null" &&
            value.toString().toLowerCase() !== "undefined"
          ) {
            blockResult = false;
            break; // Stop evaluating this block
          }

          const isoRegex =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

          if (typeof rowValue === "object" && rowValue instanceof Date) {
            if (
              typeof value === "string" &&
              new Date(value).toString() !== "Invalid Date"
            ) {
              value = new Date(value);
            }
          } else if (isoRegex.test(rowValue)) {
            rowValue = new Date(rowValue);
            if (
              typeof value === "string" &&
              new Date(value).toString() !== "Invalid Date"
            ) {
              value = new Date(value);
            }
          }

          // Relative date parsing
          const relativeDateRegex = /^(-)?(\d+)([dhms])/;
          const relativeDateMatch = value
            .toString()
            .trim()
            .match(relativeDateRegex);

          if (relativeDateMatch) {
            const now = new Date();
            const relativeDate = new Date(now);

            const sign = relativeDateMatch[1] === "-" ? -1 : 1;
            const dateVal = parseInt(relativeDateMatch[2], 10);
            const unit = relativeDateMatch[3];

            switch (unit) {
              case "d":
                relativeDate.setDate(relativeDate.getDate() + sign * dateVal);
                break;
              case "h":
                relativeDate.setHours(relativeDate.getHours() + sign * dateVal);
                break;
              case "m":
                relativeDate.setMinutes(
                  relativeDate.getMinutes() + sign * dateVal
                );
                break;
              case "s":
                relativeDate.setSeconds(
                  relativeDate.getSeconds() + sign * dateVal
                );
                break;
              default:
                // Won't happen as the regex pattern should catch this
                throw new Error(`Invalid relative date unit: '${unit}'`);
            }

            value = relativeDate;
          }

          operatorSwitch: switch (operator) {
            case "equals": {
              if (
                value.toString().toLowerCase() === "null" ||
                value.toString().toLowerCase() === "undefined"
              ) {
                blockResult = rowValue === null || rowValue === undefined;
                break operatorSwitch;
              }

              if (!caseSensitive) {
                blockResult =
                  rowValue === value ||
                  rowValue.toString().toLowerCase() ===
                    value.toString().toLowerCase();
                break;
              }

              blockResult =
                rowValue === value || rowValue.toString() === value.toString();
              break;
            }

            case "notEquals": {
              if (
                value.toString().toLowerCase() === "null" ||
                value.toString().toLowerCase() === "undefined"
              ) {
                blockResult = rowValue !== null && rowValue !== undefined;
                break operatorSwitch;
              }

              if (!caseSensitive) {
                blockResult =
                  rowValue !== value &&
                  rowValue.toString().toLowerCase() !==
                    value.toString().toLowerCase();
                break;
              }

              blockResult =
                rowValue !== value && rowValue.toString() !== value.toString();
              break;
            }
            case "contains":
              if (!caseSensitive) {
                blockResult =
                  rowValue.includes(value) ||
                  rowValue
                    .toString()
                    .toLowerCase()
                    .includes(value.toString().toLowerCase());
                break;
              }

              blockResult =
                rowValue.includes(value) ||
                rowValue.toString().includes(value.toString());
              break;
            case "notContains":
              if (!caseSensitive) {
                blockResult =
                  !rowValue.includes(value) &&
                  !rowValue
                    .toString()
                    .toLowerCase()
                    .includes(value.toString().toLowerCase());
                break;
              }

              blockResult =
                !rowValue.includes(value) ||
                !rowValue.toString().includes(value.toString());
              break;
            case "lessThan":
              blockResult = rowValue < value;
              break;
            case "greaterThan":
              blockResult = rowValue > value;
              break;
            case "lessThanOrEquals":
              blockResult = rowValue <= value;
              break;
            case "greaterThanOrEquals":
              blockResult = rowValue >= value;
              break;
            case "matches":
              // eslint-disable-next-line no-case-declarations
              try {
                const regex = new RegExp(value.toString());
                blockResult = regex.test(rowValue.toString());
              } catch (e) {
                throw new Error(`Invalid regex pattern: '${value}'`);
              }
              break;
            case "incidr":
              blockResult = ipRangeCheck(rowValue, value.toString());
              break;
            case "notIncidr":
              blockResult = !ipRangeCheck(rowValue, value.toString());
              break;
            default:
              // This should never happen as the validator should catch this
              throw new Error(`Invalid operator: '${operator}'`);
          }
          if (!blockResult) {
            break; // Stop evaluating this block as one expression has failed
          }
        }

        if (blockResult) {
          filterResult = true; // A block passed, so the filter passes for OR and AND logic
          break; // Stop evaluating other blocks in this filter
        }
      }

      return filterResult;
    });

    return data;
  }

  parse(query: Query, statement: string) {
    const filter = statement.substring(6).trim();
    const parsedFilter = this.parseFilter(filter);
    query.statements.push({ type: "filter", filter: parsedFilter });
  }

  parseFilter(filter: string): QueryFilter {
    const blocks = filter.split(" or ").map((s) => s.trim());
    const filters = blocks.map((b) => this.parseFilterBlock(b));
    return { blocks: filters };
  }

  parseFilterBlock(block: string): QueryFilterBlock {
    const expressions = block.split(" and ").map((s) => s.trim());
    const filters = expressions.map((e) => this.parseFilterExpression(e));
    return { expressions: filters };
  }

  parseFilterExpression(expression: string): QueryFilterExpression {
    const operators: string[] = [
      "matches",
      "not contains",
      "contains",
      "not incidr",
      "incidr",
      "~=",
      "!=",
      "<=",
      ">=",
      "<",
      ">",
      "=", // This should be last to avoid premature matching
    ];

    // Prepare an array to convert operator patterns into regex
    const operatorsRegexParts = operators
      .map((op: string) =>
        // Escape special regex characters and sort by length to prioritize matching longer operators first
        op.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
      )
      .sort((a: string, b: string) => b.length - a.length);

    // Combine them into a single regex, capturing the operator and the surrounding text
    const regex = new RegExp(
      `(.+?)\\s*(${operatorsRegexParts.join("|")})\\s*(.+)`
    );

    // Apply the regex to extract the field, operator, and value
    const match = expression.match(regex);
    if (!match) {
      throw new Error(`Invalid filter expression: '${expression}'`);
    }

    const field = match[1].trim();
    const operator = match[2].trim();
    const value = match[3].trim().replace(/^['"](.*)['"]$/, "$1");

    switch (operator) {
      case "=":
        return {
          field,
          operator: "equals",
          value: this.parseFilterValue(value),
        };
      case "!=":
        return {
          field,
          operator: "notEquals",
          value: this.parseFilterValue(value),
        };
      case "~=":
      case "matches":
        return {
          field,
          operator: "matches",
          value: this.parseFilterValue(value),
        };
      case "contains":
        return {
          field,
          operator: "contains",
          value: this.parseFilterValue(value),
        };
      case "not contains":
        return {
          field,
          operator: "notContains",
          value: this.parseFilterValue(value),
        };
      case "<":
        return {
          field,
          operator: "lessThan",
          value: this.parseFilterValue(value),
        };
      case ">":
        return {
          field,
          operator: "greaterThan",
          value: this.parseFilterValue(value),
        };
      case "<=":
        return {
          field,
          operator: "lessThanOrEquals",
          value: this.parseFilterValue(value),
        };
      case ">=":
        return {
          field,
          operator: "greaterThanOrEquals",
          value: this.parseFilterValue(value),
        };
      case "incidr":
        return {
          field,
          operator: "incidr",
          value: this.parseFilterValue(value),
        };
      case "not incidr":
        return {
          field,
          operator: "notIncidr",
          value: this.parseFilterValue(value),
        };
      default:
        throw new Error(`Invalid filter expression: '${expression}'`);
    }
  }

  parseFilterValue(value: string): string | boolean | number | Date {
    const v4 = new RegExp(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    );
    if (value.toString().match(v4)) {
      return value.toString();
    } else if (value === "true" || value === "false") {
      return value === "true";
    } else if (!isNaN(Number(value))) {
      return Number(value);
    } else if (value === "date()" || value === "now()") {
      return new Date();
    } else {
      return value;
    }
  }
}
