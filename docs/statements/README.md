# Statements

## alter

### Syntax

`alter <name> = <function>`

### Description

The `alter` statement is used to create new or overwrite existing fields in the dataset using a value functions like addition, subtraction, letter casing, etc. The `alter` statement can be used multiple times in a query and the fields created by it can be used in other statements.

### Functions

Supported functions can be found in the documentation: [RQL Docs - Functions](https://rql.ruhis.fi/#/functions/)

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
