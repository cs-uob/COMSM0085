# Census and elections exercises

Here are some more advanced exercises based on the census and elections schemas from the last activity.

Your answer to each question should be a single SQL query, that is one semicolon at the end. JOINs, subqueries, WITH clauses etc. are allowed of course.
Where an identifier is given in the question you may use it, e.g. when I say "the Cabot ward (E05001979)" you can use the ward id directly and do not need to join on the ward table to look up the name, but if I say "the Green party" then you do need to join on the party table to look up the name instead of hard-coding the party id.

## Elections

![elections ER diagram](../img/elections.png)

  1. How many votes were cast in all of Bristol in the 2014 elections?
  2. How many votes were cast in the 'Windmill Hill' ward and what percentage of the electorate in this ward does this represent? Your statement should produce a table with one row and two columns called 'votes' and 'percentage'.
  3. List the names, parties and *percentage* of votes obtained for all candidates in the Southville ward. Order the candidates by percentage of votes obtained descending.
  4. How successful (in % of votes cast) was the Conservative party in each ward?
  5. Which rank did Labour end up in the 'Whitchurch Park' ward? Your statement should produce a table with a single row and column containing the answer as a number. You can assume no ties.
  6. What is the total number of votes that each party got in the elections? Your result should be a table with two columns party, votes.
  7. Find all wards where the Green party beat Labour and create a table with two columns ward, difference where the difference column is the number of Green votes minus the number of Labour votes. Your table should be ordered by difference, with the highest one first.  

## Census

![census ER diagram](../img/census.png)

  1. How many _women_ work in sales and customer service occupations and live in the Cabot ward of Bristol (E05001979)?
  2. How many _people_ work in sales and customer service occupations and live in the Cabot ward of Bristol (E05001979)?
  3. How many people work in caring, leisure and other service occupations (occupation class 6) in all of the City of Bristol CLU (E06000023)? 
  4. In the Cabot ward (E05001979), produce a table listing the names of the 9 occupation classes and the number of people in each of the classes in this ward.
  5. Find the working population, ward name and CLU name for the smallest ward (by working population) in the 2011 census.
  6. The same as the last question, but now produce a table with two rows, one for the smallest and one for the largest ward. There's no quicker way than repeating the last query twice, the question is how to stick the two "copies" together.
  7. Find the average size of a ward's working population in the London (E12000007) region.
  8. The same as the last question but now for every region - your query should produce a table with one row per region. The intention here is _not_ to repeat the above query 9 times.
  9. Produce a table that lists, for each of the 9 regions of England, the percentage of people in managerial (class 1) occupations who are women.
  10. For all CLUs in the London (E12000007) region, produce a table with three columns called `CLU`, `occupation` and `count` such that:
      * `CLU` is the CLU name.
      * `count` is the number of people of the occupation class in question in the given CLU.
      * `occupation` is the name of the occupation class.
      * Only rows with `count >= 10000` appear in the table.
      * The table is sorted by `count` ascending.
  11. Create a table with three columns `occupation`, `women` and `men` and one row per occupation class. The `occupation` column should list the occupation class names. The `women` and `men` columns in each row should list the total number of women resp. men in the row's occupation class in the whole dataset. The intention here is not to have to copy-paste a subquery 9 times.
  12. The same as question 9, but now with a 10th row in the table listing the value for all of England. You can use the string `'England'` for the region column.
