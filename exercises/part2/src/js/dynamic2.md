## Dynamic structure, part 2

The rest of `script.js` is concerned with displaying data about a given ward in
the `<main>` section of the page. In fact, it consists of just one function,
called `displayData`. Let us look at its structure, whilst eliding some of its
implementation details:

```javascript
function displayData(id, name) {
  
  function buildPopulation(records) {
    ...
  }

  return function () {
    ...
  }
}
```
When called with two arguments `id` and `name`, the function `displayData` does two things:
1. It defines a [nested
   function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#nested_functions_and_closures)
   called `buildPopulation`. This is a function whose definition is _local_ to
   `displayData`: it can only be used within its body, but not in the rest of
   the program. However, this function is allowed to refer to the arguments of
   its enclosing function (i.e. `id` and `name`). We sometimes call this an _auxiliary function_, or a
   _helper function_.
2. It returns an anonymous [arrow
   function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#arrow_functions).
   Thus, `displayData` will return... a newly defined function! Recall that in
   the previous part of the script, `displayData` was used only in one line,
   namely 
   ```javascript
      b.onclick = displayData(id, name);
   ```
   `b` is a button, and its `onclick` property is a function that will be run
   when it is clicked. Thus, `displayData` should return a function. To
   construct such a function we need to know the `id` and `name` of the ward
   whose data is to be displayed, so `displayData` needs to take them as
   parameters.
   
Both of these constitute examples of functional programming in action.

Let us now look in more detail in the function that is returned:
```javascript
function displayData(id, name) {
  
  function buildPopulation(records) {
    ...
  }

  return function () {
    let wards = fetch(`https://opendata.bristol.gov.uk/api/v2/catalog/datasets/population-estimates-time-series-ward/records?limit=20&select=mid_year,population_estimate&refine=ward_2016_code:${id}`)
      .then(response => response.json())
      .then(data => {
        let heading = document.createElement('h1');
        heading.innerText = name;
        
        let population = buildPopulation(data.records);

        let dataPane = document.getElementById("dataPane");
        dataPane.textContent = '';
        dataPane.append(heading, population);
      })
      .catch(err => console.log(err));
  }
}
```
The pattern here is much the same as before: an HTTP request is made, its response is parsed as JSON, and then processed.

The endpoint is determined as before, but now asks for data from the
[`population-estimates-time-series-ward`](https://opendata.bristol.gov.uk/explore/dataset/population-estimates-time-series-ward/information/?disjunctive.ward_2016_name)
dataset, which contains estimates of the population that lives in each Bristol
ward. We extract only the `mid_year` and `population_estimate` fields, which
contain the year in the middle of which the population is estimated, and the
actual estimate itself. We also use a new feature of the API, namely the
`refine` query parameter. This allows us to extract only records one of whose
_facets_ (i.e. fields of data) has a particular value. At this point in our
code, we know the variable `id` holds the ID of the ward whose population we
want to display, say `E05010914` for Southville. By peeking in some sample data,
we can work out that if we pass the query parameter
```
refine=ward_2016_code:E05010914
```
we will only retrieve the population estimates for Southville.
  
The value `E050109141` is presumably stored in the `id` argument. However, `id`
is a variable in our JavaScript program, so it needs to be turned into a string,
which can then be spliced into the URL at the right position. Fortunately,
modern versions of JavaScript provide a neat way of doing this, namely [template
literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
Instead of enclosing the URL string in single quotes as before, we now enclose
it in backticks. Then, we can use any JavaScript expression `e` that evaluates
to a string by writing `${e}` directly in the URL string. Thus, 
```javascript
`https://opendata.bristol.gov.uk/api/v2/catalog/datasets/population-estimates-time-series-ward/records?limit=20&select=mid_year,population_estimate&refine=ward_2016_code:${id}`
```
evaluates to the correct string at runtime.

The rest of the function is unremarkable. It creates an `<h1>` heading
containing the name of the ward. Then, it calls the local function
`buildPopulation`, passing the records in the data returned by the HTTP request.
The `<main>` tag is retrieved through its unique ID, its contents are erased,
and replaced by the heading and whatever was returned by `buildPopulation`.

A version of this function is run every time someone clicks a ward button.

### Generating tables

The rest of the application is contained in the auxiliary `buildPopulation` function:

```javascript
  function buildPopulation(records) {

    // Make heading
    let heading = document.createElement('h2');
    heading.innerText = 'Population';

    // Make table
    let table = document.createElement('table');
    table.setAttribute('id','populationTable');

    // Make table header
    let header = document.createElement('tr');
    header.innerHTML = '<th>Year</th><th>Population</th></tr>';
    table.appendChild(header);
    
    // Populate table
    records.sort((x1, x2) => x1.record.fields.mid_year < x2.record.fields.mid_year ? -1 : 1)
      .forEach(r => {
        let year = document.createElement('td');
        year.innerText = r.record.fields.mid_year;
        let population = document.createElement('td');
        population.innerText = r.record.fields.population_estimate;

        let row = document.createElement('tr');
        row.append(year, population);
        table.appendChild(row);
    });
    
    let population = new DocumentFragment();
    population.append(heading, table);
    
    return population;
  }
```

Upon receiving an array `records`, this function sets out to build a new
`<table>` with two columns, Year and Population. After building its header, it
sorts the records by year. This is achieved through the build-in
[`sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
function, which takes a higher-order argument that decides which of two records
comes first. It has a funny interface: negative numbers signify that the first
argument comes before the second, and positive arguments the opposite.

The program then iterates through the records, and makes a row `<tr>` for each
data point. Finally, it assembles this data into a table, prepends an `<h2>`
heading, and returns a `DocumentFragment` consisting of the heading and the
table.

Thus, this part of the application is responsible for retrieving and presenting
the requested data.

### Exercises

*Exercise (easy)*. Restrict the displayed data to present only population estimates after the year 2015. This may be achieved by changing the API call. However, a significantly easier way is to process the data after it has been retrieved, and discard unwanted records. (This can be achieved with one line of code.)

*Exercise*. Expand this application so it also presents an estimate of life
expectancy for each ward. I recommend that you define an auxiliary function
```javascript
  function buildLifeExpectancy(records) {
    ...
  }
```
which, given the data, builds the necessary HTML elements - as above.

You will also face another problem, which is that you will need to use data from
two HTTP requests. The obvious way to do this is to nest two fetch calls:
```javascript
fetch('first-URL')
  .then(response => response.json())
  .then(data1 =>
    fetch('second-URL')
      .then(response => response.json())
      .then(data2 => {
        // ... here you can use both data1 and data2 ...
      });
  );
```
However, recent versions of JavaScript provide a neater way of doing this,
namely
[`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all).
This function accepts an array of promises, and returns a single 'composite'
promise. When all the premises in the array are resolved, it passes an array of
the returned values to its `then()` clause. In this particular instance, you
could do something like
```javascript
Promise.all([fetch('first-URL'), fetch('second-URL')])
  .then([response1, response2] => Promise.all([response1.json(), response2.json()]))
  .then([data1, data2] => {
    // ... here you can use both data1 and data2 ...
  });
```
or, in a more succinct style:
```javascript
Promise.all([fetch('first-URL'), fetch('second-URL')])
  .then(responses => Promise.all(responses.map(r => r.json())))
  .then([data1, data2] => {
    // ... here you can use both data1 and data2 ...
  });
```