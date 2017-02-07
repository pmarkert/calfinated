var expression_matcher = require("../expression_matcher");
var should = require("chai").should(); // eslint-disable-line no-unused-vars
var _ = require("lodash");

/*eslint quotes: ["error", "double", { "avoidEscape": true }]*/

describe("matcher groups", () => {
	function test(input, expected) {
		// Any arguments after input are intended to be matches
		expression_matcher(input).should.deep.equal(expected);
	}

	function match(token, pipes, quote) {
		return {
			token,
			quote: quote || "",
			pipes: pipes || ""
		};
	}

	describe("single match", () => {
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
	});
});
