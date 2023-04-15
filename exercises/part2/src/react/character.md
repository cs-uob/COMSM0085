# Character design exercise

The final React exercise today is to write a "character design" React app. Functionality is your first priority, before design: it's ok to lay out everything in simple paragraphs one above the other.

The constraints are:

  - There are four stats, called _Charisma, Prowess, Agility_ and _Strength_.
  - You have 4 stat points to spend in total, but you may not spend more than 2 points on the same stat.
  - You should make a reusable "stat editor" component that displays the points allocated to a stat and has +/- buttons to change these, and displays the name of the stat.
  - The buttons must be enabled when you are allowed to increase/decrease the stat in question, and disabled otherwise.
  - You should also make a separate component that displays the number of stat points remaining to spend (this was not in the example in the lectures).

You can ignore the character's name for now.

The design question here is where to put the functions that access or manipulate state. For example you will probably want a function somewhere that returns the number of stat points remaining to spend.

You will also need to think about how you can make a _reusable_ stat editor component, so that you can include it four times in the app's render method. The design question here is which props you pass to the component - each of the four copies of the stat editor will need a different value for at least one of the props. The solution shown in the lectures is just one of many possibilities.
