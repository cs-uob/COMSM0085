# Exercises

To see if you have understood the request lifecycle, here are a couple of small exercises where you can make changes to the application.

## Client-side change

A change request comes in from the users: when viewing a unit (country, ward etc.), instead of just "Contains:", the heading before the list of children should read e.g. "Contains 5 wards:".

There are two parts to this change: first, you need to count the relevant children; secondly you need to display the correct noun e.g. if you're viewing a region, it should say "Contains ... counties" whereas when viewing a country, it should say "Contains ... regions".

The easiest way to make the change is as follows:

  1. Find the file where the "Contains:" string is created (which component is this?).
  2. From the point of view of this component, how do you access the new data you need? 
  3. Make the change, then run the react development server (`npm start` in the `client/` folder) then view the page on `localhost:3000` and check that the text is correct (the database and java server must be running, of course).
  4. `npm run-scripts build` then copy the `build/` files to the `static/` folder again as you did in the set-up. The new page now should show under `localhost:8000` when you restart the java server.
  
Note that the name for the children is already stored in a variable for you. You do not need to remove the 's' if there is only one child, for this exercise.

You might ask what happens if you are viewing a ward, as wards do not have children. Convince yourself, the way the react component is written, that this case is handled safely already.

## Server-side change

A bug report comes in from a code reviewer:

> The data returned from the API call `/api/ward/ID` does not contain the parent, even though this is in the spec. For example, `/api/ward/E05000132` gives
> 
>     {"code":"E05000132", "name":"Fortune Green", "parent":null, "parentCode":"E09000007"}
>
> but according to the spec it should be 
> 
>     {"code":"E05000132", "name":"Fortune Green", "parent":{"code":"E09000007", "name":"Camden", "parentCode":"E12000007"}, "parentCode":"E09000007"}
> I also note that the server-side method for handling this call does not use the same pattern as the corresponding country, region and county methods. This may be related to the bug.

Your task is to rewrite the ward method along the same lines as the other ones to get the extent correct for this API call, and to make any other changes that this implies. You do not have to change the ward class itself, but you will need to make changes to two source code files. For each line that you change, write down separately for your own learning, or discuss with your group of students:

  1. What is the effect of this line / change?
  2. Why is it required?

You do not need to change any client code, as the client only consumes the JSON and it doesn't mind the extra fields. You will need to call the API method yourself to check that your change fixes the bug. But it's good practice to check that the whole application still works after your change!

(It would be even better practice to have unit tests for all of this, and you should write tests in your second-year software project, but for now we're teaching one thing at a time.)
