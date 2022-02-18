## Dynamic structure, part 1

When you point your browser at `app.html`, the "Initialising..." string appears
in the left of the screen (the `<nav>`) only for a fraction of a second. This is
the time it takes to load and execute the code in `script.js`, which provides
the dynamic behaviour of the app.

### Making some buttons

Indeed, looking at `script.js` we notice that it goes straight into business:
```javascript
let wards = fetch('https://opendata.bristol.gov.uk/api/v2/catalog/datasets/wards/records?limit=50&select=name,ward_id')
  .then(response => response.json())
  .then(populateWards)
  .catch(err => console.log(err));
```
This code makes an HTTP request to the Bristol City Council API. This returns a
promise; when it is resolved, it is parsed as JSON, which itself creates another
promise. Finally, when _that_ promise is resolved, the `populateWards` function
is called, and is passed the parsed JSON as an argument. If any of these steps
cause an error, the last line catches it, and prints it on the console. These
four lines are a modern JavaScript idiom that uses all the latest technology:
the fetch API; promises; and higher-order, anonymous functions.

One might wonder: what will the input passed to `populateWards` in this call
look like? To answer this we can peek at the above URL and see what it returns:
on any Linux machine we may run
```
curl -X 'GET' 'https://opendata.bristol.gov.uk/api/v2/catalog/datasets/wards/records?select=name,ward_id' | json_pp | less
```
which will make a `GET` request at this URL, parse the result as JSON
(`json_pp`), and display it in scrollable format (`less`). The result looks a
lot like this:
```javascript
{
   "links" : ...,
   "records" : [
      {
         "links" : ...,
         "record" : {
            "fields" : {
               "name" : "Eastville",
               "ward_id" : "E05010897"
            },
            "id" : "996b607b4c31e6aca6a7614bd02ea18a4c14c525",
            "size" : 40500,
            "timestamp" : "2020-09-03T10:02:58.597Z"
         }
      },
      {
         "links" : ...,
         "record" : {
            "fields" : {
               "name" : "Southville",
               "ward_id" : "E05010914"
            },
            "id" : "bc2f85ccc34ca606a2fe6473491b5fc50fd4e0d1",
            "size" : 25544,
            "timestamp" : "2020-09-03T10:02:58.597Z"
         }
      },
      ...
   ],
   "total_count" : 34
}
```
I have abbreviated the `links` fields, which add a lot of noise to the output.
We can thus see that this HTTP request returns a JSON object which contains the
names and ward IDs of all the wards of the city of Bristol! The final field
returns the total record count, which is 34.

Unlike SQL databases, which come with a strongly-typed data schema, the data
here is semi-structured at best. We may discern its structure by looking at the
above output. The top-level object has a `records` field, which contains an
array of records. Each of these records is a JSON object itself. Its `record`
field contains a field called `fields`, which contains the `name` and `ward_id`
of each ward.

|||advanced

One might ask: how did I figure out the correct URL to obtain all the wards?

Unlike relational databases, where a predetermined schema tells the developer
exactly where to look, the situation with APIs is more of a trial-and-error
affair. Many APIs you will have to use in your life are poorly documented, and
using them invovles some guesswork.

In this particular instance, I went on the [Open Data
Bristol](https://opendata.bristol.gov.uk/explore/?sort=modified) website, and
looked through the available datasets. There I found a dataset called
['Wards'](https://opendata.bristol.gov.uk/explore/dataset/wards/information/).
The description seemed to match what I wanted, which was confirmed by clicking
on the 'Table' tab, and seeing some sample data.

Using the 'API' tab on the same page is misleading, as it presents an interface
for querying the old version (v1) of their API. Following the link to the ['full
API console'](https://opendata.bristol.gov.uk/api/v2/console) reveals that
there is a modern, REST-type API (v2), described in a format known as
[OpenAPI](https://swagger.io/docs/specification/about/). This is the current
industry standard for describing REST APIs.

Looking through the documentation, it was evident that the endpoint of interest is
```
/catalog/datasets/{dataset_id}/records
```
I replaced `{dataset_id}` with the id of the ward dataset (`wards`). I also
passed in two query parameters:
* `limit=50` which limits the response to contain at most 50 data points in the JSON object (which is way more than the Bristol wards)
* `select=name,ward_id` which limits the fields in the response to those in which we are interested

To test this I used variations of the above `curl` command, and looked at the output.
|||

Now that we understand the structure of the data returned from that endpoint, we can go ahead and write the `populateWards` function:
```javascript
function populateWards(wards) {
  let buttons = new DocumentFragment();

  wards.records.forEach(w => {
      const [id, name] = [w.record.fields.ward_id, w.record.fields.name];
      const b = document.createElement("button");
      b.innerText = name;
      b.onclick = displayData(id, name);
      buttons.appendChild(b);
  });
  
  let nav = document.getElementById("nav");
  nav.textContent = '';
  nav.append(buttons);
}
```
This function is a callback that will receive the JSON object containing ward names.

The first line creates a
[`DocumentFragment`](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment)
called `buttons`. Loosely speaking, this is an object that can be used to
collect a bunch of stuff that will be added to a page. When creating many new
elements on a page it is prudent to add them to a `DocumentFragment` first, and
only then add that `DocumentFragment` to the page. That way they will all appear
on the page at roughly the same time.

The next part of the function iterates through every ward. First, it extracts
the `id` and `name` fields. Then, it creates a new `<button>`, and sets its text
to be the name of the ward. When each of these buttons is clicked, the function
returned by the call to `displayData` will be run. Each new button is then added
to the `DocumentFragment` using the
[`appendChild`](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)
function.

Finally, the `<nav>` is obtained by using its ID. Its contents are deleted, and
replaced by the `DocumentFragment` containing all these new buttons, by using
the [append](https://developer.mozilla.org/en-US/docs/Web/API/Element/append)
function.

In short, this is the bit of code that creates the buttons on the navigation
section on the left!

|||advanced
Of course, someone could argue that the wards of Bristol do not change very
often, and that as a consequence it is slow and wasteful to perform an HTTP
request to obtain a list of wards; it would be much better to simply hard-code
these buttons and their names into the app. This developer could well be right.
|||

*Exercises.*
1. Modify the code above so that each button is on a separate line.
2. Modify the code above so that buttons appear in alphabetical order.

_Hint._ Both of these exercises can be completed by adding one line of code.