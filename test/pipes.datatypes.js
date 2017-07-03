var _ = require("lodash");
var moment = require("moment-timezone");
var pipes = require("../pipes")(_, moment);
var should = require("chai").should(); // eslint-disable-line no-unused-vars

describe("pipes.Data-type operations", () => {
	describe("string()", () => {
		function test(input, expected) {
			return function() {
				pipes.string(input).should.equal(expected);
			};
		}
		
		it("string", test("foo", "foo"));
		it("integer", test(3, "3"));
		it("float", test(3.2, "3.2"));
		it("true", test(true, "true"));
		it("false", test(false, "false"));
		it("null", test(null, "null"));
		it("undefined", test(undefined, "undefined"));
		it("array", test([1, 2, 3], "1,2,3"));
		it("object", test({ foo: "bar" }, "[object Object]"));
	});
	
	describe("boolean()", () => {
		function test(input, expected) {
			return function() {
				pipes.boolean(input).should.equal(expected);
			};
		}

		function fail(input) {
			return function() {
				try {
					pipes.boolean(input);
				}
				catch(err) {
					return;
				}
				throw new Error("Expected error to be thrown.");
			};
		}

		it("string true", test("true", true));
		it("string false", test("false", false));
		it("true", test(true, true));
		it("false", test(false, false));
		
		it("string foo", fail("foo", true));
		it("integer 3", fail(3, true));
		it("integer 0", fail(0, false));
		it("float", fail(3.2, true));
		it("null", fail(null, false));
		it("undefined", fail(undefined, false));
		it("array", fail([1, 2, 3], true));
		it("object", fail({ foo: "bar" }, true));
	});
});
