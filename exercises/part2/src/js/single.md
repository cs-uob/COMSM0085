# A single-page application

This activity is about developing a very simple, [single-page web
application](https://en.wikipedia.org/wiki/Single-page_application) in HTML,
CSS, and JavaScript. The point is to do this with basic JavaScript, i.e. using
just the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
and manipulating the
[DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model).

The purpose of the application is:
* to use the [Bristol City Council API](https://opendata.bristol.gov.uk/) to
  fetch population data
* at the press of a button corresponding to each [Bristol
  ward](https://en.wikipedia.org/wiki/List_of_wards_in_Bristol_by_population),
  present that data nicely in a table

## Setup

Because you will need a browser to run this application, it is best if you run
it on your actual machine. After all, the point of web applications is that they
are (sort of) _portable_, i.e. they are able to run and present virtually
identical behaviour on all sorts of machines. (This is not entirely true
however, because different JavaScript engines may fail to support various
language features.)

A basic version of the app can be found as `code/bristol-app.zip` in the
repository. Download this file, and extract its contents in some location on
your machine. This should create a folder with exactly three files:

```
app.html
style.css
script.js
```

We will go through each one in detail. But before we do so, point your browser
at `app.html` and try the application.
