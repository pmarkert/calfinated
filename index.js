var _ = require("lodash");
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
	return _.get(context, groups.token);
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
		var addition = _.get(context, groups.token).toString();
		result += addition;
		last_pos = token_matcher.lastIndex;
		match = token_matcher.exec(input);
	}
	result += input.substring(last_pos);
	return result;
}
