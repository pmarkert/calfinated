var namedRegex = require("named-js-regexp");
var matcher = namedRegex(/^\s*(:<quote>[`"']?)(:<token>.+?)\k<quote>\s*(?:\|(:<pipes>.*?))?\s*$/);

module.exports = function(input) {
	var result = matcher.exec(input);
	if(result) {
		result = result.groups();
		result.pipes = result.pipes || "";
	}
	return result;
};
