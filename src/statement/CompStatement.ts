import dynamicField from "../dynamicField";
import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";
import { ConfigStatement } from "./ConfigStatement";

export class CompStatement extends AbstractStatement {
  execute(query: Query, statement: QueryStatement, data: any[]): any[] {
    const groupedData: { [key: string]: any[] } = {};

    const { grouping } = new ConfigStatement().execute(query, statement, data);

    // Get grouping fields from new statement.groupingFields or old config grouping
    const groupingFields: string[] =
      statement.groupingFields || (grouping ? [grouping] : []);

    // Group data if grouping is defined
    if (groupingFields.length > 0) {
      for (const row of data) {
        // Create composite key from all grouping fields
        const keyParts: string[] = [];
        let hasNullValue = false;

        for (const field of groupingFields) {
          const value = dynamicField(field, row);
          if (value === null || value === undefined) {
            hasNullValue = true;
            break;
          }
          keyParts.push(String(value));
        }

        // Skip rows with null/undefined grouping values
        if (hasNullValue) {
          continue;
        }

        const groupKey = keyParts.join("|||");

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = [];
        }
        groupedData[groupKey].push(row);
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

      // Add grouping field values to result
      if (groupingFields.length > 0) {
        const keyParts = groupKey.split("|||");
        for (let i = 0; i < groupingFields.length; i++) {
          const fieldName = groupingFields[i].replace(/\./g, "_");
          statsRow[fieldName] = keyParts[i];
        }
      }

      for (const comp of compStatement) {
        if (!comp) {
          throw new Error("Comp statement must have comp");
        }

        // For count() without field, count all rows
        if (comp.function === "count" && !comp.field) {
          statsRow[comp.returnField] = groupData.length;
          continue;
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
                ...values.map((isoString) => new Date(isoString).getTime()),
              ),
            );
            break;
          case "latest":
            statsRow[comp.returnField] = new Date(
              Math.max(
                ...values.map((isoString) => new Date(isoString).getTime()),
              ),
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
                    (groupData as any[])[(groupData as any[]).length - 1],
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
    // First extract the 'by' clause if it exists
    // Handle both: "by field1, field2" and old syntax "by field as alias"
    let groupingFields: string[] = [];
    let statementWithoutBy = statement;
    let aliasSuffix = ""; // For old syntax: "by field as alias" where alias is for the comp result

    const byMatch = statement.match(/\s+by\s+(.+)$/i);

    if (byMatch) {
      const byClause = byMatch[1].trim();

      // Check if there's an "as alias" at the end (old syntax)
      const byWithAliasMatch = byClause.match(/^(.+?)\s+as\s+(\w+)$/i);
      if (byWithAliasMatch) {
        // Old syntax: "by source.ip as logins" means group by source.ip, alias count as logins
        groupingFields = [byWithAliasMatch[1].trim()];
        aliasSuffix = ` as ${byWithAliasMatch[2]}`;
        statementWithoutBy = statement.substring(0, statement.indexOf(" by "));
      } else {
        // New syntax: "by field1, field2" or "by field1"
        groupingFields = byClause.split(",").map((f) => f.trim());
        statementWithoutBy = statement.substring(0, statement.indexOf(" by "));
      }
    }

    // Now parse the comp functions
    const individualStatements = statementWithoutBy
      .split(",")
      .map((s) => s.trim());
    individualStatements[0] = individualStatements[0].substring(4).trim();

    const baseStatement: QueryStatement = {
      type: "comp",
      comp: [],
      groupingFields: groupingFields.length > 0 ? groupingFields : undefined,
    };

    for (let i = 0; i < individualStatements.length; i++) {
      let individualStatement = individualStatements[i];

      // For old syntax with "by field as alias", apply the alias to the first (and only) comp function
      if (i === 0 && aliasSuffix && !individualStatement.includes(" as ")) {
        individualStatement += aliasSuffix;
      }

      // Parse function call syntax: function(field) as alias
      // or old syntax: function field as alias
      const functionCallMatch = individualStatement.match(
        /^(\w+)\s*\(([^)]*)\)\s*(?:as\s+(\w+))?$/i,
      );

      if (functionCallMatch) {
        // New syntax: count() or count_distinct(username) as events
        const func = functionCallMatch[1].trim();
        const field = functionCallMatch[2].trim() || ""; // Empty string for count()
        const returnField =
          functionCallMatch[3] ||
          (field ? `${field}_${func}` : func).replace(/\./g, "_");

        baseStatement.comp!.push({
          function: func,
          field,
          returnField,
        });
      } else {
        // Old syntax: count username as userCount
        const parts = individualStatement.split(" ");
        if (parts.length < 1) {
          throw new Error(`Invalid comp statement: '${individualStatement}'`);
        }

        const func = parts[0].trim();
        let field = "";
        let returnField = "";

        // Check if there's a field after the function
        if (parts.length > 1 && parts[1] !== "as") {
          field = parts[1].trim();
        }

        // Look for 'as' keyword
        const asIndex = parts.indexOf("as");
        if (asIndex !== -1) {
          if (asIndex + 1 >= parts.length) {
            throw new Error(`Invalid comp statement: '${individualStatement}'`);
          }
          returnField = parts[asIndex + 1].trim();

          // Check if there are any unexpected tokens after 'as returnField'
          if (asIndex + 2 < parts.length) {
            throw new Error(`Invalid comp statement: '${individualStatement}'`);
          }
        } else {
          // No 'as' keyword - check if there are unexpected tokens
          if (parts.length > 2) {
            throw new Error(`Invalid comp statement: '${individualStatement}'`);
          }
        }

        if (!returnField) {
          returnField = field ? `${field}_${func}`.replace(/\./g, "_") : func;
        }

        baseStatement.comp!.push({
          function: func,
          field,
          returnField,
        });
      }
    }

    query.statements.push(baseStatement);
  }
}
