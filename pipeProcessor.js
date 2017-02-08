var pipe_matcher = require("./pipeParser");

module.exports = function (input, pipe_expression, pipes) {
	if (pipe_expression == "") {
		return input;
	}
	var pipe_fragments = pipe_matcher(pipe_expression);
	for (var i = 0; i < pipe_fragments.length; i++) {
		var pipe_command = pipe_fragments[i];
		var pipe_function = pipes[pipe_command.pipe];
		if (!pipe_function) {
			throw new Error("pipe not found - " + pipe_command.pipe);
		}
		input = pipe_function.apply(null, [input].concat(pipe_command.args.split(",")));
	}
	return input;
};
