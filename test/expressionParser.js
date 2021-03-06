var expression_matcher = require("../expressionParser");
var should = require("chai").should(); // eslint-disable-line no-unused-vars
var _ = require("lodash");

/*eslint quotes: ["error", "double", { "avoidEscape": true }]*/

describe("expressionParser", () => {
	function test(input, expected) {
		// Any arguments after input are intended to be matches
		var result = expression_matcher(input);
		should.exist(result, "Should have matched and returned a value");
		delete result.tag; // Not interested in comparing the full tag value
		result.should.deep.equal(expected);
	}

	function match(token, pipes, quote) {
		return {
			token,
			quote: quote || "",
			pipes: pipes || ""
		};
	}

	it("empty string", () => test("", match("")));
	it("token no whitespace", () => test("foo", match("foo")));
	it("token w/whitespace", () => test(" foo ", match("foo")));
	it("single quoted token no whitespace", () => test("'foo'", match("foo", "", "'")));
	it("single quoted token w/whitespace", () => test(" 'foo' ", match("foo", "", "'")));
	it("double quoted token no whitespace", () => test('"foo"', match("foo", "", '"')));
	it("double quoted token w/whitespace", () => test(' "foo" ', match("foo", "", '"')));
	it("backtick quoted token no whitespace", () => test("`foo`", match("foo", "", "`")));
	it("backtick quoted token w/whitespace", () => test(" `foo` ", match("foo", "", "`")));
	it("pipes w/whitespace", () => test(" foo | pipes ", match("foo", "| pipes", "")));
	it("pipes no whitespace", () => test(" foo| pipes", match("foo", "| pipes", "")));
	it("pipes no whitespace internal", () => test(" foo|pipes", match("foo", "|pipes", "")));
	it("token having spaces", () => test("foo bar", match("foo bar")));
	it("token having spaces and quotes", () => test("'foo bar'", match("foo bar", "", "'")));
	it("literal with pipe", () => test("'| pipe'", match("| pipe", "", "'")));
	it("pipes only no whitespace", () => test("|pipe", match("", "|pipe", "")));
	it("pipes only w/whitespace", () => test(" | pipe", match("", "| pipe", "")));
	it("pipes only intermediate whitespace", () => test("| pipe", match("", "| pipe", "")));
	it("pipes with tab whitespace", () => test(" array | join,\t ", match("array", "| join,\t", "")));
	it("realworld", () => test("startTime | date_parse,,America/Los_Angeles | day | date_format", match("startTime", "| date_parse,,America/Los_Angeles | day | date_format")));
	it("second", () => test("missing_key| optional,asdf ", match("missing_key", "| optional,asdf")));
});
