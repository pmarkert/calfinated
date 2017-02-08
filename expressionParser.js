/* Matches token fragments:

fragment = target | pipes
  target = literal | key
    literal = single, double, or backtick quoted string
    key = string (intended to be used as an object path into the context)
  
  pipes = pipe_name(arguments) | pipe_name,arguments
    pipe_name = function name identifier
    arguments = comma-delimited list of argument values

 */
var matcher = /^\s*([`"']?)(.+?)\1\s*(?:\|(.*?))?\s*$/;
var _ = require("lodash");

module.exports = function (input) {
	var result = matcher.exec(input);
	return _.isNil(result) ? null : {
		quote: result[1],
		token: result[2],
		pipes: result[3] || "" // because it is in an optional non-capturing group, it may be undefined so replace with ""
	};
};