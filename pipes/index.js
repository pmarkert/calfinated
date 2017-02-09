var _ = require("lodash");

exports.optional = function optional(value, replacement) {
	if(_.isUndefined(value)) {
		return replacement || "";
	}
};

exports.upcase = function upcase(value) {
	return String(value).toUpperCase();
};

exports.downcase = function downcase(value) {
	return value.toLowerCase();
};

exports.urlencode = function urlencode(value) {
	return encodeURIComponent(value);
};

exports.urldecode = function urldecode(value) {
	return decodeURIComponent(value);
};

exports.optional = function optional(value, replacement) {
	if (_.isNil(value)) {
		return replacement;
	}
	else {
		return value;
	}
};

exports.is_null = function is_null(value) {
	return value === null;
};

exports.join = function join(value, delimiter) {
	if(_.isNil(delimiter) || delimiter=="") {
		delimiter = ",";
	}
	else {
		delimiter = /^(['"])?(.+?)\1$/.exec(delimiter)[2];
	}
	return value.join(delimiter || ",");
};

// X urlencode
// X urldecode
// hash
// base64encode
// base64decode
// resolve_url

/* String pipes */
// indexOf
// substring
// match/regex
// trim
// chop (max length)
// like
// replace
// toString()

/* Numerical pipes */
// parse
// round
// floor
// ceil
// add, subtract
// multiply, divide, mod

/* Comparison pipes */
// greaterthan
// lessthan
// greaterthanorequal
// lessthanorequal
// equals
// notequals
// isnull

/* Boolean pipes */
// parse
// choose
// contains
// not

// length (Array or String)
// join (String formatting)
// json

/* Array pipes */
// sort
// limit
// skip
// split

// average
// sum
