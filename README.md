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

## Operators

The following operators are supported in RQL:

| Operator     | Description                                             |
| ------------ | ------------------------------------------------------- |
| =, !=        | Equal, Not equal                                        |
| >, <         | Greater than, Less than                                 |
| >=, <=       | Greater than or equal, Less than or equal               |
| and          | Boolean AND                                             |
| or           | Boolean OR                                              |
| contains     | Returns true if the specified string is contained       |
| not contains | Returns true if the specified string is not contained   |
| matches, ~=  | Returns true if the regex pattern matches               |
| incidr       | Returns true if the IP address is in the CIDR range     |
| not incidr   | Returns true if the IP address is not in the CIDR range |

# Statements

## dataset

### Syntax

`dataset = <string>`

### Description

The `dataset` statement sets the context for the query by specifying the dataset to be processed. This statement is not processed by RQL itself but is intended for use in your application to allow differentiation between multiple datasets. This can be especially handy if your application deals with multiple data sources or tables, and you want to apply RQL operations to a specific one.

### Examples

```
dataset = transaction_logs | filter transactionID = "TX1001"
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

## alter

### Syntax

`alter <name> = <function>`

### Description

The `alter` statement is used to create new or overwrite existing fields in the dataset using a value functions like addition, subtraction, letter casing, etc. The `alter` statement can be used multiple times in a query and the fields created by it can be used in other statements.

### Functions

| Function  | Syntax                                   | Description                                        |
| --------- | ---------------------------------------- | -------------------------------------------------- |
| add       | `add(<field1>, <field2 OR number>)`      | Adds two values                                    |
| subtract  | `subtract(<field1>, <field2 OR number>)` | Subtracts values                                   |
| multiply  | `multiply(<field1>, <field2 OR number>)` | Multiplies values                                  |
| uppercase | `uppercase(<field>)`                     | Converts string to uppercase                       |
| lowercase | `lowercase(<field>)`                     | Converts string to lowercase                       |
| substring | `substring(<field>, <start>, <end>)`     | Extracts substring                                 |
| count     | `count(<distinct OR all>, <field>)`      | Counts the number of either distinct or all values |

### Examples

```
dataset = products
| filter ean = "6410405082657"
| alter price = multiply(cost, 1.2)
| fields ean, name, cost
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
| fields name, age, country, email
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

# Changelog

## 1.3.1 (2023-11-20)

- Fixed bug where OR operator was not working correctly in `filter` statement
- Added `QueryParsingOptions` to QueryParser
- Added option to disable dataset requirement via `strictDataset` option

## 1.3.0 (2023-11-03)

- Added support for `<=` and `>=` operators
- Added `incidr` and `not incidr` operators
- Added alias `~=` for `matches` operator
- Fixed bug where query couldn't contain multiple `filter` statements
- Improved test coverage for QueryExecutor
- Cleaned test code
- Updated dependencies

# Roadmap

- Support for `in` and `not in` operators
- More functions for `alter` statement

# License

This project is licensed under the GNU GPLv3 License - see the [LICENSE](LICENSE) file for details.
