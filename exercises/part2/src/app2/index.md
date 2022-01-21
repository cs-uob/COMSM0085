# A complete application, part 2

There are no new videos or readings for this workshop - you should instead review anything you need to prepare for the following exercise.

You will be able to continue working on the exercise in the following week, as while there are new lectures, there are no new lab exercises.

## Exercise

Create an application similar to the one from the previous workshop, but for the elections database. The layout is up to you, but it should contain the following features:

  - In one place, the application should show a list of wards in Bristol (from the elections database). There is no need for this list ever to reload later on, as it does not change, but you should create it in react and load it with a `fetch()`, instead of just creating the HTML on the server.
  - Clicking a ward should, in another place, show the election results for this ward. The data for this should be fetched in the background with `fetch()`.
  - Implement the list of wards and the election results as separate components, to demonstrate proper state handling in react.

Some hints to get you started:

  - On [start.spring.io](https://start.spring.io/) you can create a ZIP with a template application and POM file for a spring application. You will need "MariaDB Driver", "Spring Web", and "Spring Data JPA" as dependencies.
  - Create domain classes for wards, candidates and parties based on the schema.
  - Write a simple controller that does something like listing all wards, or fetching a single ward by id - without including any candidates or parties yet (leave them off the ward class for now). Test this in your browser and check you get the JSON that you expect.
  - Create a sample react application in a separate folder, and write a component that fetches and displays a list of wards (just a list of names is fine to start with, they do not need to be links yet).

From this "MVP" onwards you can decide which data you need to pass to the client for which features, write controllers based on that, and then implement components that consume and display the data. It is probably easiest to work with two servers running while you are developing, the Java one on `localhost:8000` and the React one on `localhost:3000`.

The data set is small enough that you do not have to worry about extents too much - you can just return domain objects directly from your controllers and Jackson's automatic JSON conversion should do what you need, as long as you do not produce an infinite loop. The way to avoid an infinite loop is to make the associations in only one direction, for example a ward can have a list of candidates but a candidate object does not need a pointer back to the ward as you'll never be working with a candidate in a place where it's not clear what ward they stood in.

For some computations, like if you want to display the total number of votes cast in a ward, it is your choice whether to do them on the client or on the server. If you do this on the server, you can for example add a `getTotalVotes()` method to the ward class, then the JSON export will contain a `totalVotes` property.
