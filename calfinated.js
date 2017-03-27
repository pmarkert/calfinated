var expressionParser = require("./expressionParser");
var pipeProcessor = require("./pipeProcessor");

function try_require(instance, module_name) {
	if (instance) {
		return instance;
	}
	if (typeof require === 'undefined') {
		throw new Error('This module requires ' + module_name);
	}
	return require(module_name);
}

module.exports = function (lodash, moment) {
	return new calfinated(lodash, moment);
};

function calfinated(lodash, moment) {
	this._ = try_require(lodash, "lodash");
	this.moment = try_require(moment, "moment");
	this.pipes = require("./pipes")(this._, this.moment);
	this.delimiters = ["<%", "%>"];
}

calfinated.prototype.add_pipes = function add_pipes(extra_pipes) {
	this._.assign(this.pipes, extra_pipes);
};

calfinated.prototype.process = function process(target, context, excluded_properties) {
	excluded_properties = excluded_properties || [];
	if (this._.isString(target)) {
		var token_matcher = new RegExp(this.delimiters[0] + "!?(.+?)" + this.delimiters[1], "g");
		var match = token_matcher.exec(target);
		if (match == null) {
			return target;
		}
		if (match[0].length === target.length) {
			return this._objectExpression(match[1], context);
		}
		else {
			return this._stringTemplate(match, target, context, token_matcher);
		}
	}
	else if (this._.isArray(target)) {
		return this._.map(target, i => this.process(i, context, excluded_properties));
	}
	else if (this._.isPlainObject(target) && !this._.isRegExp(target) && !this._.isFunction(target)) {
		return this._.mapValues(target, (value, key) => {
			return this._.includes(excluded_properties, key) ? value : this.process(value, context, excluded_properties);
		});
	}
	else {
		return target;
	}
};

calfinated.prototype.missingKeyError = function missingKeyError(token, tag, context, pipes, self) {
	throw new Error(`MissingKeyError for non-optional key: "${token}"`);
};

calfinated.prototype.pipeExecutionError = function pipeExecutionError(err, pipe, args) {
	throw new Error(`Error executing pipe: '${pipe}', args: '${args}', err: ${err}`);
};

calfinated.prototype.pipeNotFound = function pipeNotFound(pipe) {
	throw new Error(`Pipe not found: '${pipe}'`);
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
		if (groups.token === "") {
			return null;
		}
		if (!this._.has(context, groups.token)) {
			// Check to see if optional pipe is first. If not, raise an error
			if (!/^\|\s*optional(\W|$)/.test(groups.pipes)) {
				this.missingKeyError(groups.token, groups.tag, context, groups.pipes, this);
			}
		}
		return this._.get(context, groups.token);
	}
	else {
		return groups.token;
	}
};
