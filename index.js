var matcher = require("./matcher");
var _ = require("lodash");

exports.markup = function(input, context) {
	try {
		return matcher.replace(input, function evaluate_match(match) {
			var groups = this.groups();
			if(match === input) {
				var err = new Error();
				err.name = "ObjectLiteralMatch";
				err.groups = groups;
				throw err;
			}
			return _.get(context, groups.token);
		});
	}
	catch(err) {
		if(err.name !== "ObjectLiteralMatch") {
			throw err;
		}
		return _.get(context, err.groups.token);
	}
};
