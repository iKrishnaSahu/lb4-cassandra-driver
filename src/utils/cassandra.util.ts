import {Filter} from '@loopback/repository';

export interface WhereClauseResult {
  query: string;
  params: unknown[];
}

export class CassandraUtils {
  /**
   * Builds a Cassandra CQL partial WHERE clause from a LoopBack Filter object.
   * Note: This currently only supports simple equality checks and handles non-indexed columns with ALLOW FILTERING.
   *
   * @param filter LoopBack Filter<T>
   * @returns An object containing the query fragment (e.g., " WHERE name = ? ALLOW FILTERING") and the params array.
   */
  static buildWhereClause<T extends object>(filter?: Filter<T>): WhereClauseResult {
    let queryFragment = '';
    const params: unknown[] = [];

    if (filter?.where) {
      const whereClauses: string[] = [];
      const where = filter.where;

      for (const key of Object.keys(where)) {
        // Skip logical operators which are not model properties
        if (key === 'and' || key === 'or') continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (where as any)[key];

        if (value !== undefined) {
          // Simple equality check for now
          whereClauses.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (whereClauses.length > 0) {
        queryFragment = ` WHERE ${whereClauses.join(' AND ')}`;
        // Allow filtering on non-indexed columns (use with caution in production)
        queryFragment += ' ALLOW FILTERING';
      }
    }

    return {query: queryFragment, params};
  }
}
