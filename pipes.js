module.exports = function (_, moment) {
	return {
		/* Data-type operations */
		string,
		boolean,
		integer,
		number,
		json,
		json_parse,
		is_null,
		is_empty,

		/* String operations */
		upcase, toUpperCase: upcase,
		downcase, toLowerCase: downcase,
		csv_safe,
		substr,
		substring,
		encodeURIComponent, urlencode: encodeURIComponent,
		decodeURIComponent, urldecode: decodeURIComponent,
		match,
		replace,
		trim,

		/* Array operations */
		join,
		split,

		/* Utility operations */
		optional,
		not,
		random,

		/* Mathematical operations */
		add, plus: add, sum: add,
		subtract, minus: subtract, difference: subtract,
		multiplied_by, product: multiplied_by, times: multiplied_by,
		divided_by, quotient: divided_by,
		average,

		/* Date-time operations */
		now, date_now: now,
		today,
		day,
		date_parse, parse_date: date_parse,
		date_format, format_date: date_format,
		utc_parse, parse_utc: utc_parse,
		utc_format, format_utc: utc_format,
		date_add,
		date_subtract,
		start_of,
		end_of
	};

	/* Data-type operations */
	function string(val) {
		return trim(String(val));
	}

	function boolean(val) {
		if (typeof(val) === "boolean") {
			return val;
		}
		if (val instanceof Boolean) {
			return val.valueOf();
		}
		if (_.isString(val)) {
			if (val.toLowerCase() === "true") {
				return true;
			}
			else if (val.toLowerCase() === "false") {
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
		}
		else {
			// If the delimiter is surrounded by single or double-quotes, then just use the contents
			delimiter = _.defaultTo(/^(['"])?(.*?)\1$/.exec(delimiter)[2], ',');
		}
		return value.join(delimiter);
	}

	function split(val, delimiter) {
		if (_.isNil(delimiter) || delimiter == "") {
			delimiter = ",";
		}
		else {
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
			}
			else {
				throw new Error("Could not parse value for format specifier, random - " + val);
			}
		}
		else if (_.isInteger(val)) {
			return _.random(val);
		}
		else {
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
		}
		else {
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
			}
			else {
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
