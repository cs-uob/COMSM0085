# Explore the database

Open the virtual machine and type `mysql`. Assuming you have installed the database correctly as in the previous activity, you should see the prompt `MariaDB [(none)]>` which shows that you are connected to a database server but you have not selected a database yet.

Have a look at the databases that exist with the command

```
SHOW DATABASES;
```

Like all SQL commands, it needs a semicolon at the end. You should see four databases including `census` and `elections`. Let's select one of them:

```
USE elections;
```

SQL keywords like `USE` are not case-sensitive, but it is convention to write them in all upper case. SQL names of tables, columns etc. like `elections` however are case-sensitive. Your prompt should now show `MariaDB [elections]>`.

Have a look at the tables in this database with

```
SHOW TABLES;
```

You should see `Candidate`, `Party` and `Ward`. Let's have a look at one:

```
DESCRIBE Candidate;
```

The output will look like this:

    +-------+--------------+------+-----+---------+----------------+
    | Field | Type         | Null | Key | Default | Extra          |
    +-------+--------------+------+-----+---------+----------------+
    | id    | int(11)      | NO   | PRI | NULL    | auto_increment |
    | name  | varchar(100) | NO   | UNI | NULL    |                |
    | party | int(11)      | YES  | MUL | NULL    |                |
    | ward  | int(11)      | YES  | MUL | NULL    |                |
    | votes | int(11)      | YES  |     | NULL    |                |
    +-------+--------------+------+-----+---------+----------------+

The first two columns tell you the names and types of columns in this table. The third column (Null) tells you if NULL values are allowed in this column. The Key column tells us that id is the primary key (PRI), name has a unique constraint (UNI), party and ward are foreign keys (MUL) and there are no key constraints at all on votes.

For even more information, try this:

```
SHOW CREATE TABLE Candidate;
```

The output is a bit messy but it shows you (more or less) the statement used to create the table. From here we can read off the details of the foreign keys:

    CONSTRAINT `Candidate_ibfk_1` FOREIGN KEY (`party`) REFERENCES `Party` (`id`)
    CONSTRAINT `Candidate_ibfk_2` FOREIGN KEY (`ward`) REFERENCES `Ward` (`id`)

So the `party` column is a foreign key pointing at the `id` column in the `Party` table.

Now let's look at some data. This command shows you all entries in the Candidate table:

```
SELECT * FROM Candidate;
```

There are 141 entries. Looking at the first one:

    +-----+--------------------------------+-------+------+-------+
    | id  | name                           | party | ward | votes |
    +-----+--------------------------------+-------+------+-------+
    |   1 | Patrick Dorian Hulme           |     1 |    1 |    16 |

The party and ward ids on their own don't tell us much, but as they are foreign keys we can use them to join on the tables that do contain this information:

```
SELECT * FROM Candidate
INNER JOIN Party ON Party.id = Candidate.party
INNER JOIN Ward ON Ward.id = Candidate.ward;
```

On the MariaDB prompt, if you don't end with a semicolon then the program assumes you want to type a command over multiple lines, and shows the continuation prompt `->` for the next ones. This also allows you to copy-paste multi-line commands from a text editor into the MariaDB client. Ending a line with a semicolon executes the query and drops you back to the main prompt.

You will now see a much longer listing, starting like this (I have shortened some columns):

    +-----+----------------------+-------+------+-------+----+--------------+----+-----------+------------+
    | id  | name                 | party | ward | votes | id | name         | id | name      | electorate |
    +-----+----------------------+-------+------+-------+----+--------------+----+-----------+------------+
    |   7 | Matthew Simon Melias |     7 |    1 |  1067 |  7 | Conservative |  1 | Avonmouth |       9185 |

The first thing to note is that the results are no longer in the same order: P. D. Hulme is no longer at the top. Unless you tell the database that you want a particular order, it is allowed to choose its own one and depending on what joins you do, this might change.

There are several columns here named id, one from each of the tables - in general, doing `SELECT *` on a joined table gets you more data than you need.
This would be a nicer query unless you're actially interested in the ids:

```
SELECT Candidate.name AS name,
Party.name AS party,
Ward.name AS ward,
votes,
electorate
FROM Candidate
INNER JOIN Party ON Party.id = Candidate.party
INNER JOIN Ward ON Ward.id = Candidate.ward;
```

Here is the start of the output that I get:

    +----------------------+--------------+-----------+-------+------------+
    | name                 | party        | ward      | votes | electorate |
    +----------------------+--------------+-----------+-------+------------+
    | Matthew Simon Melias | Conservative | Avonmouth |  1067 |       9185 |

Explore the elections database a bit to get a feel for how the data is structured.
For example, what party and ward did Patrick Dorian Hulme from above stand for?
What is the schema of the elections database - you might want to draw a diagram?
