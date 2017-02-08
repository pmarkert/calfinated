var index = require("../calfinated");
var should = require("chai").should(); // eslint-disable-line no-unused-vars

describe("calfinated", () => {
	describe("process() should", () => {
		var context = {
			foo_value: "foo",
			bar_value: "bar",
			phrase_value: "mock phrase",
			number_value: 42,
			true_value: true,
			false_value: false,
			null_value: null,
			object_value: {
				child_property: "child",
				child_array: ["a", "b", "c"],
				child_object: {
					grandchild: "yes"
				}
			}
		};

		function test(to_process, expected) {
			new index().process(to_process, context).should.deep.equal(expected);
		}

		describe("single token", () => {
			it("passthrough a string without templates", () => test("Normal string", "Normal string"));
			it("process a template for a string", () => test("<% foo_value %>", "foo"));
			it("process a template for a nested object string value", () => test("<% object_value.child_object.grandchild %>", "yes"));
			it("process a template for a nested object array value", () => test("<% object_value.child_array %>", ["a", "b", "c"]));
			it("process a template for a nested object array value child element at an index", () => test("<% object_value.child_array[1] %>", "b"));
			it("process an inline template for a number value", () => test(" <% number_value %>", " 42"));
			it("process an inline template for a false value", () => test(" <% false_value %>", " false"));
			it("process an inline template for a true value", () => test(" <% true_value %>", " true"));
			it("process a complete template for a number value", () => test("<% number_value %>", 42));
			it("process a complete template for a false value", () => test("<% true_value %>", true));
			it("process a complete template for a true value", () => test("<% false_value %>", false));
		});

		describe("multiple tokens", () => {
			it("two simple tokens no whitespace", () => test("<%foo_value%><%bar_value%>", "foobar"));
			it("two simple tokens w/whitespace", () => test("<% foo_value %><% bar_value %>", "foobar"));
			it("two simple tokens w/whitespace", () => test("before-<% foo_value %>-between-<% bar_value %>-after", "before-foo-between-bar-after"));
		});
		
		describe("w/pipes", () => {
			it("upcase pipe", () => test("<% foo_value | upcase %>", "FOO"));
			it("optional pipe", () => test("<% undefined_value | optional(default) %>", "default"));
		});
	});
});
