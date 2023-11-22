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

export interface QueryAlter {
  field: string;
  func: string;
  parameters: string[];
}

export interface Query {
  dataset: string;
  fields: QueryField[];
  filters: QueryFilter[];
  alters: QueryAlter[];
  sort: QuerySort[] | null;
  dedup: QueryDedup | null;
  limit: number;
}

export interface QueryParsingOptions {
  strictDataset: boolean;
}
