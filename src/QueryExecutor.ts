import { Client } from "@elastic/elasticsearch";
import { AlterStatement } from "./statement/AlterStatement";
import { DedupStatement } from "./statement/DedupStatement";
import { FieldsStatement } from "./statement/FieldsStatement";
import { FilterStatement } from "./statement/FilterStatement";
import { LimitStatement } from "./statement/LimitStatement";
import { SearchStatement } from "./statement/SearchStatement";
import { SortStatement } from "./statement/SortStatement";
import { Query, QueryFilterBlock, QueryStatement } from "./types";
import { CompStatement } from "./statement/CompStatement";
import { QueryFilterExpression as Expression } from "./types";

export class QueryExecutor {
  /**
   * Executes the provided query on the given data array.
   *
   * The data array consists of objects with key-value pairs representing the data.
   *
   * If any field or operator is not found in a row of data, an error will be thrown.
   *
   * @param {Query} query The query object containing fields, alters, filters, sort, and limit properties.
   * @param {Array} data The data to be queried, as an array of objects.
   * @returns {Array} The result of the query execution, as an array of objects.
   * @throws {Error} If any field in the query is not found in the data, or an invalid operator is used.
   * @public
   * @static
   */
  public static executeQuery(query: Query, data: any[]): any[] {
    let results = data;

    for (const statement of query.statements) {
      switch (statement.type) {
        case "dataset":
        case "config":
          // Do nothing as these statements are already handled in QueryParser
          break;
        case "filter":
          results = new FilterStatement().execute(query, statement, results);
          break;
        case "fields":
          results = new FieldsStatement().execute(query, statement, results);
          break;
        case "sort":
          results = new SortStatement().execute(query, statement, results);
          break;
        case "limit":
          results = new LimitStatement().execute(query, statement, results);
          break;
        case "dedup":
          results = new DedupStatement().execute(query, statement, results);
          break;
        case "alter":
          results = new AlterStatement().execute(query, statement, results);
          break;
        case "comp":
          results = new CompStatement().execute(query, statement, results);
          break;
        case "search":
          results = new SearchStatement().execute(query, statement, results);
          break;
        default:
          throw new Error(`Invalid statement type: '${statement.type}'`);
      }
    }

    return results;
  }

  private static buildElasticsearchExpression(expr: Expression): any {
    switch (expr.operator) {
      case "equals":
        return { term: { [expr.field]: expr.value } };
      case "notEquals":
        return {
          bool: { must_not: { term: { [expr.field]: expr.value } } },
        };
      case "greaterThan":
        return { range: { [expr.field]: { gt: expr.value } } };
      case "greaterThanOrEquals":
        return { range: { [expr.field]: { gte: expr.value } } };
      case "lessThan":
        return { range: { [expr.field]: { lt: expr.value } } };
      case "lessThanOrEquals":
        return { range: { [expr.field]: { lte: expr.value } } };
      case "contains":
        // This doesn't work the same way in Elastic as it would in JS query execution, should be fixed later?
        //return { wildcard: { [expr.field]: `*${expr.value}*` } };
        return null;
      case "notContains":
        // Same as above
        /*return {
          bool: {
            must_not: { wildcard: { [expr.field]: `*${expr.value}*` } },
          },
        };*/
        return null;
      case "matches":
        return { regexp: { [expr.field]: expr.value } };
      case "incidr":
        // CIDR queries need special handling in Elasticsearch
        return null;
      case "notIncidr":
        // Same as above
        return null;
      default:
        return null;
    }
  }

  private static buildElasticsearchFilter(statement: QueryStatement): any {
    if (statement.type !== "filter" || !statement.filter) return null;

    const filter = statement.filter;

    // Process all blocks (blocks are OR'ed together)
    const blockFilters = filter.blocks
      .map((block: QueryFilterBlock) => {
        const expressionFilters = block.expressions
          .map(this.buildElasticsearchExpression)
          .filter((f: any) => f !== null);

        if (expressionFilters.length === 0) return null;

        // Expressions within a block are AND'ed together
        return {
          bool: {
            must: expressionFilters,
          },
        };
      })
      .filter((f: any) => f !== null);

    if (blockFilters.length === 0) return null;

    // Multiple blocks are OR'ed together
    return blockFilters.length === 1
      ? blockFilters[0]
      : {
          bool: {
            should: blockFilters,
          },
        };
  }

  /**
   * WIP: Executes the provided query on the Elasticsearch client and index.
   *
   * The data array consists of objects with key-value pairs representing the data.
   *
   * If any field or operator is not found in a row of data, an error will be thrown.
   *
   * @deprecated This function is still under development.
   * @param {Query} query The query object containing fields, alters, filters, sort, and limit properties.
   * @param {Array} data The data to be queried, as an Elasticsearch response.
   * @returns {Array} The result of the query execution, as an array of objects.
   * @throws {Error} If any field in the query is not found in the data, or an invalid operator is used.
   * @public
   * @static
   */
  public static async executeElasticQuery(
    client: Client,
    index: string,
    query: Query
  ): Promise<any[]> {
    const body: any = {
      query: {
        bool: {
          must: [],
        },
      },
      size: 1000,
    };

    const elasticFilters: any[] = [];
    let i = 0;

    while (
      i < query.statements.length &&
      query.statements[i].type === "filter"
    ) {
      const elasticFilter = this.buildElasticsearchFilter(query.statements[i]);
      if (elasticFilter) {
        elasticFilters.push(elasticFilter);
        i++;
      } else {
        // If we find a filter we can't convert to elastic, stop processing filters
        break;
      }
    }

    // Remaining statements are everything after the last processed filter
    const remainingStatements = query.statements.slice(i);

    if (elasticFilters.length > 0) {
      body.query.bool.must = elasticFilters;
    }

    const allResults: any[] = [];
    let scrollId: string | undefined;

    try {
      let response = await client.search({
        index,
        scroll: "1m",
        ...body,
      });

      scrollId = response._scroll_id;
      allResults.push(...response.hits.hits);

      while (response.hits.hits.length) {
        response = await client.scroll({
          scroll_id: scrollId,
          scroll: "1m",
        });

        scrollId = response._scroll_id;
        allResults.push(...response.hits.hits);
      }
    } catch (err: any) {
      throw new Error(`Elasticsearch error: ${err.message}`);
    } finally {
      if (scrollId) {
        await client.clearScroll({ scroll_id: scrollId });
      }
    }

    const data = allResults.map((hit) => ({
      _id: hit._id,
      ...hit._source,
    }));

    const remainingQuery: Query = {
      ...query,
      statements: remainingStatements,
    };

    return this.executeQuery(remainingQuery, data);
  }
}
