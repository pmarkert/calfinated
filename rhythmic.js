module.exports = {
	anchored,
	any_character_but,
	back_reference,
	capture,
	choice_of,
	combine, 
	greedy,
	identifier,
	negative_assertion,
	nonCapturingGroup,
	one_or_more, 
	optional,
	parenthetical,
	quoted, 
	optional_whitespace, 
	zero_or_more
};

function quoted(content, index) {
	return nonCapturingGroup(capture("['\"`]") + content + back_reference(index));
}

function optional_whitespace() {
	return zero_or_more("\\s");
}

function identifier() {
	return one_or_more("\\w");
}

function capture(contained) {
	return "(" + contained + ")";
}

function nonCapturingGroup(contained) {
	return "(?:" + contained + ")";
}

function optional(contained) {
	return contained + "?";
}

function greedy(contained) {
	return contained + "?";
}

function parenthetical(contained) {
	return "\\(" + contained + "\\)";
}

function choice_of() {
	return Array.from(arguments).join("|");
}

function one_or_more(contained) {
	return contained + "+";
}

function zero_or_more(contained) {
	return contained + "*";
}

function combine() {
	return Array.from(arguments).join("");
}

function any_character_but(chars) {
	return "[^" + chars + "]";
}

function anchored(content) {
	return "^" + content + "$";
}

function negative_assertion(content) {
	return "(?!" + content + ")";
}

function back_reference(index) {
	return "\\" + index;
}
