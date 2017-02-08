// Given an input string parsed 
module.exports = function (input) {
	var matcher = /\s*(\w+)\s*(?:\((.+?)\)|(?:,(.+)))?\s*/g;
	var match = matcher.exec(input);
	var results = [];
	while (match != null) {
		results.push({
			pipe: match[1],
			args: (match[2] || match[3] || "").trim()
		});
		match = matcher.exec(input);
	}
	return results;
};