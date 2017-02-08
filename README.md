# calfinated
calfinated.js is a node module that provides string-based templating and token replacement.

The initial purpose is to replace the usage of the no longer maintained markup.js dependency
for use by hyperpotamus.

## Why the name?
Given the theme of hyperpotamus, a baby hippo is called a "calf".

## How does it work?
```
var calfinated = require('calfinated')();
// Optionally add your own pipe extensions
// calfinated.add_pipes(your_extra_pipes);

var data = {
   name: "hippos",
   favorite: {
     drink: "coffee",
     color: "brown",
     number: 6294
   }
};

console.log(calfinated.process("<% name %>", data)); // "hippos"
console.log(calfinated.process("<% favorite.color %>", data)); // "brown"
console.log(calfinated.process("<% name %> drink <% favorite.drink %>")); // "hippos drink coffee"
console.log(calfinated.process("<% favorite.number %>")); // 6294 (typed as number)
```

calfinated also supports pluggable pipes that allow for powerful transformations of the data
```
console.log(calfinated.process("<% drink | upcase()" %>"); // "COFFEE"
