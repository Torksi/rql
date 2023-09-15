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
    | "greaterThan";
  value: string | number | boolean | Date;
}

export interface QuerySort {
  field: string;
  direction: "asc" | "desc";
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
  limit: number;
}
