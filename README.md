# RQL

`RQL` (Ruhis Query Language) is a powerful library designed to simplify the process of filtering, sorting, and aggregating large amounts of data. With RQL, you can effortlessly extract valuable insights from complex datasets, making data analysis and manipulation tasks more efficient. RQL was initially developed for an internal SIEM project, so it is well suited for security-related use cases, but it can be used for any type of data.

## Key Features

- **Simple and intuitive syntax** - RQL is designed to be easy to learn and use. The syntax is similar to [KQL](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/) or [XQL](https://docs-cortex.paloaltonetworks.com/r/Cortex-XDR/Cortex-XDR-XQL-Language-Reference/Get-Started-with-XQL), but with a few key differences that make it more intuitive and powerful.
- **Light, type-safe and developer friendly** - RQL is written in TypeScript and compiled to JavaScript. It is very lightweight and has a great documentation, making it easy to integrate into any project.
- **Thoroughly tested** - RQL has a comprehensive test suite with a very code coverage, ensuring that it works as expected in all scenarios.

## Quick Start Guide

1. Install via your preferred package manager:
   - `npm install @ruhisfi/rql`
   - `yarn add @ruhisfi/rql`
2. Import `QueryParser` and `QueryExecutor` to your code:

   ```js
   import { QueryParser, QueryExecutor } from "@ruhisfi/rql";
   ```

3. Parse query and execute it against a dataset:

   ```js
   const query =
     'dataset = example_data | filter name = "John" or country = "Finland" | fields name, country, city, email, age | sort age desc | limit 10';
   const parsedQuery = QueryParser.parseQuery(query); // This will validate the query and convert it into a JS object
   const result = QueryExecutor.executeQuery(parsedQuery, data); // This will execute the query against the dataset
   ```

## ElasticSearch integration (WIP)

RQL can be used to generate queries for ElasticSearch. The `QueryExecutor` class has built-in support for ElasticSearch, so you can execute RQL queries directly against an ElasticSearch index. Here's an example of how to use RQL with ElasticSearch:

1. Install the ElasticSearch client:
   - `npm install @elastic/elasticsearch`
   - `yarn add @elastic/elasticsearch`
2. Parse query and execute it against ElasticSearch

   ```js
   import { QueryParser, QueryExecutor } from "@ruhisfi/rql";

   const query =
     'dataset = example_data | filter name = "John" or country = "Finland" | fields name, country, city, email, age | sort age desc | limit 10';
   const parsedQuery = QueryParser.parseQuery(query); // This will validate the query and convert it into a JS object

   const result = QueryExecutor.executeElasticQuery(
     elasticSearchClient, // ElasticSearch Client from @elastic/elasticsearch
     "example_data", // ElasticSearch index
     parsedQuery //
   ).then((res) => {
     console.log(`Found ${res.length} results`);
     console.log(`Results:`, res);
   });
   ```

# Syntax Guide

The query consists of multiple statements separated by the pipe (`|`) character. The statements are case-sensitive, and must be written in lowercase. The query lines can be commented out with `#`. The statements are executed in the order they are written in the query.

## Operators

The following operators are supported in RQL:

| Operator     | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| =, !=        | Equal, Not equal                                                        |
| >, <         | Greater than, Less than                                                 |
| >=, <=       | Greater than or equal, Less than or equal                               |
| and          | Boolean AND                                                             |
| or           | Boolean OR                                                              |
| contains     | Returns true if the specified value is contained in string or array     |
| not contains | Returns true if the specified value is not contained in string or array |
| matches, ~=  | Returns true if the regex pattern matches                               |
| incidr       | Returns true if the IP address is in the CIDR range                     |
| not incidr   | Returns true if the IP address is not in the CIDR range                 |
| in           | Returns true if the value is in the specified list                      |
| not in       | Returns true if the value is not in the specified list                  |

# Statements

## alter

### Syntax

`alter <name> = <function>`

### Description

The `alter` statement is used to create new or overwrite existing fields in the dataset using a value functions like addition, subtraction, letter casing, etc. The `alter` statement can be used multiple times in a query and the fields created by it can be used in other statements.

### Functions

| Function         | Syntax                                   | Description                                       |
| ---------------- | ---------------------------------------- | ------------------------------------------------- |
| add              | `add(<field1>, <field2 OR number>)`      | Adds two values                                   |
| base64_decode    | `base64_decode(<field>)`                 | Decodes base64 string                             |
| base64_encode    | `base64_encode(<field>)`                 | Encodes string to base64                          |
| coalesce         | `coalesce(<field1>, <field2>, ...)`      | Returns first non-null value                      |
| ceil             | `ceil(<field>)`                          | Rounds value up to nearest integer                |
| extract_url_host | `extract_url_host(<field>)`              | Extracts host from URL                            |
| floor            | `floor(<field>)`                         | Rounds value down to nearest integer              |
| get              | `get(<field>)`                           | Gets value                                        |
| get_array        | `get_array(<field>, <index>)`            | Gets value from array                             |
| incidr           | `incidr(<field>, <cidr>)`                | Returns true if IP in CIDR                        |
| json_parse       | `json_parse(<field>)`                    | Parses JSON string                                |
| json_stringify   | `json_stringify(<field>)`                | Converts value to JSON string                     |
| length           | `length(<field>)`                        | Returns length of string                          |
| lowercase        | `lowercase(<field>)`                     | Converts string to lowercase                      |
| multiply         | `multiply(<field1>, <field2 OR number>)` | Multiplies values                                 |
| round            | `round(<field>)`                         | Rounds value to nearest integer                   |
| split            | `split(<field>, <delimiter>)`            | Splits string into array (`\,` to split on comma) |
| substring        | `substring(<field>, <start>, <end>)`     | Extracts substring                                |
| subtract         | `subtract(<field1>, <field2 OR number>)` | Subtracts values                                  |
| to_date          | `to_date(<field>)`                       | Converts value to date                            |
| to_string        | `to_string(<field>)`                     | Converts value to string                          |
| trim             | `trim(<field>)`                          | Trims whitespace from start and end               |
| uppercase        | `uppercase(<field>)`                     | Converts string to uppercase                      |

### Examples

```
dataset = products
| filter ean = "6410405082657"
| alter price = multiply(cost, 1.2)
| fields ean, name, cost
```

## comp

### Syntax

`comp <function> <field> as <returnField>`

### Description

The `comp` statement is used to calculate statistics for results. This function will override other returned records. If used multiple times, the statistics will be merged on one row.

### Functions

| Function       | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| avg            | Returns the average value of the field                        |
| count          | Returns the number of records where field is not null         |
| count_distinct | Returns the number of distinct values where field is not null |
| earliest       | Returns the earliest timestamp                                |
| first          | Returns the first value                                       |
| last           | Returns the last value                                        |
| latest         | Returns the latest timestamp                                  |
| max            | Returns the maximum value                                     |
| median         | Returns the median value                                      |
| min            | Returns the minimum value                                     |
| sum            | Returns the sum of values                                     |
| to_array       | Returns an array of values                                    |

### Examples

```
// Returns the total number of users, the number of distinct users and the first login time in the USA
dataset = logins
| filter country = "USA"
| comp count username as totalUsers, count_distinct username as distinctUsers, earliest _time as firstLogin

// Returns the amount of logins per country
dataset = logins
| config grouping = country
| comp count correlationId as logins
```

## config

### Syntax

`config <option> = <value>`

### Description

The `config` statement is used to set various options for the query execution. RQL comes with built-in options, but you can also add your own custom options for your application.

### Options

| Option         | Description                                                                     | Default |
| -------------- | ------------------------------------------------------------------------------- | ------- |
| case_sensitive | Determine whether values are evaluated as case sensitive in `filter` statements | true    |
| grouping       | Group results by a field in `comp` statement                                    | ''      |

### Examples

```
dataset = users
| config case_sensitive = false
| filter name contains "john"
```

## dataset

### Syntax

`dataset = <string>`

### Description

The `dataset` statement sets the context for the query by specifying the dataset to be processed. This statement is not processed by RQL itself but is intended for use in your application to allow differentiation between multiple datasets. This can be especially handy if your application deals with multiple data sources or tables, and you want to apply RQL operations to a specific one.

### Examples

```
dataset = transaction_logs | filter transactionID = "TX1001"
```

## dedup

### Syntax

`dedup <field1>[,<field2>, ...] by asc | desc <field>`

### Description

The `dedup` statement is used to remove duplicate records based on field(s). By default it returns the first record, but you can specify the direction of the dedup using the `asc` (ascending) or `desc` (descending) keywords and some other field, such as timestamp to return chronologically latest record.

### Examples

```
# Returns all the latest unique username + deviceName sign-in combinations
dataset = signInLogs
| filter location.country = "GB"
| dedup username, deviceName by _time desc
```

## fields

### Syntax

`fields <field1> [as <alias1>], <field2> [as <alias2>], ...`

### Description

The `fields` statement enables you to cherry-pick the fields you're interested in from your dataset. This becomes useful when dealing with data structures having multiple fields, and you want to limit the output to only a few specific ones. If you don't specify any fields, all fields will be returned.

You can optionally rename the fields in the output using the as keyword, providing an alias for the original field name.

### Examples

```
dataset = customer_records
| filter customerID = "CUST1001"
| fields firstName as Name, emailID as Email
```

## filter

### Syntax

`filter <field> = <value> [and|or] <field> = <value> ...`

### Description

The `filter` statement is used to limit the dataset to records that match the specified criteria. You can compare fields to values using logical operators, and you can combine multiple criteria using the `and` and `or` keywords. For a list of supported operators, see the [Operators](#operators) section.

### Examples

```
dataset = users
| filter age > 18 and email not contains "@gmail.com"
| filter country = "Canada" or country = "Spain"
| filter role in ("admin", "manager")
| fields name, age, country, email
```

## limit

### Syntax

`limit <number>`

### Description

The `limit` statement is used to limit the number of records returned in the result. This is useful for paging or returning a top N list.

### Examples

```
dataset = logins
| filter country = "USA"
| sort username desc
| limit 10
| fields country, username
```

## search

### Syntax

`search <query>`

### Description

The `search` statement is used to limit the dataset to records that match the specified query. This is useful for full-text search or searching for specific patterns in the data.
Compared to the `filter` statement, the `search` statement searches all fields in the dataset.

### Examples

```
// find all users with "john" in their name or email
dataset = users
| fields name, email
| search "john"
```

## sort

### Syntax

`sort <field> [asc|desc], <field> [asc|desc] ...`

### Description

The `sort` statement is used to order the results by one or more fields. You can specify the direction of the sort using the `asc` (ascending) or `desc` (descending) keywords. If no direction is specified, the data will not be sorted.

### Examples

```
dataset = users
| filter age > 18
| sort age desc, name asc
| fields name, age
```

# Changelog

## 3.2.0 (2025-03-10)

- Added support for `in` and `not in` operators in `filter` statement

## 3.1.8 (2025-01-17)

- Fixed small bug in ElasticSearch query execution

## 3.1.7 (2025-01-06)

- Optimized ElasticSearch query execution
  - Some dedup queries now use inner_hits to get the latest record, which improves performance especially in large datasets

## 3.1.6 (2025-01-06)

- Removed debug logging from ElasticSearch query execution

## 3.1.5 (2025-01-06)

- Optimized ElasticSearch query execution
  - Some filters are now converted to ElasticSearch compatible filters, which should improve performance especially in large datasets

## 3.1.4 (2024-11-30)

- Added `to_number` function to `alter` statement
- Improved test coverage

## 3.1.3 (2024-05-07)

- Fixed bug in not equals operator in `filter` statement

## 3.1.2 (2024-04-27)

- Fixed bug with inconsistent UUID filtering in `filter` statement

## 3.1.1 (2024-04-26)

- Fixed bug with inconsistent date types (string vs Date) in `filter` statement
  - Now all date values are converted to `Date` objects for consistency

## 3.1.0 (2024-04-26)

- Added support for relative date filtering in `filter` statement
  - Supported units: `s` (seconds), `m` (minutes), `h` (hours), `d` (days)
  - Example: `filter date > -1h`
- Added filter value alias `now()` for current date and time
  - Example: `filter date > now()`
- Improved date filtering consistency

## 3.0.0 (2024-04-21)

- Breaking change: Reworked query parsing and execution logic
  - Queries are now parsed in the order they are written in the query string, instead of being grouped by statement type
  - This might break existing queries that rely on the old fixed order of statements
  - This change makes the query execution more predictable and easier to understand and also allows chaining of statements in a more flexible way
  - Chaining multiple `comp` functions must be done on one statement seperated by commas instead of multiple `comp` statements
- Removed old deprecated `LegacyQueryExecutor` and `LegacyQueryParser` classes

## 2.0.1 (2024-04-12)

- Hotfix: Fixed exports of QueryParser and QueryExecutor

## 2.0.0 (2024-04-12)

- Added better functionality for `search` statement
- Added grouping option for `comp` statement via `config` statement
- Refactored codebase to improve maintainability and readability
- Deprecated old query execution and parsing logic and moved them to `LegacyQueryExecutor` and `LegacyQueryParser`

## 1.8.0 (2024-04-07)

- Added support for `search` statement

## 1.7.0 (2024-02-24)

- Added support for `config` statement
- Added case-sensitive option to `filter` statement via `config` statement
- Added support for single quotes in `filter` statement

## 1.6.3 (2024-02-10)

- Hotfix for ElasticSearch scroll API not working correctly

## 1.6.2 (2024-02-10)

- Changed ElasticSearch to use scroll API instead of search_after
- Re-enabled sorting for ElasticSearch queries

## 1.6.1 (2024-02-10)

- Disabled sorting for ElasticSearch queries to fix issue with Elastic pre-document sorting

## 1.6.0 (2024-02-10)

- Changed ElasticSearch to use search_after instead of hard coded body size

## 1.5.7 (2023-12-29)

- Changed size to 10k for ElasticSearch search

## 1.5.6 (2023-12-29)

- Removed ElasticSearch query limit, using default value instead

## 1.5.5 (2023-12-29)

- Added ElasticSearch sorting to prevent missing results in larger datasets
- Changed ElasticSearch body size from 10k to 20k

## 1.5.4 (2023-12-02)

- Added `to_string` function to `alter` statement
- Added `to_date` function to `alter` statement
- Added `get` function to `alter` statement
- Added `get_array` function to `alter` statement
- Added `base64_encode` and `base64_decode` functions to `alter` statement
- Added `round`, `ceil` and `floor` functions to `alter` statement
- Added `extract_url_host` function to `alter` statement
- Added `json_parse` and `json_stringify` function to `alter` statement
- Changed execution order of `alter` statement to be executed before `fields` statement
- Added support for dynamic fields in `substring` function
- Added support for line comments starting with `//`

## 1.5.3 (2023-12-02)

- Added `to_array` function to `comp` statement
- Added `trim` function to `alter` statement
- Added `split` function to `alter` statement
- Added `length` function to `alter` statement

## 1.5.2 (2023-12-02)

- Fixed a bug where `dedup` would not work correctly if the field was not present in the dataset
- Improved documentation

## 1.5.1 (2023-11-30)

- Added support for null values in `filter` statement

## 1.5.0 (2023-11-22)

- Added support for `comp` statement
  - Added support for `avg`, `count`, `count_distinct`, `earliest`, `first`, `last`, `latest`, `max`, `median`, `min`, `sum` functions

## 1.4.0 (2023-11-22)

- Added support for `dedup` statement
- Added support for line comments (starting a line with `#`)
- Added nested field support for `alter` statement
- Arithmetic `alter` functions now handle invalid fields as 0 instead of NaN
- Added `coalesce` function to `alter` statement
- Added `incidr` function to `alter` statement

## 1.3.2 (2023-11-21)

- Fixed a bug where nested field in `filter` statement was not working correctly if the field didn't exist

## 1.3.1 (2023-11-20)

- Fixed a bug where OR operator was not working correctly in `filter` statement
- Added `QueryParsingOptions` to QueryParser
- Added option to disable dataset requirement via `strictDataset` option

## 1.3.0 (2023-11-03)

- Added support for `<=` and `>=` operators
- Added `incidr` and `not incidr` operators
- Added alias `~=` for `matches` operator
- Fixed a bug where query couldn't contain multiple `filter` statements
- Improved test coverage for QueryExecutor
- Cleaned test code
- Updated dependencies

# License

This project is licensed under the GNU GPLv3 License - see the [LICENSE](LICENSE) file for details.
