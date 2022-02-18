## Simplifying your code

If you have changed the app so that it displays life expectancy as well, you
will notice that you have amassed a formidable amount of code. For example, my
solution runs to 116 lines - all to achieve something that is essentially
simple.

For example, to create the population data table we wrote the following code:

```javascript
let year = document.createElement('td');
year.innerText = r.record.fields.mid_year;

let population = document.createElement('td');
population.innerText = r.record.fields.population_estimate;

let row = document.createElement('tr');
row.append(year, population);
table.appendChild(row);
```

Staring at this code, certain patterns become evident: every time we want to
create a new HTML tag, we must:
1. create the HTML element,
2. set its `innerHTML` (or `innerText` elsewhere, e.g. when making buttons), and
3. assemble things hierarchically (in rows, tables, etc.)

This pattern occupies the majority of our code. It is an artifact of the way the
DOM API is designed. For example, it would be preferable if we had a constructor
`document.createElementWithHTML(tag, innerHTML)` which allowed to construct a
new element of the DOM, and immediately initialize it with some HTML.

Luckily, JavaScript is a particularly expressive language, and such an interface
can be defined:

```javascript
function createElementHTML(tag, html) {
  let elem = document.createElement(tag);
  elem.innerHTML = html;
  return elem;
}
```
This small function performs steps 1 and 2, and then returns the new element.

To deal with 3, i.e. the hierarchical assembly of elements, we can define a function

```javascript
function createElementWith(tag, xs) {
  let elem = document.createElement(tag);
  for (const x of xs) {
    elem.appendChild(x);
  }
  return elem;
}
```

This function takes the name of a tag, and an array `xs` of elements. It then
creates a new element with this tag, and appends everything in `xs` as children
of this new element. Finally, it returns the newly constructed element.

These functions allow us to create new elements of the DOM in a more functional
style. For example, an array containing the rows of the population table can be
created using the following code fragment:

```javascript
  records.filter(d => d.record.fields.mid_year >= 2015)
    .sort((x1, x2) => x1.record.fields.mid_year < x2.record.fields.mid_year ? -1 : 1)
    .map(r =>
      createElementWith('tr', [
        createElementText('td', r.record.fields.mid_year),
        createElementText('td', r.record.fields.population_estimate)
      ])
```

The expressions in the body correspond to the actual tree structure of the row.
As a result, they are much more readable.

*Exercise*. Rewrite the application using the functions defined above (and
similar ones). Try to make it as succinct and readable as possible. 

For example, my version of the complete application (with life expectancy) runs
to 114 lines, and that is without making much of an effort to be succint. This
is only 2 lines shorter than my previous version, but one must remember that
about 20 of these lines are the new functions, and we could factor these out in
a separate JavaScript
[module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).
This amounts to a 19% reduction in the amount of code - which can be rather
significant in larger projects.

Of course, larger projects are likely to use frameworks like React to build such
applications, whose use of JSX and [function
components](https://www.robinwieruch.de/react-function-component/) deal with
exactly this sort of problem.