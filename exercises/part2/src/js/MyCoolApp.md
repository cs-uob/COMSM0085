
# A single-page application to fetch data from a public REST API

In this lab, we are going to make a single-page web application to
find information out about movies using
JavaScript. You will learn how to use an API to fetch data and add it to the DOM of the HTML to view the results.

Setup:
------
The basic of the application can be found in the GitHub repository. Three files exist in the folder; maintain the same structure as we discussed in the lecture. The script.js file will be partially completed, and it is required to fill in the remaining code for the application to work properly. The image folder contains the necessary images for the application to work. 

First, download the folder with the files and folders. A way to do it is by using wget:

wget <https://cs-uob.github.io/COMSM0085/exercises/part2/resources/movie-search.tar.gz>


Then extract the contents using the command:
~~~~.sh 
 tar -xzf movie-search.tar.gz
~~~~

This command will create a folder that includes the files we need to build the application.

Check if Node.js is installed with 

~~~~.sh 
node -v
~~~~

If not, install it in your Debian VM with:

~~~~.sh
sudo apt install node.js 
~~~~

### What is an API?

An API is an interface that a programmer can call to access and
manipulate information.  For many websites these APIs are provided
as network services: you send `GET`, `PUSH` and `POST` requests as
normal and get data sent back in a suitable format (usually `JSON` or `XML`).  This lets us pulling data into an application without the need to store it locally.

APIs are important components of modern software development due to several reasons. An API provides a standardized way for different applications to access each other's data, even when they have different implementations. Additionally, APIs are utilized to enforce security measures in our development process. They ensure that only authorized users or applications can access certain data, enhancing the overall security of the system.

Feel free to make any changes to the CSS and HTML files by adding or
modifying elements, colors.  

