var _ = require("lodash");
var moment = require("moment-timezone");
var pipes = require("../pipes")(_, moment);
var should = require("chai").should(); // eslint-disable-line no-unused-vars

describe("pipes.choose", () => {
	describe("string()", () => {
		function test(input, expected) {
			return function() {
				pipes.choose(input, "true", "false").should.equal(expected);
			};
		}
		
		function fail(input) {
			return function() {
				try {
					pipes.choose(input, "true", "false");
				}
				catch(err) {
					return; // Stop processing if we got the error
				}
				throw new Error("Expected error to be thrown.");
			};
		}

		it("string foo", fail("foo"));
		it("integer", fail(3));
		it("float", fail(3.2));
		it("null", fail(null));
		it("undefined", fail(undefined));
		it("array", fail([1, 2, 3]));
		it("object", fail({ foo: "bar" }));

		it("string true", test("true", "true"));
		it("string false", test("false", "false"));
		it("true", test(true, "true"));
		it("false", test(false, "false"));
	});
});
