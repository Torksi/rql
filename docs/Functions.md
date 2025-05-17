# Functions

## add

The `add` function adds two numbers together.

### Syntax

```
add (<number>, <number>)
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
ceil (<number>)
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
floor (<number>)
```

### Example

```
dataset = example
| alter my_number = floor(1.8)
```
