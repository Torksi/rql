# Functions

Functions can be used to manipulate data in various ways. Below is a list of available functions along with their syntax and examples.

## add

The `add` function adds two numbers together.

### Syntax

```
add (<integer> | <string>, <integer> | <string>)
```

### Example

```
dataset = example
| alter my_number = add(1, 2)
| alter my_field_number = add(my_number, 2)
```

## base64_decode

The `base64_decode` function decodes a base64 encoded string.

### Syntax

```
base64_decode (<string>)
```

### Example

```
dataset = example
| alter message = base64_decode("SGVsbG8gV29ybGQh")
```

## base64_encode

The `base64_encode` function encodes a string into base64 format.

### Syntax

```
base64_encode (<string>)
```

### Example

```
dataset = example
| alter message = base64_encode("Hello World!")
```

## ceil

The `ceil` function rounds a number up to the nearest integer.

### Syntax

```
ceil (<integer> | <string>)
```

### Example

```
dataset = example
| alter my_number = ceil(1.2)
| alter my_field_number = ceil(my_number)
```

## coalesce

The `coalesce` function returns the first non-null value from a list of arguments.

### Syntax

```
coalesce (<value1>, <value2>, ...)
```

### Example

```
dataset = example
| alter username = coalesce(osActorPrimaryUsername, actorPrimaryUsername, causalityActorPrimaryUsername)
```

## distance

The `distance` function calculates the distance between two geographical points specified by their latitude and longitude. The result is returned in kilometers.

### Syntax

```
distance (<string> | <integer>, <string> | <integer>, <string> | <integer>, <string> | <integer>)
```

### Example

```
dataset = example | filter distance(lat, lon, 60.1695, 24.9354) < 100
```

## extract_url_host

The `extract_url_host` function extracts the hostname from an URL.

### Syntax

```
extract_url_host (<string>)
```

### Example

```
dataset = example
| alter host = extract_url_host("https://www.example.com/path/to/resource")
```

## floor

The `floor` function rounds a number down to the nearest integer.

### Syntax

```
floor (<integer> | <string>)
```

### Example

```
dataset = example
| alter my_number = floor(1.8)
| alter floored_field = floor(another_field)
```

## get

The `get` function retrieves a value from another field or a property of a field.

### Syntax

```
get (<string>)
```

### Example

```
dataset = example
| alter username = get(user.username)
```

## get_array

The `get_array` function retrieves a value from an array field. If negative index is used, it retrieves the value from the end of the array.

### Syntax

```
get_array (<string>, <integer>)
```

### Example

```
dataset = example
| alter third = get_array(my_array_field, 3)
| alter second_last = get_array(my_array_field, -2)
```

## incidr

The `incidr` function checks if a given IP address is within a specified CIDR range.

### Syntax

```
incidr (<string>, <string>)
```

### Example

```
dataset = example
| filter incidr(src_ip, 192.168.1.0/24)
```

## json_parse

The `json_parse` function parses a JSON string and returns the corresponding object.

### Syntax

```
json_parse (<string>)
```

### Example

```
dataset = example
| alter my_json = json_parse(field_with_json_string)
```

## json_stringify

The `json_stringify` function converts a JSON object into a JSON string.

### Syntax

```
json_stringify (<string>)
```

### Example

```
dataset = example
| alter my_json_string = json_stringify(json_field)
```

## length

The `length` function returns the length of a string or array.

### Syntax

```
length (<string>)
```

### Example

```
dataset = example
| alter my_string_length = length(my_string)
| alter my_array_length = length(my_array)
```

## lowercase

The `lowercase` function converts a string to lowercase.

### Syntax

```
lowercase (<string>)
```

### Example

```
dataset = example
| alter my_string_lowercase = lowercase(my_string)
```

## multiply

The `multiply` function multiplies two numbers together.

### Syntax

```
multiply (<integer> | <string>, <integer> | <string>)
```

### Example

```
dataset = example
| alter my_number = multiply(2, 3)
| alter my_field_number = multiply(my_number, 2)
```

## round

The `round` function rounds a number to the nearest integer.

### Syntax

```
round (<integer> | <string>)
```

### Example

```
dataset = example
| alter my_number = round(1.5)
| alter my_field_number = round(my_number)
```

## split

The `split` function splits a string into an array based on a specified delimiter. You can use `\,` to split by a comma.

### Syntax

```
split (<string>, <string>)
```

### Example

```
dataset = example
| alter my_array = split(my_string, "\,")
```

## substring

The `substring` function extracts a substring from a string based on specified start and end indices.

### Syntax

```
substring (<string>, <integer>, <integer>)
```

### Example

```
dataset = example
| alter my_substring = substring(my_string, 0, 5)
```

## subtract

The `subtract` function subtracts one number from another.

### Syntax

```
subtract (<integer> | <string>, <integer> | <string>)
```

### Example

```
dataset = example
| alter my_number = subtract(5, 2)
| alter my_field_number = subtract(my_number, 2)
```

## to_date

The `to_date` function converts a string into a date object.

### Syntax

```
to_date (<string>)
```

### Example

```
dataset = example
| alter my_date = to_date("2023-10-01")
```

## to_number

The `to_number` function converts a string into a number.

### Syntax

```
to_number (<string>)
```

### Example

```
dataset = example
| alter my_number = to_number("123.45")
```

## to_string

The `to_string` function converts an object into a string.

### Syntax

```
to_string (<string>)
```

### Example

```
dataset = example
| alter my_string = to_string(another_field)
```

## trim

The `trim` function removes leading and trailing whitespace from a string. If input is an array, it trims each element of the array.

### Syntax

```
trim (<string>)
```

### Example

```
dataset = example
| alter my_trimmed_string = trim(my_string)
| alter my_trimmed_array = trim(my_array)
```

## uppercase

The `uppercase` function converts a string to uppercase.

### Syntax

```
uppercase (<string>)
```

### Example

```
dataset = example
| alter my_string_uppercase = uppercase(my_string)
```
