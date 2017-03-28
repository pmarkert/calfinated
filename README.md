# calfinated
calfinated.js is a node module that provides string-based templating and token replacement.

The initial purpose is to replace the usage of the no longer maintained markup.js dependency
for use by hyperpotamus, but the utility has since expanded and is now available as a standalone module.

## Why the name?
Given the theme of hyperpotamus, a baby hippo is called a "calf".

## How does it work?
```
var calfinated = require('calfinated')();

var data = {
   name: "hippos"
   favorite: {
     drink: "coffee"
     color: "brown"
     special: "I like M&M's"
     number: 6294
     current_time: new Date("2017-01-01")
   }
};

calfinated.process("<% name %>", data); // "hippos"
calfinated.process("<% favorite.color %>", data); // "brown"
calfinated.process("<% name %> drink <% favorite.drink %>", data); // "hippos drink coffee"
calfinated.process("<% favorite.number %>", data); // 6294 (typed as number)
```

## Changing delimiters
You can even change the delimiters that calfinated uses if you don't like the `<% ... %>` syntax. The delimiters must be passed in as an array with the opening and closing values as a regular expression.
```javascript
var calfinated = require("calfinated")();
calfinated.delimiters = [ "{{", "}}" ];
```

## From the browser
calfinated can also be used in a browser, but requires lodash and moment-timezone as dependencies. In order to keep the size of the browser module small, references to both must be passed into the constructor. Lodash is required to function, however, if you do not plan to use any of the date/time manipulation pipes
then you can omit the moment-timezone reference.
```HTML
<html>
<head>
<script src="https://cdn.jsdelivr.net/lodash/4.17.4/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.11/moment-timezone-with-data.min.js"></script>
<script src="../browser/calfinated.min.js"></script>
</head>
<body>
</body>
<script language="javascript">
 window.onload = function() {
   var calfinated = require("calfinated")(_, moment); // pass instances of lodash and moment-timezone to calfinated.
   var result = calfinated.process({ a : "This is a <% whatisit %> at <% now | utc_format %>", b: "And another" }, { whatisit: "test", now: new Date() });
   document.write(JSON.stringify(result));
 }
</script>
</html>
```

## Processing objects and arrays
calfinated can also be used to process all values in an array or all values of an object recursively.
```javascript
calfinated.process([ "<% first %> expression", "<% second %>" ], { first: "foo", second: "bar" }); // [ "foo expression", "bar" ]
calfinated.process({ a: "<% first %> expression", b: "<% second %>", c: "untouched value" ], { first: "foo", second: "bar" }); // { a: "foo expression", b: "bar", c: "untouched value" }
```
A third parameter can be passed into to list excluded properties which will not be processed.

## Pipes
Plugable pipes that allow for powerful transformations of the data
```
calfinated.process("<% drink | upcase()" %>", data); // "COFFEE"
```

Pipes can be chained.

```
calfinated.process("<% drink | upcase | urlencode %>", data); // I%20LIKE%20M%26M'S
```

Some pipes support parameters
```
calfinated.process("<% current_time | date_format('MM/DD/YYYY') %>", data); // 01/01/2017
```

## Pipes reference
#### string
Converts the value to a string representation
```javascript
calfinated.process("<% age | string %>", { age: 18 }); // "18"
```

#### boolean
Parses the string values "true" or "false" as a boolean (case insensitive).
```javascript
calfinated.process("<% happy | boolean %>", { happy: "true" }); // true
```

#### integer
Parses the string value as an integer.
```javascript
calfinated.process("<% age | integer %>", { age: "18" }); // 18
```

#### number
Parses the string value as a number.
```javascript
calfinated.process("<% age | integer %>", { age: "18.3" }); // 18.3
```

#### json
Converts the value to the JSON equivalent as a string
```javascript
calfinated.process("<% element | json %>", { element: { symbol: "au", number: 79, weight: 196.966 }); // '{\n  "symbol": "au",\n  "number": 79,\n  "weight": 196.966\n}'
```

#### json_parse
Parses the string value into a JSON object
```javascript
calfinated.process("<% element | json %>", { au: '{\n  "symbol": "au",\n  "number": 79,\n  "weight": 196.966\n}' }); // { element: { symbol: "au", number: 79, weight: 196.966 }
```

#### is_null
Returns true if the value is null; otherwise false.
```javascript
calfinated.process("<% SSN | is_null %>", { SSN: null }); // true
```

