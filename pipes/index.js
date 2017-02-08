var _ = require("lodash");

exports.upcase = function (value) {
	return value.toUpperCase();
};

exports.urlencode = function (value) {
	return encodeURIComponent(value);
};

exports.urldecode = function (value) {
	return decodeURIComponent(value);
};

exports.optional = function (value, replacement) {
	if (_.isNil(value)) {
		return replacement;
	}
	else {
		return value;
	}
};

exports.join = function(value, delimiter) {
	if(_.isNil(delimiter) || _.isEmpty(delimiter)) {
		delimiter = ",";
	}
	else {
		delimiter = /^(['"])?(.+?)\1$/.exec(delimiter)[2];
	}
	return value.join(delimiter || ",");
};
