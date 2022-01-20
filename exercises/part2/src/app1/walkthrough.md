# Walkthrough

Here is a quick overview of what happens when the application loads and you click first _South West_ then _Details_.

You should look at the mentioned code snippets as you follow along and make sure you understand what they do.

## The first screen

  1. When you open `localhost:8000` in your browser, a HTTP request for `/` goes to the Java server. If there were a controller configured for this URL pattern, it would now fire, but there isn't so spring falls back to serving `src/main/resources/static/index.html` if it exists as this is by convention the default file name to show. This file does exist, so it gets sent to the browser.
  2. This file came from `client/build/index.html` which is the compiled version of `client/public/index.html`. There is not much to see here except a `<div id="root">` which is where the React application will be loaded (the necessary script tags get added when React compiles the file). If you watch the network tab when you open `localhost:8000` you will see requests for several css and js files, followed by a request of type `fetch` for `E92000001` which is the React app loading the country data to show.
  3. When the React scripts on the page load, it runs the compiled version of the code in `client/src/App.js`. The `App.render()` method creates the navigation bar at the top (this is a standard Bootstrap component) and two custom elements called `OverView` and `UnitView` (in their own files), passing along some state. The initial state of the app is set in its constructor.
  4. Once the component is loaded, the `OverView.componentDidMount()` function fires. This just delegates to `_fetchData()`. Here we fetch the country data: `App.state.overview` starts out at `country` and `App.state.overviewCode` starts out at `E92000001`. These are passed as props to the `OverView`, with names of `type` and `code`, which are referenced in the `fetch()` call in `componentDidMount`. The effect is to send off a request for `http://localhost:8000/api/country/E92000001`.
  5. You can (and should) paste the above URL in a new browser tab, and you will see some JSON as a result. On the server side, the request is handled by the `CountryController.getCountryById` function (in `src/main/java/uk/ac/bristol/cs/application/controller`) as the path is declared in its `@GetMapping` annotation.
  6. The `CountryController` first calls `getWithChildren` on the `repository.CountryRepository`. This is just an interface - the implementation is provided by Hibernate, automatically triggered by Spring - but the important part here is the `@Query` annotation that explains the extent of the data to fetch. This is HQL, Hibernate's query language, and we tell it to fetch not only the country but also all its regions.
  7. This returns an instance of `model.Country` which is more or less a simple Java class with properties `name`, `code` and `Regions`. Hibernate is in charge of creating the instances and the JPA annotations such as `@OneToMany` explain how it should process JOINs to fetch data from other classes (such as the regions).
  8. Back in the controller, the next thing we do is render the country as JSON. We will discuss later why we are doing it this particular way, but the code is in `model.ModelClass.renderJSON` so it can be reused for different classes.
  9. The JSON object now gets sent to the client. If you queried the URL yourself in a new tab, you just see the JSON at this point. If React queried it with `fetch()`, it can now check - back in `OverView._fetchData()` - whether the call was successful, and if so run `this.setState({loaded: "yes", item: result})` to store the object in its state (the previous call to `r.json()` decoded the JSON to a JS object, which is now in `result`).
  10. The `setState` causes react to call `render()` which, now that `this.state.loaded` is `yes`, renders a the country information including a list of regions, pulled from `this.state.item` which is where the decoded JSON object is stored.

## Navigating to a Region

Click on one of the region entries. The following happens:

  1. The link (actually a button styled as a link, for accessibility reasons) has a click handler `onClick={() => this.navigate(i.code, false)}` (created in `OverView.children()`, where `i` is the item to navigate to, e.g. the region).
  2. `OverView.navigate` calls `App.navigate` through `this.props` (the `App` passes a  reference to its own `navigate` method when it creates the `OverView`).
  3. `App.navigate` contains a state machine that decides, based on the current state (are we viewing a country, region, county or ward) and the `isParent` flag (are we navigating to a child or returning to the parent) what type of object we are navigating to. The only option when we are coming from the country view is a region, so this is set up correctly with `setState` and the code of the new item is set in the app state.
  4. This state change causes `App.render` to run, which changes the props on the overview component.
  5. The props change causes `OverView.componentDidUpdate` to be called with the old props for comparison (the new ones are already in `this.props`). If there has been a code change, then we (a.) immediately set the state back to "not loaded", which triggers a `render()` call and (b.) call `_fetchData()`, which asynchronously loads the new data and eventually calls `setState` again, triggering another `render()` this time with the new data.

**Exercise**: Return to the countries view using the _Back to parent_ link, then shut down the Java server (so that futher API calls will fail). Then click on a region. You should immediately see a "Loading ..." message, followed around a second or so later by "Network error". Explain, with the help of the `OverView` code, how this happens.

## Details View

**Exercise**: based on what you have learnt above, sketch the steps that happen when you click on _Details_ to display the occupation data for the selected geographic unit. Look at both the client and the server code. The server-side methods start in `StatisticsController`.
