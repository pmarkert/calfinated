var _ = require("lodash");
var pipe_handler = require("./pipe_handler");
var expression_matcher = require("./expression_matcher");

module.exports = function() {
	return {
		process: function process(input, context) {
			var token_matcher = /<%(.+?)%>/g;
			var match = token_matcher.exec(input);
			if(match==null) { 
				return passThrough(input, context);
			}
			else if (match[0].length === input.length) {
				return objectExpression(match, context);
			}
			else {
				return stringTemplate(match, input, context, token_matcher);
			}
		}
	};
};

function passThrough(input) { 
	return input; 
}

function objectExpression(match, context) {
	var groups = expression_matcher(match[1]);
	if (groups == null) {
		throw new Error("token contents did not match expected format");
	}
	var result = _.get(context, groups.token);
	return pipe_handler.process(result, groups.pipes);
}

function stringTemplate(match, input, context, token_matcher) {
	var result = "";
	var last_pos = 0;
	while (match != null) {
		result += input.substring(last_pos, match.index);
		var groups = expression_matcher(match[1]);
		if (groups == null) {
			throw new Error("token contents did not match expected format");
		}
		var fragment = _.get(context, groups.token);
		var addition = pipe_handler.process(fragment, groups.pipes).toString();
		result += addition;
		last_pos = token_matcher.lastIndex;
		match = token_matcher.exec(input);
	}
	result += input.substring(last_pos);
	return result;
}
