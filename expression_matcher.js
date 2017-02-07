var matcher = /^\s*([`"']?)(.+?)\1\s*(?:\|(.*?))?\s*$/;

module.exports = function (input) {
	var result = matcher.exec(input);
	if (!result) {
		return null;
	}
	return {
		quote: result[1],
		token: result[2],
		pipes: result[3] || ""
	};
};
