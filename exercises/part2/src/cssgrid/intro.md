# CSS grids introduction

To create a CSS grid, you place a container element (usually a `<div>`) and style it `display: grid`. All its direct children will now be laid out in a grid, and you can configure the general layout on the parent element:

  - `grid-template-columns` defines the number and widths of the columns.
  - `gap` (which should have been called `grid-gap`, but is not) defines the gap between different grid cells. 
  - For a gap around the outside of the grid, give the container a margin (or padding).

On the child elements, you can set the placement rules for each one and the browser will build the grid accordingly:

  - By default, each child takes up the next free 1x1 space.
  - `grid-row` and `grid-column` modify this:
    - `span N` makes a child element N cells wide/tall.
    - `M / N` positions the child absolutely from dividing line M to dividing line N (you can overlap or stack elements on top of each other this way if you want to).

There are many more things that you can do with grids, and your best resources if you need to look this up are:

  - [Grids on MDN](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Grids)
  - [CSS-tricks complete guide to grids](https://css-tricks.com/snippets/css/complete-guide-grid/)
