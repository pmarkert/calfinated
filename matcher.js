var namedRegex = require("named-js-regexp");
module.exports = namedRegex(/<%\s*(:<quote>[`"']?)(:<token>[\w\.\[\]]+)\k<quote>\s*(:<pipes>.*?)\s*%>/g);
