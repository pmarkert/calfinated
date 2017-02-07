var index = require("../index");
var should = require("chai").should(); // eslint-disable-line no-unused-vars

describe("markup() should", () => {
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
		index().process(to_process, context).should.deep.equal(expected);
	}

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
