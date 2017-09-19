var index = require("../calfinated");
var should = require("chai").should(); // eslint-disable-line no-unused-vars
var assert = require("assert");

describe("calfinated", () => {
	describe("process() should", () => {
		var context = {
			foo_value: "foo",
			bar_value: "bar",
			phrase_value: "mock phrase",
			number_value: 2,
			true_value: true,
			false_value: false,
			null_value: null,
			object_value: {
				child_property: "child",
				child_array: ["a", "b", "c"],
				fruit_value: 'b',
				child_object: {
					grandchild: "yes"
				},
				index: {
					a: "apples",
					b: "bananas",
					c: "cranberries"
				}
			}
		};

		function test(to_process, expected) {
			var result = new index().process(to_process, context);
			if(expected!=null) {
				should.exist(result);
				result.should.deep.equal(expected);
			}
			else {
				should.not.exist(result);
			}
		}

		describe("empty token", () => {
			it("empty string w/ whitespace", () => test("<% %>", null));
			it("empty string w/ pipe", () => test("<% | %>", null));
		});
		
		describe("single token", () => {
			it("passthrough a string without templates", () => test("Normal string", "Normal string"));
			it("process a template for a string", () => test("<% foo_value %>", "foo"));
			it("process a template for a nested object string value", () => test("<% object_value.child_object.grandchild %>", "yes"));
			it("process a template for a nested object array value", () => test("<% object_value.child_array %>", ["a", "b", "c"]));
			it("process a template for a nested object array value child element at an index", () => test("<% object_value.child_array[1] %>", "b"));
			it("process an inline template for a number value", () => test(" <% number_value %>", " 2"));
			it("process an inline template for a false value", () => test(" <% false_value %>", " false"));
			it("process an inline template for a true value", () => test(" <% true_value %>", " true"));
			it("process a complete template for a number value", () => test("<% number_value %>", 2));
			it("process a complete template for a false value", () => test("<% true_value %>", true));
			it("process a complete template for a true value", () => test("<% false_value %>", false));
			it("process a template for the root object", () => test("<% . %>", context));
		});

		describe("multiple tokens", () => {
			it("two simple tokens no whitespace", () => test("<%foo_value%><%bar_value%>", "foobar"));
			it("two simple tokens w/whitespace", () => test("<% foo_value %><% bar_value %>", "foobar"));
			it("two simple tokens w/whitespace", () => test("before-<% foo_value %>-between-<% bar_value %>-after", "before-foo-between-bar-after"));
		});
		
		describe("w/pipes", () => {
			it("upcase pipe", () => test("<% foo_value | upcase %>", "FOO"));
		});
		
		describe("backtick replacements", () => {
			it("objectExpression array lookup", () => test("<% object_value.child_array.`number_value` %>", "c"));
			it("objectExpression index lookup", () => test("<% object_value.index.`object_value.fruit_value` %>", "bananas"));
			it("stringTemplate array lookup", () => test("The answer is '<% object_value.child_array.`number_value` %>'", "The answer is 'c'"));
		});
		
		describe("missing and optional keys", () => {
			it("missing_key", () => assert.throws(() => test("<% missing_key %>", ""), (err) => err.message.indexOf("MissingKeyError")>=0));
			it("missing_key w/optional", () => test("<% missing_key | optional %>", ""));
			it("missing_key w/optional no whitespace", () => test("<% missing_key|optional %>", ""));
			it("missing_key w/optional and default parens", () => test("<% missing_key| optional(asdf) %>", "asdf"));
			it("missing_key w/optional and default comma", () => test("<% missing_key| optional,asdf %>", "asdf"));
		});
		
		describe("pipe only", () => {
			it("pipe only", () => test("<% | is_null %>", true));
		});
	});
});
