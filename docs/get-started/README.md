# Get Started with RQL

RQL is a powerful query language that allows you to interact with your data in a flexible and efficient way. This guide will help you get started with RQL.

In this guide, you'll learn how to:

- [Count rows](#count-rows)
- [See a sample of data](#see-a-sample-of-data)
- [Select specific columns](#select-specific-columns)
- [List unique values](#list-unique-values)
- [Filter by condition](#filter-by-condition)
- [Filter by time range](#filter-by-time-range)
- [Sort results](#sort-results)
- [Get the top _n_ rows](#get-the-top-n-rows)

- Create calculated columns

## Count rows

In this example we'll count the number of unique source IP addresses in the `fw_logs` dataset.

```
dataset = fw_logs
| comp count src_ip as requests
```

Results of this query could look something like this:

| requests |
| -------- |
| 192245   |

## See a sample of data

To get a sense of the data in a dataset, you can use the `limit` statement. This statement will return the first _n_ rows of the dataset. This can be useful for quickly checking the structure and content of the data.

```
dataset = fw_logs
| limit 3
```

This query would return the first 3 rows of the `fw_logs` dataset. The output could look something like this:
| src_ip | dest_ip | dest_port | timestamp |
| ------ | ------- | --------- | --------- |
| 10.0.0.5 | 10.40.0.1 | 80 | 2023-10-01 12:00:00 |
| 10.0.0.1 | 1.1.1.1 | 53 | 2023-10-01 12:01:00 |
| 10.0.0.5 | 10.40.0.2 | 22 | 2023-10-01 12:02:00 |

## Select specific columns

To select specific columns from a dataset, you can use the `fields` statement. This allows you to focus on the data that is most relevant to your analysis.

```
dataset = fw_logs
| limit 3
| fields src_ip, dest_ip
```

This query would return only the `src_ip` and `dest_ip` columns from the `fw_logs` dataset. The output could look something like this:

| src_ip   | dest_ip   |
| -------- | --------- |
| 10.0.0.5 | 10.40.0.1 |
| 10.0.0.1 | 1.1.1.1   |
| 10.0.0.5 | 10.40.0.2 |

## List unique values

If you want to get a list of unique values from a specific column, you can use the `dedup` statement.

```
dataset = fw_logs
| dedup src_ip
| fields src_ip
```

By default it will return the first row for each unique value. If you want to return the first or last event, you can specify `by <field> <asc|desc>` at the end of the statement.

```
dataset = fw_logs
| dedup src_ip by timestamp desc
| fields src_ip
```

You could also combine multiple columns to get unique combinations of values.

```
dataset = fw_logs
| dedup src_ip, dest_ip
| fields src_ip, dest_ip
```

## Filter by condition

The `filter` statement allows you to filter rows of data based on a specific condition.

This query would return all rows where the `dest_ip` is in the IP range of `10.40.0.0/24` and the `dest_port` is not `80`.

```
dataset = fw_logs
| filter dest_ip incidr 10.40.0.0/24 and dest_port != 80
```

## Filter by time range

If you want to get data from the last 24 hours, you can relative time ranges.

```
dataset = fw_logs
| filter timestamp >= ago(24h)
```

Other similar time function include `now()` and `future()`. More information about time functions can be found in the [Functions](/functions/) page.

## Sort results

To sort the results of a query, you can use the `sort` statement. This allows you to order the data based on one or more columns.

This query would sort the `fw_logs` dataset by the `bytes` column in descending order.

```
dataset = fw_logs
| sort bytes desc
```

## Get the top _n_ rows

You can easily combine the `limit` statement with the `sort` statement to get the top _n_ rows of a dataset.

This query would return the top 5 rows of the `fw_logs` that had the most amount of data transferred.

```
dataset = fw_logs
| sort bytes desc
| limit 5
```
