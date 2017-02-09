var _ = require("lodash");
var expressionParser = require("./expressionParser");
var pipeProcessor = require("./pipeProcessor");
var default_pipes = require("./pipes/index");

module.exports = function () {
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

	if (match[0].length === input.length) {
		return this._objectExpression(match[1], context);
	}
	else {
		return this._stringTemplate(match, input, context, token_matcher);
	}
};

calfinated.prototype.missingKeyError = function missingKeyError(token, tag, context, pipes, self) {
	throw new Error(`MissingKeyError for non-optional key: "${token}"`);
};

calfinated.prototype.pipeExecutionError = function pipeExecutionError(err, pipe, args) {
	throw new Error(`Error executing pipe: '${pipe}', args: '${args}', err: ${err}`);
};

calfinated.prototype._passThrough = function passThrough(input) {
	return input;
};

calfinated.prototype._replaceBackticks = function replaceBackticks(expression, context) {
	var backtick_matcher = /`(.+?)`/g;
	var btmatch = backtick_matcher.exec(expression);
	if (btmatch != null) {
		expression = this._stringTemplate(btmatch, expression, context, backtick_matcher);
	}
	return expression;
};

calfinated.prototype._objectExpression = function objectExpression(expression, context) {
	expression = this._replaceBackticks(expression, context);
	var groups = expressionParser(expression);
	if (groups == null) {
		throw new Error("token contents did not match expected format");
	}
	return pipeProcessor(this._getExpressionResult(groups, context), groups.pipes, this);
};

calfinated.prototype._stringTemplate = function stringTemplate(match, input, context, matcher) {
	var result = "";
	var last_pos = 0;
	while (match != null) {
		result += input.substring(last_pos, match.index);
		var expression = this._replaceBackticks(match[1], context);
		var groups = expressionParser(expression);
		if (groups == null) {
			throw new Error("token contents did not match expected format");
		}
		result += pipeProcessor(this._getExpressionResult(groups, context), groups.pipes, this);
		last_pos = matcher.lastIndex;
		match = matcher.exec(input);
	}
	result += input.substring(last_pos);
	return result;
};

calfinated.prototype._getExpressionResult = function getExpressionResult(groups, context) {
	if (groups.quote === "") {
		if(!_.has(context, groups.token)) {
			// Check to see if optional pipe is first. If not, raise an error
			if(!/^\s*optional(\W|$)/.test(groups.pipes)) {
				this.missingKeyError(groups.token, groups.tag, context, groups.pipes, this);
			}
		}
		return _.get(context, groups.token);
	}
	else {
		return groups.token;
	}
}
