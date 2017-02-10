var pipe_matcher = require("../pipeParser");
var should = require("chai").should(); // eslint-disable-line no-unused-vars
var _ = require("lodash");

/*eslint quotes: ["error", "double", { "avoidEscape": true }]*/

describe("pipeParser", () => {
	function test(input) {
		// Any arguments after input are intended to be matches
		var result = pipe_matcher(input);
		should.exist(result, "Should have matched and returned a value");
		result.should.deep.equal(Array.prototype.slice.call(arguments, 1));
	}

	function match(pipe, args) {
		return {
			pipe,
			args: args || ""
		};
	}

	describe("no arguments", () => {
		it("pipe no whitespace", () => test("|foo", match("foo")));
		it("pipe no whitespace, parens", () => test("|foo()", match("foo")));
		it("pipe no whitespace, comma", () => test("|foo,", match("foo")));
		it("pipe no whitespace, comma whitespace", () => test("|foo , ", match("foo")));
		it("pipe w/whitespace", () => test("| foo ", match("foo")));
		it("pipe w/whitespace, parens", () => test("| foo( ) ", match("foo")));
		it("pipe to a pipe no whitespace", () => test("|foo|bar", match("foo"), match("bar")));
		it("pipe to a pipe no whitespace, first has parens", () => test("|foo()|bar", match("foo"), match("bar")));
		it("pipe to a pipe no whitespace, second has parens", () => test("|foo|bar()", match("foo"), match("bar")));
		it("pipe to a pipe no whitespace, both have parens", () => test("|foo( )|bar()", match("foo"), match("bar")));
		it("pipe to a pipe w/whitespace", () => test("| foo | bar ", match("foo"), match("bar")));
		it("pipe to a pipe w/whitespace", () => test("| foo | bar ", match("foo"), match("bar")));
	});
	
	describe("w/arguments", () => {
		it("pipe w/argument", () => test("|foo(asdf)", match("foo", "asdf")));
		it("pipe w/dotted.argument", () => test("|foo(asdf.qwer)", match("foo", "asdf.qwer")));
		it("pipe w/quoted comma argument", () => test("|foo(',')", match("foo", "','")));
		it("pipe w/two arguments", () => test("|foo(asdf, qwer)", match("foo", "asdf, qwer")));
		it("pipe w/comma argument", () => test("|foo,asdf", match("foo", "asdf")));
		it("pipe w/two comma arguments", () => test("|foo,asdf, qwer", match("foo", "asdf, qwer")));
		it("complex commas", () => test("|date_parse,,America/Los_Angeles | day | date_format", match("date_parse",",America/Los_Angeles"), match("day"), match("date_format")));
		it("complex parens", () => test("|date_parse(,America/Los_Angeles) | day() | date_format()", match("date_parse",",America/Los_Angeles"), match("day"), match("date_format")));
		it("quoted argument with pipe, parens", () => test("|foo('|')", match("foo","'|'")));
		it("quoted argument with pipe, comma", () => test("|foo,'|'", match("foo","'|'")));
	});
});