#### is_empty
Returns true if the value is null, undefinecd, or an empty string; otherwise false.
```javascript
calfinated.process("<% SSN | is_empty %>", { ssn: "" }); // true
```

### String operations
#### toUpperCase [alias: upcase]
Converts a string to all uppercase characters.
```javascript
calfinated.process("<% name | toUpperCase %>", { name: "John Jingleheimer" }); // JOHN JINGLEHEIMER
```

#### toLowerCase [alias: downcase]
Converts a string to all lowercase characters.
```javascript
calfinated.process("<% name | toUpperCase %>", { name: "John Jingleheimer" }); // john jingleheimer
```

#### csv_safe
Escapes a string value to replace any double-quote(") characters to prefix them with a backslash (\). If the value has a comma, it will be surrounded by double-quotes.
```javascript
calfinated.process("<% field | csv_safe %>", { field: "candy, cookies, and popcorn" }); // '\"candy, cookies, and popcorn\"'
```

#### substr(start, length)
Extracts the specified portion of the string value starting at `start` and continuing for at most `length` characters.
```javascript
calfinated.process("<% field | substr(3,8) %>", { field: "candy, cookies, and popcorn" }); // "dy, cook"
```

#### substring(start, end)
Extracts the specified portion of the string value starting at `start` and ending at `end`.
```javascript
calfinated.process("<% field | substring(3,8) %>", { field: "candy, cookies, and popcorn" }); // "dy, c"
```

#### encodeURIComponent [alias: urlencode]
Encodes the specified string according to the URL percent-encoding specification.
```javascript
calfinated.process("<% field | encodeURIComponent %>", { field: "candy, cookies, and popcorn" }); // "candy%2C%20cookies%2C%20and%20popcorn"
```

#### decodeURIComponent [alias: urldecode]
Decodes the specified string according to the URL percent-encoding specification.
```javascript
calfinated.process("<% field | urldecode %>", { field: "candy%2C%20cookies%2C%20and%20popcorn" }); // "candy, cookies, and popcorn"
```

#### match(pattern/options, group)
Executes the specified RegExp `pattern` (with the specified "gim" `options`) to the value and returns the matched value. If `group` is specified, it should be the 1-based index of the capturing group to be returned.
```javascript
// Note, the double "\" because this is still a javascript string.
calfinated.process("<% field | match(/\\d+/) %>", { field: "This is my 35th attempt" }); // "35"
calfinated.process("<% field | match(/my (\\d+)th/) %>", { field: "This is my 35th attempt" }); // "my 35th"
calfinated.process("<% field | match(/my (\\d+)th/,1) %>", { field: "This is my 35th attempt" }); // "35"
```

#### replace(pattern/options, replacement)
Returns a new string with instances of the specified RegExp `pattern` (with the specified "gim" `options`) within the value replaced using the provided `replacement` value.
```javascript
calfinated.process("<% field | replace(/a/,A) %>", { field: "abc" }); // "Abc"
```

#### trim
Converts the value to a string, trimming any leading or trailing whitespace.
```javascript
calfinated.process("<% field | trim %>", { field: " field with lots of space  " }); // "field with lots of space"
```

### Array operations
#### join(delimiter)
Joins all elements in the value, which must be an array, into a string using the specified `delimiter`. If no delimiter is specified, the default delimiter is a comma (,) character. To join the values using an empty delimiter or whitespace, surround the delimiter with single or double-quotes.
```javascript
calfinated.process("<% fruit | join() %>", { fruit: [ "apples", "bananas", "cherries" ] }); // "apples,bananas,cherries"
calfinated.process("<% fruit | join('') %>", { fruit: [ "apples", "bananas", "cherries" ] }); // "applesbananascherries"
calfinated.process("<% fruit | join(' ') %>", { fruit: [ "apples", "bananas", "cherries" ] }); // "apples bananas cherries"
```

#### split
Splits a string value into an array of elements between each instance of `delimiter`.
```javascript
calfinated.process("<% fruit | split %>", { fruit: "apples,bananas,cherries" }); // [ "apples", "bananas", "cherries" ]
calfinated.process("<% fruit | split(' ') %>", { fruit: "apples bananas cherries" }); // [ "apples", "bananas", "cherries" ]
```

### Utility operations
#### optional(default_value)
If the value is undefined, returns default_value (or an empty string) instead of throwing a MissingKey error.
```javascript
calfinated.process("<% foo | optional %>", { fruit: "apples,bananas,cherries" }); // ""
calfinated.process("<% foo | optional('bar') %>", { fruit: "apples bananas cherries" }); // "bar"
```

#### not
Reverses the value of a boolean.
```javascript
calfinated.process("<% SSN | is_null | not %>", { SSN: null }); // false
```

#### random(min, max, asFloat)
Either selects a random element from an array value, (do not values for min, max, or asInteger)
```javascript
calfinated.process("<% fruit | random %>", { fruit: [ "apples", "bananas", "cherries" ] }); // one of "apples", "bananas", or "cherries"
```
Or when a value is specified for the `min` parameter, then the passed in pipeline value is ignored and it returns a random number in the range [ `min` , `max` ], or [ 0, `min` ] if `max` is not specified.

```javascript
calfinated.process("<% | random(1,6) %>"); // integer between 1 and 6
calfinated.process("<% | random(6) %>"); // integer between 0 and 6
```
NOTE: as shown here, if the `min` value is specified, then the pipeline value is ignored and can be omitted from the expression altogether.

### Mathematical operations
#### add(number) [alias: plus, sum]
Adds `number` to the value.
```javascript
calfinated.process("<% age | add(3) %>", { age: 18 }); // 21
```
Or calculates the sum of all of the elements in an array value. (The `number` parameter is ignored)
```javascript
calfinated.process("<% ages | add %>", { ages: [ 18, 21 ] }); // 39
```

#### subtract(number) [alias: minus, difference]
Subtracts `number` from the value.
```javascript
calfinated.process("<% age | subtract(3) %>", { age: 18 }); // 15
```
Or calculates the running difference all of the elements in an array value. (The `number` parameter is ignored)
```javascript
calfinated.process("<% ages | add %>", { ages: [ 18, 21, 3 ] }); // -6
```

#### multiplied_by(number) [alias: product, times]
Multiplies the value by a number.
```javascript
calfinated.process("<% age | multiplied_by(3) %>", { age: 6 }); // 18
```
Or calculates the product of all of the elements in an array value. (The `number` parameter is ignored)
```javascript
calfinated.process("<% ages | product %>", { ages: [ 2, 3, 5] }); // 30
```

#### divided_by, quotient: divided_by
Divides the value by a number.
```javascript
calfinated.process("<% age | divided_by(3) %>", { age: 6 }); // 2
```
Or calculates the running quotient of all of the elements in an array value. (The `number` parameter is ignored)
```javascript
calfinated.process("<% ages | product %>", { ages: [ 100, 10, 2] }); // 5
```

#### average
Calculates the average of all elements in the array.
```javascript
calfinated.process("<% ages | average %>", { ages: [ 15, 30, 42] }); // 29
```

### Date-time operations
#### now [alias: date_now]
Returns the current time, in the local timezone as a moment object.

#### today
Returns the start of the current day, in the local timezone as a moment object.

#### day
Returns the date only (start of day) of the given date/time.

#### date_parse(format, timezone) [alias: parse_date]
Parses the value as a moment using the optionally specified `format` string and `timezone`. Defaults to guessing the format and local timezone.

#### date_format(format, timezone) [alias: format_date]
Formats the provided date/moment value as a string using the specified format and timezone. Defaults to ISO-8601 format and local timezone.

#### utc_parse(format) [alias: parse_utc]
Parses the value as a moment using the optionally specified `format` string and UTC. Defaults to guessing the format.

#### utc_format [alias: format_utc]
Formats the provided date/moment value as a string using UTC. Defaults to ISO-8601 format.

#### date_add(count, interval)
Adds `count` `interval`s to the date value and returns the resulting date/moment. See [http://momentjs.com/docs/#/manipulating/add/](http://momentjs.com/docs/#/manipulating/add/) for valid interval values.

#### date_subtract
Subtracts `count` `interval`s from the date value and returns the resulting date/moment. See [http://momentjs.com/docs/#/manipulating/add/](http://momentjs.com/docs/#/manipulating/add/) for valid interval values.

#### start_of(interval)
Returns the start of the specified `interval` for the given date value. See [http://momentjs.com/docs/#/manipulating/start-of/](http://momentjs.com/docs/#/manipulating/start-of/) for valid interval values.

#### end_of(interval)
Returns the end of the specified `interval` for the given date value. See [http://momentjs.com/docs/#/manipulating/start-of/](http://momentjs.com/docs/#/manipulating/start-of/) for valid interval values.
