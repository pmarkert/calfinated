/* Matches token fragments:

fragment = target | pipes
  target = literal | key
    literal = single, double, or backtick quoted string
    key = string (intended to be used as an object path into the context)
  
  pipes = pipe_name(arguments) | pipe_name,arguments
    pipe_name = function name identifier
    arguments = comma-delimited list of argument values

 */

var rhy = require("./rhythmic");

var pipe_symbol = "\\|";
var pipe_expression = rhy.optional(rhy.capture(pipe_symbol + rhy.greedy(".*")));

var quote_char = "[`\"']";
var opening_quote_not_pipe = rhy.capture(rhy.negative_assertion(pipe_symbol) + rhy.optional(quote_char));
var target = rhy.capture(rhy.greedy(rhy.one_or_more(".")));
var closing_quote = rhy.back_reference(1);
var target_expression = rhy.optional(rhy.nonCapturingGroup(opening_quote_not_pipe + target + closing_quote));

var pattern = rhy.anchored(
	rhy.zero_or_more(" ") +
	target_expression +
	rhy.zero_or_more(" ") +
	pipe_expression +
	rhy.zero_or_more(" ")
);

var matcher = new RegExp(pattern);

module.exports = function (input) {
	var result = matcher.exec(input);
	return result == null ? null : {
		tag: result[0],
		quote: result[1] || "",
		token: result[2] || "",
		pipes: result[3] || "" // because it is in an optional non-capturing group, it may be undefined so replace with ""
	};
};
