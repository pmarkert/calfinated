var matcher = require("../matcher");
var should = require("chai").should(); // eslint-disable-line no-unused-vars
var _ = require("lodash");

/*eslint quotes: ["error", "double", { "avoidEscape": true }]*/

describe("matcher groups", () => {
	function test(input) {
		// Any arguments after input are intended to be matches
		var expected = Array.prototype.slice.call(arguments, 1);

		var match;
		var results = [];
		while ((match = matcher.exec(input)) != null) {
			results.push(match.groups());
		}
		results.should.deep.equal(expected);
	}

	function match(token, pipes, quote) {
		return {
			token,
			quote: quote || "",
			pipes: pipes || ""
		};
	}

	describe("single match", () => {
		it("without templates", () => test("Normal string"));
		it("token no whitespace", () => test("<%foo%>", match("foo")));
		it("token w/whitespace", () => test("<% foo %>", match("foo")));
		it("single quoted token no whitespace", () => test("<%'foo'%>", match("foo", "", "'")));
		it("single quoted token w/whitespace", () => test("<% 'foo' %>", match("foo", "", "'")));
		it("double quoted token no whitespace", () => test('<%"foo"%>', match("foo", "", '"')));
		it("double quoted token w/whitespace", () => test('<% "foo" %>', match("foo", "", '"')));
		it("backtick quoted token no whitespace", () => test("<%`foo`%>", match("foo", "", "`")));
		it("backtick quoted token w/whitespace", () => test("<% `foo` %>", match("foo", "", "`")));
		it("pipes w/whitespace", () => test("<% foo | pipes %>", match("foo", "| pipes", "")));
		it("pipes no whitespace", () => test("<% foo| pipes%>", match("foo", "| pipes", "")));
		it("pipes no whitespace internal", () => test("<% foo|pipes%>", match("foo", "|pipes", "")));
	});

	describe("multiple matches", () => {
		it("two simple tokens no whitespace", () => test("<% foo %><% bar %>", match("foo"), match("bar")));
		it("two simple tokens w/whitespace", () => test(" <% foo %> <% bar %> ", match("foo"), match("bar")));
		it("two simple tokens w/intermediate text", () => test(" <% foo %> in between <% bar %> ", match("foo"), match("bar")));
		it("two simple tokens w/intermediate and surrounding text", () => test("before <% foo %> in between <% bar %> and after", match("foo"), match("bar")));
		it("three tokens w/intermediate and surrounding text", () => test("before <% foo %> in between <% bar %> and after <% bat %> and again", match("foo"), match("bar"), match("bat")));
		it("three tokens middle has pipes", () => test("before <% foo %> in between <% bar | function(args) %> and after <% bat %> and again", match("foo"), match("bar", "| function(args)"), match("bat")));
	});
});
