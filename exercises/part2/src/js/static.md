## Static structure

The static structure of our application is given by the `app.html` file, as
styled by `style.css`.

### HTML

The main html file `app.html` is surprisingly unassuming: it contains almost
nothing of substance! In fact, we can quote the complete file here:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>The City of Bristol</title>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css" />
    <script src="script.js"></script>
  </head>
  <body>
    <header><h1>The City of Bristol</h1></header>
    <nav id="nav">
      <div class="initial">Initialising...</div>
    </nav>
    <main id="dataPane">
      <div class="initial">Please select one of the wards on the left to view more data about it.</div>
    </main>
    <footer>created by G. A. Kavvos</footer>
  </body>
</html>
```

This is a very standard HTML file, which readily passes the [W3
validator](https://validator.w3.org/). It consists of a `<head>` and a `<body>`.

* The `<head>` sets the title, loads some nice fonts from the web, and declares
  that `style.css` is the stylesheet. Finally, the `<script>` tag tells the
  browser that there is JavaScript code to be run in the file `script.js`, which
  will be retrieved from the same location as the page that is being loaded.
* The `<body>` describes a document with four sections:
  * There is a `<header>` with a big heading reading "The City of Bristol".
  * There is a `<nav>` [navigation
    section](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav),
    with a single `<div>` (i.e. a [generic block
    container](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div))
    with placeholder text saying "Initialising...".
  * Then then there is a `<main>` section, which contains a single `<div>` with
    some instructions for using the app.
  * Finally, there is a `<footer>` with the author's name in it.

The two `<div>`'s are instances of the `.initial` class. Both `<nav>` and
`<main>` have unique id attributes, so they can be referred to uniquely.

|||advanced
It is generally agreed that [id attributes must be
unique](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id)
in an HTML document. However, there is no enforcing mechanism for this: the
browser will _not_ check that we have not mistakenly re-used an id for some
other tag. Again, this is in the interest in providing a smooth user experience
without errors. Do not abuse this!
|||

This sparse document structure will be all that we need to present our single-page application.

### CSS

Go ahead and open up `app.html` in your browser of choice. You will see that the
structure described by the tags above appear in very particular places.

Indeed, the location and appearance of the four sections (header, nav, main,
footer) are set in the `style.css` file, which is explicitly loaded in
`app.html`. The main things to note are the first few lines

```css
html {
  font-size: 12pt;
  font-family: 'Libre Baskerville', serif;
}

body {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```
which tell the browser to 
* use the Libre Baskerville font (loaded in the `<head>`) throughout the entire document, and
* lay out the `<body>` of the document using CSS grids.

We will not dwell on the grid structure here, but note that, as the `<nav>`
comes first, it becomes the first `200px` column, and the `<main>` section
becomes the `1fr` column.

The `style.css` file also sets many other details, such as margins, colours, etc.