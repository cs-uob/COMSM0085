
# Activity 3:  Dynamic Loading

Your task is to revise the web application from Activity 2. There is no data file provided for this
activity; instead, you must call the API and `GET` the data you need to populate your website. You
will need to work out the correct API path from the public API
[https://petstore.swagger.io/](https://petstore.swagger.io/).

You should use the `fetch()` function to make requests from your JavaScript code. Look at the
[`fetch()` documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
for further guidance.

Here are the files from the walkthrough video, as well as the JSON file in question:
- [`index.html`](../resources/web/activity3/index.html)
- [`style.css`](../resources/web/activity3/style.css)
- [`script.js`](../resources/web/activity3/script.js)

**Complete these steps:**
1.	Watch the [walkthrough video](https://web.microsoftstream.com/video/b8cd524f-0030-4759-a941-1bccd9736c1e).
2.	Modify your JavaScript file to allow for making requests to external websites (or APIs).
3.	Modify your code to try both reading the data automatically when the page loads and on button press (these should be attempted separately).
4.	Dynamically change the contents of the table from the JavaScript using the data returned from the server.

**Extensions (time permitting):**

For both of these you will need to modify the options parameter of the `fetch()` function. Look at the documentation for further guidance.

1.	Adapt the JavaScript to POST data to the API.
2.	Adapt the JavaScript and your HTML structure/interface to DELETE records.

**Think about:**
* What difference does it make now you can dynamically get data?
* What are the challenges that remain for you as a developer if you needed to use this approach to build a much bigger application?