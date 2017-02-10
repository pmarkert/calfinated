// Given an input string parsed
var rhy = require("./rhythmic");

var anything_but_pipe_or_quote = "[^\\|'\"`]*";
var params = (index) => rhy.capture(rhy.zero_or_more(rhy.nonCapturingGroup(anything_but_pipe_or_quote + rhy.optional(rhy.quoted(".*?",index)))));
var parenthetical_params = rhy.nonCapturingGroup(rhy.parenthetical(params(2)));
var comma_params = rhy.nonCapturingGroup("," + params(5));
var pipe_params = rhy.choice_of(parenthetical_params, comma_params);
var pipe_expression = rhy.capture(rhy.identifier()) + rhy.space() + rhy.optional(rhy.nonCapturingGroup(pipe_params));
var pipe_symbol = "\\|";
var pattern = rhy.nonCapturingGroup(pipe_symbol + rhy.space() + pipe_expression + rhy.space());

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

