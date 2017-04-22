var _ = require("lodash");
var moment = require("moment-timezone");
var pipes = require("../pipes")(_, moment);
var should = require("chai").should(); // eslint-disable-line no-unused-vars

describe("pipes.csv_safe", () => {
	function test(input, expected) {
		return function() {
			pipes.csv_safe(input).should.equal(expected);
		};
	}
	
	it("string", test("string", "string"));
	it("string w/comma", test('string,', '"string,"'));
	it("string w/quote", test('string"', 'string""'));
	it("empty string", test("", ""));
	it("a number", test(3, "3"));
	it("true", test(true, "true"));
	it("false", test(false, "false"));
	it("null", test(null, "null"));
	it("undefined", test(undefined, "undefined"));
	it("an object", test({ foo: "bar" }, "[object Object]"));
	it("an array of numbers", test([ 1, 2, 3 ], '"1,2,3"'));
	it("an array of strings", test([ 'a', 'b', 'c'], '"a,b,c"'));
	it("a csv_string", test({ csv_string: '=HYPERLINK("abc")' }, '=HYPERLINK("abc")'));
});
