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

## ago

The `ago` function returns a date that is a specified time in the past.

### Syntax

```
ago (<string>)
```

### Example

Retrieves records from the last 7 days.

```
dataset = example
| filter timestamp >= ago("7d")
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

## fnv1a

The `fnv1a` function computes the FNV-1a hash of a string. FNV-1a is a non-cryptographic hash function that is extremely fast to compute and has a very low collision rate. If possible, use `fnv1a` instead of `md5`, `sha1`, or `sha256` for hashing strings. It is particularly useful for hashing large datasets or when performance is a concern.

### Syntax

```
fnv1a (<string>)
```

### Example

```
dataset = example
| alter fnv1a_hash = fnv1a(my_string)
```

## future

The `future` function returns a date that is a specified time in the future.

### Syntax

```
future (<string>)
```

### Example

Retrieves records from the next 7 days.

```
dataset = example
| filter timestamp >= future("7d")
```

## geo_distance

The `geo_distance` function calculates the distance between two geographical points specified by their latitude and longitude. The result is returned in kilometers.

### Syntax

```
geo_distance (<string> | <integer>, <string> | <integer>, <string> | <integer>, <string> | <integer>)
```

### Example

Returns all records within 100 km of the specified latitude and longitude (60.1695, 24.9354).

```
dataset = example | filter geo_distance(lat, lon, 60.1695, 24.9354) < 100
```

## geo_in_polygon

The `geo_in_polygon` function checks if a geographical point specified by its latitude and longitude is within a given polygon. Polygons are defined using the [GeoJSON format](https://tools.ietf.org/html/rfc7946).

### Syntax

```
geo_in_polygon (<string> | <integer>, <string> | <integer>, <string>)
```

### Example

Returns all records where the geographical point (lat, lon) is within the specified polygon.

```
dataset = example | filter geo_in_polygon(lat, lon, '{"coordinates":[[[24.8708,60.1895],[24.8708,60.1340],[24.9963,60.1340],[24.9963,60.1895],[24.8708,60.1895]]],"type":"Polygon"}')
```

## get

The `get` function retrieves a value from another field or a property of a field.

### Syntax

```
get (<string>)
```

### Example

Retrieves the value of `user.username` and saves it to `username`.

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

Retrieves the third element and saves it to `third`, and the second last element and saves it to `second_last`.

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

## md5

The `md5` function computes the MD5 hash of a string.

### Syntax

```
md5 (<string>)
```

### Example

```
dataset = example
| alter md5_hash = md5(my_string)
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

## now

The `now` function returns the current date and time.

### Syntax

```
now ()
```

### Example

Retrieves records from the future.

```
dataset = example
| filter timestamp >= now()
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

## sha1

The `sha1` function computes the SHA-1 hash of a string.

### Syntax

```
sha1 (<string>)
```

### Example

```
dataset = example
| alter sha1_hash = sha1(my_string)
```

## sha256

The `sha256` function computes the SHA-256 hash of a string.

### Syntax

```
sha256 (<string>)
```

### Example

```
dataset = example
| alter sha256_hash = sha256(my_string)
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
