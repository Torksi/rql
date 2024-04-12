export interface QueryFilter {
  blocks: QueryFilterBlock[];
}

export interface QueryFilterBlock {
  expressions: QueryFilterExpression[];
}

export interface QueryFilterExpression {
  field: string;
  operator:
    | "equals"
    | "notEquals"
    | "matches"
    | "contains"
    | "notContains"
    | "lessThan"
    | "greaterThan"
    | "lessThanOrEquals"
    | "greaterThanOrEquals"
    | "incidr"
    | "notIncidr";
  value: string | number | boolean | Date;
}

export interface QuerySort {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryDedup {
  fields: string[];
  sortBy: string | undefined;
  sortDirection: "asc" | "desc" | undefined;
}

export interface QueryField {
  name: string;
  alias?: string;
}

export interface QueryComp {
  field: string;
  function: string;
  returnField: string;
}

export interface QueryAlter {
  field: string;
  func: string;
  parameters: string[];
}

export interface QueryConfig {
  key: string;
  value: string;
}

export interface Query {
  dataset: string;
  fields: QueryField[];
  filters: QueryFilter[];
  alters: QueryAlter[];
  sort: QuerySort[] | null;
  comp: QueryComp[];
  config: QueryConfig[];
  grouping: string | null;
  dedup: QueryDedup | null;
  search: string | null;
  limit: number;
  returnType: "records" | "stats";
}

export interface QueryParsingOptions {
  strictDataset: boolean;
}
