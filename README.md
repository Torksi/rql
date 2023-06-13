# RQL

`RQL` (Ruhis Query Language) is a powerful library designed to simplify the process of filtering, sorting, and aggregating large amounts of data. With RQL, you can effortlessly extract valuable insights from complex datasets, making data analysis and manipulation tasks more efficient.

## Key Features

- **Simple and intuitive syntax** - RQL is designed to be easy to learn and use. The syntax is similar to [KQL](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/) or [XQL](https://docs-cortex.paloaltonetworks.com/r/Cortex-XDR/Cortex-XDR-XQL-Language-Reference/Get-Started-with-XQL), but with a few key differences that make it more intuitive and powerful.
- **Light, type-safe, and dependency-free** - RQL is written in TypeScript and compiled to JavaScript. It has no dependencies and is very lightweight, making it easy to integrate into any project.

## Quick Start Guide

1. Install via your preferred package manager:
   - `npm install @ruhis/rql`
   - `yarn add @ruhis/rql`
2. Import `QueryParser` and `QueryExecutor` to your code:

   ```js
   import { QueryParser, QueryExecutor } from "@ruhis/rql";
   ```

3. Parse query and execute it against a dataset:

   ```js
   const query =
     'dataset = example_data | filter name = "John" or country = "Finland" | fields name, country, city, email | sort age desc | limit 10';
   const parsedQuery = QueryParser.parseQuery(query); // This will convert the query string into JS object
   const result = QueryExecutor.executeQuery(parsedQuery, dataset); // This will execute the query against the dataset
   ```

# Syntax Guide

The query consists of multiple statements separated by the pipe (`|`) character. The statements are case-sensitive, and must be written in lowercase. The order of the statements doesn't matter as they will automatically be executed in the following order:

1. `fields`
2. `alter`
3. `filter`
4. `sort`
5. `limit`
6. (`dataset`)

## dataset

### Syntax

`dataset = <string>`

### Description

The `dataset` statement is used to define the dataset that will be used in the query. This value isn't used by the library or validated, but can be used in the actual app to differentiate between multiple datasets (e.g. tables)

### Examples

```
dataset = audit_logs | filter user = "John" and date = "2021-08-15"
```

## fields

### Syntax

`fields <field1> [as <alias1>], <field2> [as <alias2>], ...`

### Description

The `fields` statement is used to select which fields will be included in the result. The fields can be renamed by using the `as` keyword.

### Examples

```
dataset = users
| filter user = "John"
| fields name, age, email, loginIp as ip
```

# License

This project is licensed under the GNU GPLv3 License - see the [LICENSE](LICENSE) file for details.
