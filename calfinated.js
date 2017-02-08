var _ = require("lodash");
var expression_matcher = require("./expressionParser");
var pipe_handler = require("./pipeProcessor");
var default_pipes = require("./pipes/index");

module.exports = function() {
	return new calfinated();
};

function calfinated() {
	this.pipes = _.clone(default_pipes);
}

calfinated.prototype.add_pipes = function add_pipes(extra_pipes) {
	_.assign(this.pipes, extra_pipes);
};

calfinated.prototype.process = function process(input, context) {
	var token_matcher = /<%!?(.+?)%>/g;
	var match = token_matcher.exec(input);
	if (match == null) {
		return this._passThrough(input, context);
	}
	else if (match[0].length === input.length) {
		return this._objectExpression(match, context);
	}
	else {
		return this._stringTemplate(match, input, context, token_matcher);
	}
};

calfinated.prototype._passThrough = function passThrough(input) {
	return input;
};

calfinated.prototype._objectExpression = function objectExpression(match, context) {
	var groups = expression_matcher(match[1]);
	if (groups == null) {
		throw new Error("token contents did not match expected format");
	}
	return pipe_handler(getExpressionResult(groups, context), groups.pipes, this.pipes);
};

calfinated.prototype._stringTemplate = function stringTemplate(match, input, context, token_matcher) {
	var result = "";
	var last_pos = 0;
	while (match != null) {
		result += input.substring(last_pos, match.index);
		var groups = expression_matcher(match[1]);
		if (groups == null) {
			throw new Error("token contents did not match expected format");
		}
		result += pipe_handler(getExpressionResult(groups, context), groups.pipes, this.pipes);
		last_pos = token_matcher.lastIndex;
		match = token_matcher.exec(input);
	}
	result += input.substring(last_pos);
	return result;
};

function getExpressionResult(groups, context) {
	return groups.quote === "" ? _.get(context, groups.token) : groups.token;
}
