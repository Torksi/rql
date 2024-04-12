import { Client } from "@elastic/elasticsearch";
import { AlterStatement } from "./statement/AlterStatement";
import { CompStatement } from "./statement/CompStatement";
import { DedupStatement } from "./statement/DedupStatement";
import { FieldsStatement } from "./statement/FieldsStatement";
import { FilterStatement } from "./statement/FilterStatement";
import { LimitStatement } from "./statement/LimitStatement";
import { SearchStatement } from "./statement/SearchStatement";
import { SortStatement } from "./statement/SortStatement";
import { Query } from "./types";

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

    results = new AlterStatement().execute(query, results);
    results = new FieldsStatement().execute(query, results);
    results = new SearchStatement().execute(query, results);
    results = new FilterStatement().execute(query, results);
    results = new SortStatement().execute(query, results);
    results = new DedupStatement().execute(query, results);
    results = new LimitStatement().execute(query, results);
    results = new CompStatement().execute(query, results);

    return results;
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
    const body: any = {};

    // Fields
    if (query.fields && query.fields.length > 0) {
      body._source = query.fields.map((field) => field.name);
    }

    body.size = 1000;

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

    return this.executeQuery(query, data);
  }
}
