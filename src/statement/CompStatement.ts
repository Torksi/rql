import dynamicField from "../dynamicField";
import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";
import { ConfigStatement } from "./ConfigStatement";

export class CompStatement extends AbstractStatement {
  execute(query: Query, statement: QueryStatement, data: any[]): any[] {
    const groupedData: { [key: string]: any[] } = {};

    const { grouping } = new ConfigStatement().execute(query, statement, data);

    const groupingDefinedInComp = statement.comp?.some((c) => c.groupingField);
    const groupingFieldInComp = statement.comp
      ?.find((c) => c.groupingField)
      ?.groupingField?.toString();

    // Group data if grouping is defined
    if (grouping || groupingDefinedInComp) {
      for (const row of data) {
        const groupKey = dynamicField(
          grouping ? grouping : groupingFieldInComp,
          row
        );
        if (groupKey !== null && groupKey !== undefined) {
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = [];
          }
          groupedData[groupKey].push(row);
        }
      }
    } else {
      // Treat all data as a single group if no grouping is defined
      groupedData["_all"] = data;
    }

    const results: any[] = [];
    const compStatement = statement.comp;

    if (!compStatement) {
      throw new Error("Comp statement must have comp");
    }

    for (const [groupKey, groupData] of Object.entries(groupedData)) {
      const statsRow: { [key: string]: any } = {};

      if (grouping || groupingDefinedInComp) {
        const groupingFieldKey = grouping ? grouping : groupingFieldInComp;
        statsRow[groupingFieldKey.replace(/\./g, "_")] = groupKey;
      }

      for (const comp of compStatement) {
        if (!comp) {
          throw new Error("Comp statement must have comp");
        }

        const values: any[] = (groupData as any[])
          .map((row: any) => dynamicField(comp.field, row))
          .filter((value: any) => value !== null && value !== undefined);

        switch (comp.function) {
          case "count":
            statsRow[comp.returnField] = values.length;
            break;
          case "count_distinct":
            statsRow[comp.returnField] = new Set(values).size;
            break;
          case "min":
            statsRow[comp.returnField] = Math.min(...values);
            break;
          case "max":
            statsRow[comp.returnField] = Math.max(...values);
            break;
          case "avg":
            statsRow[comp.returnField] =
              values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case "sum":
            statsRow[comp.returnField] = values.reduce((a, b) => a + b, 0);
            break;
          case "median":
            values.sort((a, b) => a - b);
            // eslint-disable-next-line no-case-declarations
            const middle = Math.floor(values.length / 2);
            statsRow[comp.returnField] =
              values.length % 2 !== 0
                ? values[middle]
                : (values[middle - 1] + values[middle]) / 2;
            break;
          case "earliest":
            statsRow[comp.returnField] = new Date(
              Math.min(
                ...values.map((isoString) => new Date(isoString).getTime())
              )
            );
            break;
          case "latest":
            statsRow[comp.returnField] = new Date(
              Math.max(
                ...values.map((isoString) => new Date(isoString).getTime())
              )
            );
            break;
          case "first":
            statsRow[comp.returnField] =
              (groupData as any[]).length > 0
                ? dynamicField(comp.field, (groupData as any[])[0])
                : null;
            break;
          case "last":
            statsRow[comp.returnField] =
              (groupData as any[]).length > 0
                ? dynamicField(
                    comp.field,
                    (groupData as any[])[(groupData as any[]).length - 1]
                  )
                : null;
            break;
          case "to_array":
            statsRow[comp.returnField] = Array.from(new Set(values));
            break;
          default:
            throw new Error(`Invalid comp function: '${comp.function}'`);
        }
      }
      results.push(statsRow);
    }

    return results;
  }

  parse(query: Query, statement: string) {
    const individualStatements = statement.split(",").map((s) => s.trim());
    individualStatements[0] = individualStatements[0].substring(4).trim();

    const baseStatement: QueryStatement = {
      type: "comp",
      comp: [],
    };

    for (const individualStatement of individualStatements) {
      const parts = individualStatement.split(" ");
      if (parts.length < 2) {
        throw new Error(`Invalid comp statement: '${individualStatement}'`);
      }

      const func = parts[0].trim();
      const field = parts[1].trim();
      let returnField = "";
      let groupingField = "";

      for (let x = 2; x < parts.length; x++) {
        const part = parts[x].trim();
        if (part === "as") {
          const value = parts[x + 1];
          if (!value) {
            throw new Error(`Invalid comp statement: '${individualStatement}'`);
          }
          returnField = value.trim();
          x++;
        } else if (part === "by") {
          const value = parts[x + 1];
          if (!value) {
            throw new Error(`Invalid comp statement: '${individualStatement}'`);
          }
          groupingField = value.trim();
          x++;
        } else {
          throw new Error(`Invalid comp statement: '${individualStatement}'`);
        }
      }

      if (!returnField) {
        returnField = `${field}_${func}`.replace(/\./g, "_");
      }

      baseStatement.comp!.push({
        function: func,
        field,
        returnField,
        groupingField,
      });
    }

    query.statements.push(baseStatement);
  }
}
