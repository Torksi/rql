import dynamicField from "../dynamicField";
import { Query, QueryStatement } from "../types";
import { AbstractStatement } from "./AbstractStatement";

export class DedupStatement extends AbstractStatement {
  execute(_query: Query, statement: QueryStatement, data: any[]): any[] {
    if (!statement.dedup) {
      throw new Error("Dedup statement must have dedup");
    }

    const { fields, sortBy, sortDirection } = statement.dedup;

    // TODO: Check if dedup fields are present in the dataset
    /*for (const field of fields) {
      if (
        query.fields &&
        query.fields.length > 0 &&
        query.fields.find(
          (f) =>
            (f.name === field && f.alias === undefined) ||
            (f.alias === field && f.alias !== undefined)
        ) === undefined
      ) {
        throw new Error(`Invalid dedup field: '${field}'`);
      }
    }*/

    const dedupedResults = new Map();

    for (const row of data) {
      const compositeKeyParts = fields.map((field) => {
        const fieldValue = dynamicField(field, row);
        return fieldValue !== null && fieldValue !== undefined
          ? fieldValue.toString()
          : "";
      });

      if (!compositeKeyParts.includes("")) {
        const compositeKey = compositeKeyParts.join("|");

        // Check if the record needs to be updated based on sortDirection
        if (!dedupedResults.has(compositeKey) || (sortBy && sortDirection)) {
          const existingRow = dedupedResults.get(compositeKey);
          if (
            !existingRow ||
            (sortDirection === "desc" &&
              dynamicField(sortBy || "", row) >
                dynamicField(sortBy || "", existingRow))
          ) {
            dedupedResults.set(compositeKey, row);
          }
        }
      }
    }

    data = Array.from(dedupedResults.values());

    return data;
  }

  parse(query: Query, statement: string) {
    statement = statement.substring(5).trim();
    const stmtParts = statement.split(" ");

    let fields = [];
    let sortBy = undefined;
    let sortDirection = undefined;

    // Find the position of 'by' if it exists
    const byIndex = stmtParts.indexOf("by");

    if (byIndex !== -1) {
      // Extract fields before 'by'
      fields = stmtParts
        .slice(0, byIndex)
        .map((field) => field.replace(/,$/, ""));

      // Validate and assign sortBy and sortDirection if they exist
      if (stmtParts.length > byIndex + 2) {
        sortBy = stmtParts[byIndex + 1];
        sortDirection = stmtParts[byIndex + 2].toLowerCase();

        if (sortDirection !== "asc" && sortDirection !== "desc") {
          throw new Error(`Invalid dedup direction: '${sortDirection}'`);
        }
      } else {
        throw new Error("sortBy and sortDirection expected after 'by'");
      }
    } else {
      // All parts are considered fields if 'by' is not present
      fields = stmtParts;
    }

    // Validate that fields are present
    if (fields.length === 0) {
      throw new Error("No fields specified for dedup");
    }

    fields = fields.map((f) => f.trim().replace(/,$/, ""));

    query.statements.push({
      type: "dedup",
      dedup: {
        fields,
        sortBy,
        sortDirection: sortDirection,
      },
    });
  }
}
