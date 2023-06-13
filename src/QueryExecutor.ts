import dynamicSort from "./dynamicSort";
import { Query, QueryAlter } from "./types";

export class QueryExecutor {
  private static executeAlter(alter: QueryAlter, data: any[]) {
    try {
      if (alter.func === "lowercase") {
        data.map((row) => {
          row[alter.field] = row[alter.parameters[0]].toLowerCase();
        });
      } else if (alter.func === "uppercase") {
        data.map((row) => {
          row[alter.field] = row[alter.parameters[0]].toUpperCase();
        });
      } else if (alter.func === "substring") {
        data.map((row) => {
          row[alter.field] = row[alter.parameters[0]].substring(
            Number(alter.parameters[1]),
            Number(alter.parameters[2])
          );
        });
      } else if (alter.func === "multiply") {
        if (!isNaN(Number(alter.parameters[1]))) {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] * Number(alter.parameters[1]);
          });
        } else {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] * Number(row[alter.parameters[1]]);
          });
        }
      } else if (alter.func === "add") {
        if (!isNaN(Number(alter.parameters[1]))) {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] + Number(alter.parameters[1]);
          });
        } else {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] + Number(row[alter.parameters[1]]);
          });
        }
      } else if (alter.func === "subtract") {
        if (!isNaN(Number(alter.parameters[1]))) {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] - Number(alter.parameters[1]);
          });
        } else {
          data.map((row) => {
            row[alter.field] =
              row[alter.parameters[0]] - Number(row[alter.parameters[1]]);
          });
        }
      } else {
        throw new Error(
          `Invalid alter statement: '${
            alter.func
          }' with parameters '${alter.parameters.join(", ")}'`
        );
      }
    } catch (e) {
      throw new Error(
        `Invalid alter statement: '${
          alter.func
        }' with parameters '${alter.parameters.join(", ")}'`
      );
    }
  }

  public static executeQuery(query: Query, data: any[]): any[] {
    let results = data;

    // Fields
    if (query.fields && query.fields.length > 0) {
      results = results.map((row) => {
        const result: any = {};
        for (const field of query.fields) {
          const { name, alias } = field;
          result[alias || name] = row[name];
        }
        return result;
      });
    }

    // Alter
    if (query.alters && query.alters.length > 0) {
      for (const alter of query.alters) {
        this.executeAlter(alter, results);
      }
    }

    // Filter
    if (query.filters && query.filters.length > 0) {
      results = results.filter((row) => {
        for (const filter of query.filters) {
          let filterResult = true;
          for (const block of filter.blocks) {
            let blockResult = false;
            for (const expression of block.expressions) {
              const { field, operator, value } = expression;
              const rowValue = row[field];

              if (Object.keys(row).indexOf(field) === -1) {
                throw new Error(`Invalid field: '${field}'`);
              }

              switch (operator) {
                case "equals":
                  blockResult = rowValue === value;
                  break;
                case "notEquals":
                  blockResult = rowValue !== value;
                  break;
                case "contains":
                  blockResult = rowValue.includes(value);
                  break;
                case "notContains":
                  blockResult = !rowValue.includes(value);
                  break;
                case "lessThan":
                  blockResult = rowValue < value;
                  break;
                case "greaterThan":
                  blockResult = rowValue > value;
                  break;
                default:
                  throw new Error(`Invalid operator: '${operator}'`);
              }
              if (!blockResult) {
                break;
              }
            }
            if (!blockResult) {
              filterResult = false;
              break;
            }
          }
          if (filterResult) {
            return true;
          }
        }
        return false;
      });
    }

    // Sort
    if (query.sort && query.sort !== null && query.sort.length > 0) {
      const sorts = query.sort.map((s) => {
        if (
          query.fields &&
          query.fields.length > 0 &&
          query.fields.find(
            (f) =>
              (f.name === s.field && f.alias === undefined) ||
              (f.alias === s.field && f.alias !== undefined)
          ) === undefined
        ) {
          throw new Error(`Invalid sort field: '${s.field}'`);
        }

        if (s.direction === "desc") {
          return `-${s.field}`;
        }
        return s.field;
      });
      results = results.sort(dynamicSort(sorts));
    }

    // Limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }
}
