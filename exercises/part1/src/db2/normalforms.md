# Normal Forms

For this exercise, you may want to work in groups. There are two schemas, for both of which you have to decide which normal form(s) they are in, and how you would change the schemas to be in 3NF (BCNF if possible).

The standard way of doing this is:

  1. Identify the candidate key(s) in every table. 
  2. From this, deduce the key and non-key attributes in every table. 
  3. Find the functional dependencies (FDs) in each table.
  4. Determine which normal forms from (1NF, 2NF, 3NF, BCNF) the schema does or does not satisfy.
  5. If the schema is not in BCNF, normalise it as far as possible by splitting tables using Heath's Theorem on the FDs that are causing the problem.

## Schema 1

A school's database looks like this (it was set up by someone more used to spreadsheets): 

| stuId | name | gender | unit        | grade |
|-------|------|--------|-------------|-------|
| 101   | Fred | M      | Mathematics | 75    |
| 101   | Fred | M      | German      | 65    |
| 101   | Fred | M      | English     | 90    |
| 102   | Sam  | X      | Mathematics | 60    |
| 102   | Sam  | X      | English     | 60    |
| ...   | ...  | ...    | ...         | ...   |

stuId is a student id that is unique per student. Students' names are not required to be unique, i.e. you can have two 'Fred's in the school. Gender is one of {M, F, X}. For each student and each unit they take, there is one row containing among other things the student name, unit name and the grade (0-100) that the student got on this unit. In the example above, we can see that Fred took three units (Mathematics, German and English). No two units have the same name but a unit name can appear several times in the database since many students can take the same unit. The first row of the example tells us that there is a student called Fred with id 101, who is male, and took the Mathematics unit and got a grade of 75 on it. 

## Schema 2

The CIA world factbook contains geographical, political and military information about the world. Here is part of one table listing principal cities from 2015:

| *city      | country          | pop   | co_pop | capital |
|------------|------------------|------:|-------:|---------|
| ...        | ...              | ...   | ...    | ...     |
| Paris      | France           | 10.8M | 66.8M  | yes     |
| Lyon       | France           |  1.6M | 66.8M  | no      |
| Marseille  | France           |  1.6M | 66.8M  | no      |
| Papeete    | French Polynesia |  133K |  285K  | yes     |
| Libreville | Gabon            |  707K |  1.7M  | yes     |
| ...        | ...              | ...   | ...    | ...     |

We will assume for this exercise that city names are globally unique and therefore the "City" column has been chosen as the primary key for this table. The "pop" column lists the city's population and the "co_pop" lists the population of the country in which the city is located (with abbreviations K = 1000, M=1000000). The "capital" column is a Boolean yes/no value that is set to "yes" for exactly one city in each country. (While the capital is included in the table for every country however small, non-captial cities are only included if they are of international significance.)
