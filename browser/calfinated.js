require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

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

var pattern = rhy.anchored(rhy.zero_or_more(" ") + target_expression + rhy.zero_or_more(" ") + pipe_expression + rhy.zero_or_more(" "));

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

},{"./rhythmic":5}],2:[function(require,module,exports){
"use strict";

// Given an input string parsed
var rhy = require("./rhythmic");

var anything_but_pipe_or_quote = "[^\\|'\"`]*";
var params = function params(index) {
	return rhy.capture(rhy.zero_or_more(rhy.nonCapturingGroup(anything_but_pipe_or_quote + rhy.optional(rhy.quoted(".*?", index)))));
};
var parenthetical_params = rhy.nonCapturingGroup(rhy.parenthetical(params(2)));
var comma_params = rhy.nonCapturingGroup("," + params(5));
var pipe_params = rhy.choice_of(parenthetical_params, comma_params);
var pipe_expression = rhy.capture(rhy.identifier()) + rhy.optional_whitespace() + rhy.optional(rhy.nonCapturingGroup(pipe_params));
var pipe_symbol = "\\|";
var pattern = rhy.nonCapturingGroup(pipe_symbol + rhy.optional_whitespace() + pipe_expression + rhy.optional_whitespace());

module.exports = function (input) {
	var matcher = new RegExp(pattern, "g");
	var match = matcher.exec(input);
	var results = [];
	while (match != null) {
		results.push({
			pipe: match[1],
			args: (match[2] || match[4] || "").trim()
		});
		match = matcher.exec(input);
	}
	return results;
};

},{"./rhythmic":5}],3:[function(require,module,exports){
"use strict";

var pipe_matcher = require("./pipeParser");

module.exports = function (input, pipe_expression, calfinated) {
	if (pipe_expression == "") {
		return input;
	}
	var pipe_fragments = pipe_matcher(pipe_expression);
	for (var i = 0; i < pipe_fragments.length; i++) {
		var pipe_command = pipe_fragments[i];
		var pipe_function = calfinated.pipes[pipe_command.pipe];
		if (!pipe_function) {
			calfinated.pipeNotFound(pipe_command.pipe, pipe_command.args);
		} else {
			try {
				input = pipe_function.apply(calfinated, [input].concat(pipe_command.args.split(",").map(function (a) {
					return a.trim();
				})));
			} catch (err) {
				calfinated.pipeExecutionError(err, pipe_command.pipe, pipe_command.args);
			}
		}
	}
	return input;
};

},{"./pipeParser":2}],4:[function(require,module,exports){
"use strict";

module.exports = function (_, moment) {
	return {
		/* Data-type operations */
		string: string,
		boolean: boolean,
		integer: integer,
		number: number,
		json: json,
		json_parse: json_parse,
		is_null: is_null,
		is_empty: is_empty,

		/* String operations */
		upcase: upcase, toUpperCase: upcase,
		downcase: downcase, toLowerCase: downcase,
		csv_safe: csv_safe,
		substr: substr,
		substring: substring,
		encodeURIComponent: encodeURIComponent, urlencode: encodeURIComponent,
		decodeURIComponent: decodeURIComponent, urldecode: decodeURIComponent,
		match: match,
		replace: replace,
		trim: trim,

		/* Array operations */
		join: join,
		split: split,

		/* Utility operations */
		optional: optional,
		not: not,
		random: random,

		/* Mathematical operations */
		add: add, plus: add, sum: add,
		subtract: subtract, minus: subtract, difference: subtract,
		multiplied_by: multiplied_by, product: multiplied_by, times: multiplied_by,
		divided_by: divided_by, quotient: divided_by,
		average: average,

		/* Date-time operations */
		now: now, date_now: now,
		today: today,
		day: day,
		date_parse: date_parse, parse_date: date_parse,
		date_format: date_format, format_date: date_format,
		utc_parse: utc_parse, parse_utc: utc_parse,
		utc_format: utc_format, format_utc: utc_format,
		date_add: date_add,
		date_subtract: date_subtract,
		start_of: start_of,
		end_of: end_of
	};

	/* Data-type operations */
	function string(val) {
		return trim(String(val));
	}

	function boolean(val) {
		if (typeof val === "boolean") {
			return val;
		}
		if (val instanceof Boolean) {
			return val.valueOf();
		}
		if (_.isString(val)) {
			if (val.toLowerCase() === "true") {
				return true;
			} else if (val.toLowerCase() === "false") {
				return false;
			}
		}
		throw new Error("Value could not be parsed as boolean - " + val);
	}

	function integer(val) {
		return _.parseInt(val);
	}

	function number(val) {
		return _.toNumber(val);
	}

	function json(val) {
		return JSON.stringify(val, null, 2);
	}

	function json_parse(val) {
		return JSON.parse(val);
	}

	function is_null(val) {
		return val === null;
	}

	function is_empty(value) {
		return _.isNil(value) || !_.isString(value) || value.trim() == "";
	}

	/* String operations */
	function upcase(value) {
		return String(value).toUpperCase();
	}

	function downcase(value) {
		return String(value).toLowerCase();
	}

	function csv_safe(val) {
		val = String(val).split('"').join('\"');
		if (val.indexOf(",") >= 0) {
			val = '"' + val + '"';
		}
		return val;
	}

	function substr(val, start, length) {
		return val.substr(_.toNumber(start), _.toNumber(length));
	}

	function substring(val, start, end) {
		return val.substring(_.toNumber(start), _.toNumber(end));
	}

	function match(val, pattern, group) {
		debugger;
		var result = _extract_regex(pattern).exec(val);
		return result[parseInt(group || 0)];
	}

	function replace(val, pattern, replacement) {
		return val.replace(_extract_regex(pattern), replacement);
	}

	function trim(value) {
		return String(value).trim();
	}

	/* Array operations */
	function join(value, delimiter) {
		if (_.isNil(delimiter) || delimiter == "") {
			delimiter = ",";
		} else {
			// If the delimiter is surrounded by single or double-quotes, then just use the contents
			delimiter = _.defaultTo(/^(['"])?(.*?)\1$/.exec(delimiter)[2], ',');
		}
		return value.join(delimiter);
	}

	function split(val, delimiter) {
		if (_.isNil(delimiter) || delimiter == "") {
			delimiter = ",";
		} else {
			// If the delimiter is surrounded by single or double-quotes, then just use the contents
			delimiter = _.defaultTo(/^(['"])?(.*?)\1$/.exec(delimiter)[2], ',');
		}
		return String(val).split(delimiter);
	}

	/* Utility operations */
	function optional(val, replacement) {
		return _.isNil(val) ? replacement : val;
	}

	function not(val) {
		return !boolean(val);
	}

	function random(val, min, max, asFloat) {
		if (!is_empty(min)) {
			// If we have parameter values, use those and ignore the pipeline value
			if (_.isNil(max)) {
				max = min;
				min = 0;
			}

			var minValue = _.parseInt(min);
			if (_.isNaN(minValue)) {
				throw new Error("Unable to parse value for min as integer: '" + min + "'");
			}
			var maxValue = _.parseInt(max);
			if (_.isNaN(maxValue)) {
				throw new Error("Unable to parse value for max as integer: '" + max + "'");
			}
			var asFloating = boolean(optional(asFloat, false));
			return _.random(minValue, maxValue, asFloating);
		}
		// Otherwise, let's use the passed in value
		else if (_.isString(val)) {
				var re = /^\s*(?:(\d+)\s*-\s*)?(\d+)\s*$/;
				var matches = re.exec(trim(val));
				if (matches) {
					min = _.parseInt(matches[1]);
					max = _.parseInt(matches[2]);
					return _.random(min, max);
				} else {
					throw new Error("Could not parse value for format specifier, random - " + val);
				}
			} else if (_.isInteger(val)) {
				return _.random(val);
			} else {
				return _.sample(val);
			}
	}

	/* Mathematical operations */
	function add(num, n) {
		if (_.isArray(num)) {
			return _.reduce(_.tail(num), function (sum, n) {
				return _.toNumber(sum) + _.toNumber(n);
			}, _.head(num));
		}
		return _.toNumber(num) + _.toNumber(n);
	}

	function subtract(num, n) {
		if (_.isArray(num)) {
			return _.reduce(_.tail(num), function (sum, n) {
				return _.toNumber(sum) - _.toNumber(n);
			}, _.head(num));
		}
		return _.toNumber(num) - _.toNumber(n);
	}

	function multiplied_by(num, n) {
		if (_.isArray(num)) {
			return _.reduce(_.tail(num), function (sum, n) {
				return _.toNumber(sum) * _.toNumber(n);
			}, _.head(num));
		}
		return _.toNumber(num) * _.toNumber(n);
	}

	function divided_by(num, n) {
		if (_.isArray(num)) {
			return _.reduce(_.tail(num), function (sum, n) {
				return _.toNumber(sum) / _.toNumber(n);
			}, _.head(num));
		}
		return _.toNumber(num) / _.toNumber(n);
	}

	function average(values) {
		if (!_.isArray(values)) {
			throw new Error("Value must be an array");
		}
		return _.reduce(values, function (sum, n) {
			return _.toNumber(sum) + _.toNumber(n);
		}, 0) / values.length;
	}

	/* Date functions */
	/* Use cases:
  1. Produce the current time
  a. <% | now %>
  b. <% | now,UTC %>
  c. <% | now,America/Los_Angeles %>
  2. Produce the current date
  a. <% | day %>
  b. <% | now | day %>
  c. <% | today %>
  3. Parse a value as a date/time (including timezone offset)
  a. <% datefield | date_parse %> # Parse a date string, best-guess format, local timezone
  b. <% datefield | date_parse,YYYY-MM-DD %> # Parse a date string in the format
  c. <% datefield | date_parse,YYYY-MM-DD,America/Los_Angeles %> # Parse a date string in the format with the specified timezone
  d. <% datefield | date_parse,,UTC %> # Parse a string, best-guess format, with the specified timezone
  4. Add/Subtract from a date/time (or the current date)
  a. <% datevalue | date_add,3,months %>
  b. <% datevalue | date_subtract,1,days %>
  5. Format/Print a date/time
  a. <% datevalue | date_format %>
  b. <% datevalue | date_format,YYYY-MM-DD %>
  */

	function now(val, timezone) {
		return _get_parser(timezone)();
	}

	function today(val, timezone) {
		timezone = trim(timezone);
		return day(now(val, timezone));
	}

	function day(val, timezone) {
		return start_of(val, "day");
	}

	function date_parse(val, format, timezone) {
		timezone = trim(timezone);
		format = trim(format);
		return _get_parser(timezone)(val, format);
	}

	function date_format(val, format, timezone) {
		timezone = trim(timezone);
		format = trim(format);
		val = _coerce_date(val, timezone);
		if (!val.isValid()) {
			throw new Error("Could not convert object to date - " + val.toString());
		}
		if (!is_empty(timezone)) {
			val = val.tz(timezone);
		}
		return val.format(format);
	}

	function utc_parse(val, format) {
		format = trim(format);
		return date_parse(val, format, "UTC");
	}

	function utc_format(val, format) {
		format = trim(format);
		return date_format(val, format, "UTC");
	}

	function date_add(val, count, interval) {
		interval = trim(interval);
		return _coerce_date(val).clone().add(parseInt(count), interval);
	}

	function date_subtract(val, count, interval) {
		return date_add(val, _.toNumber(count) * -1, interval);
	}

	function start_of(val, period) {
		return _coerce_date(val).clone().startOf((period || "day").trim());
	}

	function end_of(val, period) {
		return _coerce_date(val).clone().endOf((period || "day").trim());
	}

	function _get_parser(timezone) {
		if (is_empty(timezone)) {
			return moment;
		} else {
			return _.partialRight(moment.tz, trim(timezone));
		}
	}

	function _coerce_date(val, timezone) {
		if (_.isNil(val)) {
			val = new Date();
		}
		if (val._isAMomentObject) {
			return val;
		}
		if (!(val instanceof Date)) {
			if (_.isString(val)) {
				val = trim(val);
			}
			if (val == "") {
				val = new Date();
			} else {
				val = new Date(val);
			}
		}
		var parser = _get_parser(timezone);
		return parser(val);
	}

	function _extract_regex(pattern) {
		var re_match = /^\/(.+?)\/([igmy]*)$/.exec(pattern);
		if (re_match) {
			return new RegExp(re_match[1], re_match[2]);
		}
		return new RegExp(pattern);
	}
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = {
	anchored: anchored,
	any_character_but: any_character_but,
	back_reference: back_reference,
	capture: capture,
	choice_of: choice_of,
	combine: combine,
	greedy: greedy,
	identifier: identifier,
	negative_assertion: negative_assertion,
	nonCapturingGroup: nonCapturingGroup,
	one_or_more: one_or_more,
	optional: optional,
	parenthetical: parenthetical,
	quoted: quoted,
	optional_whitespace: optional_whitespace,
	zero_or_more: zero_or_more
};

function quoted(content, index) {
	return nonCapturingGroup(capture("['\"`]") + content + back_reference(index));
}

function optional_whitespace() {
	return zero_or_more("\\s");
}

function identifier() {
	return one_or_more("\\w");
}

function capture(contained) {
	return "(" + contained + ")";
}

function nonCapturingGroup(contained) {
	return "(?:" + contained + ")";
}

function optional(contained) {
	return contained + "?";
}

function greedy(contained) {
	return contained + "?";
}

function parenthetical(contained) {
	return "\\(" + contained + "\\)";
}

function choice_of() {
	return Array.from(arguments).join("|");
}

function one_or_more(contained) {
	return contained + "+";
}

function zero_or_more(contained) {
	return contained + "*";
}

function combine() {
	return Array.from(arguments).join("");
}

function any_character_but(chars) {
	return "[^" + chars + "]";
}

function anchored(content) {
	return "^" + content + "$";
}

function negative_assertion(content) {
	return "(?!" + content + ")";
}

function back_reference(index) {
	return "\\" + index;
}

},{}],"calfinated":[function(require,module,exports){
"use strict";

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
	var _this = this;

	excluded_properties = excluded_properties || [];
	if (this._.isString(target)) {
		var token_matcher = new RegExp(this.delimiters[0] + "!?(.+?)" + this.delimiters[1], "g");
		var match = token_matcher.exec(target);
		if (match == null) {
			return target;
		}
		if (match[0].length === target.length) {
			return this._objectExpression(match[1], context);
		} else {
			return this._stringTemplate(match, target, context, token_matcher);
		}
	} else if (this._.isArray(target)) {
		return this._.map(target, function (i) {
			return _this.process(i, context, excluded_properties);
		});
	} else if (this._.isPlainObject(target) && !this._.isRegExp(target) && !this._.isFunction(target)) {
		return this._.mapValues(target, function (value, key) {
			return _this._.includes(excluded_properties, key) ? value : _this.process(value, context, excluded_properties);
		});
	} else {
		return target;
	}
};

calfinated.prototype.missingKeyError = function missingKeyError(token, tag, context, pipes, self) {
	throw new Error("MissingKeyError for non-optional key: \"" + token + "\"");
};

calfinated.prototype.pipeExecutionError = function pipeExecutionError(err, pipe, args) {
	throw new Error("Error executing pipe: '" + pipe + "', args: '" + args + "', err: " + err);
};

calfinated.prototype.pipeNotFound = function pipeNotFound(pipe) {
	throw new Error("Pipe not found: '" + pipe + "'");
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
	} else {
		return groups.token;
	}
};

},{"./expressionParser":1,"./pipeProcessor":3,"./pipes":4}]},{},["calfinated"]);
