var _ = require("lodash");
var pipe_matcher = require("./pipeParser");

module.exports = function (input, pipe_expression, calfinated) {
	if (pipe_expression == "") {
		return input;
	}
	var pipe_fragments = pipe_matcher(pipe_expression);
	for (var i = 0; i < pipe_fragments.length; i++) {
		var pipe_command = pipe_fragments[i];
		var pipe_function = calfinated.pipes[pipe_command.pipe];
		if (!pipe_function) {
			calfinated.pipeNotFound(pipe_command.pipe, pipe_command.args);
		} else {
			try {
				input = pipe_function.apply(calfinated, [input].concat(pipe_command.args.split(",").map(a => a.trim())));
			}
			catch(err) {
				calfinated.pipeExecutionError(err, pipe_command.pipe, pipe_command.args);
			}
		}
	}
	return input;
};