For this lab we will use a free API from [themoviedb.org](https://www.themoviedb.org/). This is a large database with movie data. To get an API key we must register to the site and create an account. Then from here we can request our API key. 

To get an API key sign up at: <https://developer.themoviedb.org/docs/getting-started>.

Once the account is ready, [create a new
app](https://www.themoviedb.org/settings/api/new/form?type=developer):

- *Type of Use*: Desktop Application
- *Application Name*: MyCoolApp
- *Application URL*: `http://localhost`
- *Application Summary*: Learning JavaScripting and need an API to
  test against
  
Once the application is created it will give an *API Key* and an
*API Read Access Token* on the [API page](https://www.themoviedb.org/settings/api): *make a note of these!*

This API is well-documented, and we can find all relevant information about how to make calls and use API methods in the following link: <https://developer.themoviedb.org/reference/intro/getting-started>

In the lab we will make HTTP `GET` requests to: <https://api.themoviedb.org/3/discover/movie>

We will create an app that fetches all the new and latest movies along with their details such as title, overview, and score. Instead of using a button, we will incorporate a search bar on our site to filter movies based on text input. The HTML code will not contain anything special, as we will populate the DOM with our JavaScript code.

### Test it is working

At this stage, before we add any external functionality, lets check
our website is working.  Bring up a webserver serving from your site's
root directory.  If you don't have a webserver handy, Python has a
simple one you can use for testing.  Bring it up with:

~~~~.sh
python -m http.server
~~~~

This will create a server listening on <http://localhost:8000>.  Check
you can access it in a web browser; then leave it running in the
background.

**Hint**: You don't need to open a new terminal to run something in
the background.  Hit `C-z` (control-z) to suspend a process.  Run `bg`
to send it to the background and let it continue running, and `fg` to
bring it back to the foreground.  See `man 1p jobs` or `help jobs` for
more information.  

JavaScript
----------

We load our JavaScript from the `js/script.js` file, but unless you've
taken it from the GitHub repository you'll find your server is
returning `404 File not found`.  We need to create it.

Then, add your API key at the end, or use the one provided above by replacing the `XXX`.

*(Tip: Refer to the example on this page: <https://developer.themoviedb.org/reference/discover-movie>)*

### Code

```javascript
const API_URL =XXX
const IMG_PATH = 'https://image.tmdb.org/t/p/w500'
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=XXX&query="'
```

The `const IMG_PATH` represents the `poster_path` (you can find more details in the API reference), and `SEARCH_API` concatenates a term from the search box into a query against the database. We aim for the most popular movies to be visible on our application page, replace the `XXX` with your API key.

Here, we declare the elements we want as constants to use them in our listener for the search box. To return an element object, we need to use a method. Fill in the missing method in the constants for each element.

```javascript
const main =  XXX
const form = XXX
const search = XXX
```

This function below actually uses the API to fetch the movies we want. 

```javascript
function getMovies(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            showMovies(data.results);
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
        });
}
```

For this lab, we want to improve our code by using the async/await method discussed in our lectures. We can find more theoretical details here: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch>. The Fetch API returns a promise, and we'll ensure our code waits for the API response before proceeding, using async/await.

Replace the preceding code block containing the function getMovies(url) with a block that utilizes the async/await method.

After enhancing our code with asynchronous programming, let's observe the disparities compared to synchronous programming. What are the benefits of asynchronous methods? Why are asynchronous methods generally preferred and considered advantageous?

To display results on the DOM, we'll use a function called showMovies(). We'll create a constant to extract the desired data from the movie object. Then, we'll construct a <div> for each movie element in the DOM using innerHTML.

```javascript
function showMovies(movies) {
    main.innerHTML = ''

    movies.forEach((movie) => {
        const { title, poster_path, vote_average, overview } = movie

        const movieEl = document.createElement('div')
        movieEl.classList.add('movie')

        movieEl.innerHTML = `
            <img src="${IMG_PATH + poster_path}" alt="${title}">
            <div class="movie-info">
          <h3>${title}</h3>
          <span class="${getClassByRate(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
          <h3>Overview</h3>
          ${overview}
        </div>
        `
        main.appendChild(movieEl)
    })
}
```

The utility function getClassByRate changes the color of the vote to blue if it's equal 8 or higher, black if it's equal 5 or higher, and orange otherwise, indicating it's not recommended to see. Fill in the if-else statement appropriately: 

```javascript
function getClassByRate(vote) {
    

}
```

Here we create the listener that detects the search submit. We need a function here to handle our event object. Fill in the missing method by replacing the `XXX` with the appropriate one.

```javascript

// Get initial movies
getMovies(API_URL_HOME)

form.XXX('submit', (e) => {
    e.preventDefault()

    const searchTerm = search.value // we create a var with the search term

    if(searchTerm && searchTerm !== '') { // and if the term exists 
        getMovies(SEARCH_API + searchTerm)

        search.value = ''
    } else {
        window.location.reload()
    }
})
```
Then, whatever we type in the search area will be appended to the search API to retrieve a response. Subsequently, the page reloads with the results. Feel free to search for any movie names in the search box and press enter! Resize the browser to inspect the flex effect, review these options in the css file. 

When using an API key in JavaScript to access an API, we need to follow security best practices to protect the API key and prevent misuse. 

Here's a guide on how to securely handle API keys in JavaScript:

In summary, this application serves to demonstrate how to utilize third-party REST APIs, how to use Fetch, and how to insert data into the DOM for viewing. When our API keys are hardcoded into JS code, they become easily accessible to anyone who views the source code. Therefore, we will use a technique to secure our API calls by using Environment Variables in Server-Side Code Only. 

Without this technique, it could result in theft or misuse by attackers who may use the API key for malicious purposes, such as accessing sensitive data or performing unauthorized actions.
 
We make our JS code more secure by learning how to save our API key in a .env file and keep it secure and separate for the rest of the code on the server. To ensure that the sensitive API keys and URLs are only accesible on the server-side and not exposed to the clients we need to modify our script.js and create a server.js file. We will remove the direct usage of the API URLs and key and replace them with variables that will later inject from the server-side.

Fetching enviromental variables from the server allows more dynamic configuration and separates client-side code improving our code maintainability. The implementation also needs use of HTTPS to hide our environment variables transmitted over the network. We will explore this technique in a following lab. 

Locally on our lab machine we need to install nodejs and dotenv package in the application folder: 

```linux
sudo apt install nodejs

sudo apt install npm

npm install dotenv
```

*(Tip: More info can befound on this page: <https://www.npmjs.com/package/dotenv>)*

Follow the next steps: 

1. Create a new file in the project's directory and name it .env

2. Inside the .env file define the API key. For example use MOVIES_API_KEY. Then assign the value of the API key.

*(Tip: If we commit to a repository don't forget to add the .env to the .gitignore file to prevent the API key to be commited to the repository.)*

3. Replace the API key inside the code by using an enviromental variable. 

*(Tip: In some case we want to encrypt the .env to add more security to the implementation.)*

This setup ensures that our API key is securely loaded from the .env file and is not hardcoded in our JavaScript code. 

In the script.js remove direct usage of the API URL and replace them with variables that will later inject from the server. For example: 

```javascript
const API_URL_HOME = "{{API_URL_HOME}}";
const API_URL = "{{API_URL}}";
```

In the root folder create a server.js file to instruct how to use the API URLs and serve them to the client. The client-side JavaScript code cannot directly access the API URLs, we verify with the browser inspector tool. 

In the server.js import the Node.js modules as variables: http, fs, path, dotenv. 

Use the dotenv module to load variables from an `.env` file into a `process.env` object. With this object we ensure the store of our sensitive API key. In our code define a port for our server to listen on. FOr example: 

```javascript
const PORT = process.env.PORT || 3000;
```

Use a method to create an HTTP server that can take a callback function as an argument. This method should be invoked in every request to the server. Then determine the requested file path on the URL in the request with `fs.readFile()` This will read the requested file asynchronously. Then ensure the correct contect type for the HTTP response headers. Next step is to serve our static files such as the HTML, CSS, JS file and images. use the `fs.readFile()`. 

Finally, start the server with the `server.listen()` method for example: 

```javascript
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
Now we have an HTTP server ready to serve static files and handle users request'. Don't forget to keep the project stracture as follows: 

```html
project/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── img/
│   └── favicon.ico
│   └── logo_TMDB.svg
└── server.js
```
We access our application by going to our project directory and in the terminal run the following command: 

```linux
node server.js
```

If we are not getting any errors we can access then the application in the browser by navigating to `http://localhost:3000`

### Extras

Now we've got a basic site up and running keep working on it... here
are some ideas of where to go next:

- Make it faster, make the code clearer!
- Can we add a separate page for TV series?
- Add more information about the movies to the DOM. The database
  contains a lot more stuff!
