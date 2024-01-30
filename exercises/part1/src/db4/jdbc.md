# JDBC

In this activity you will learn to connect to a SQL database using Java and the JDBC classes.
JDBC (Java DataBase Connectivity) is a low-level, not particularly object-oriented mechanism for accessing a database, on top of which other systems (e.g. Hibernate ORM) can be built.

## JDBC Interfaces

The JDBC classes live in the `java.sql` package. Most methods on these classes can throw a `SQLException` which is a checked exception, meaning your code won't compile if you don't handle it. For simple programs, this means wrapping in a `RuntimeException` to terminate the program if something goes wrong:

```java
try {
    // do stuff with JDBC
} catch (SQLException e) {
    throw new RuntimeException(e);
}
```

Two comments on this pattern:

  1. In a real program e.g. web server, you of course do not want to take the server down whenever an individual method causes an error. Here you need to do something like log the error, and display an error message to that particular caller (e.g. HTTP 500 Internal Server Error) while keeping the rest of the server running. How you achieve this depends on which libraries or frameworks you are using.
  2. Most JDBC work will actually take place in try-with-resources blocks, which work the same as far as exception handling is concerned but have an extra bracketed term immediately after the `try`.

## Try-with-resources

A resource is something that you need to close exactly once when you are done with it, but only if it got properly opened in the first place. For example, in C heap memory is a resource: you acquire (open) it with `malloc`, and when you are done you must call `free` exactly once on the memory, except if `malloc` returned NULL in the first place (allocation failed) in which case calling `free` is an error. (You do check your `malloc` return value for NULL, don't you?) It is also an error to call `free` twice on the same memory, and it is a memory leak not to call it at all.

In Java, we don't have to manage memory by hand, but there are other kinds of resources:

  - Files.
  - Network connections.
  - Graphics objects in some drawing/window systems.
  - Database connections.

To help manage these, Java provides an interface `java.lang.AutoCloseable` with a single method `void close()` and the try-with-resources construction:

```java
try (Resource r = ...) {
    // do things with r here
}
```

As long as the resource implements `AutoCloseable` (it's a syntax error to use this pattern otherwise), this pattern guarantees that 

  1. If the initialisation statement (in the round brackets) fails, either by returning null or throwing an exception, then the block will never be executed.
  2. If the initialisation succeeds, then when the block exits, `r.close()` will be called exactly once, whether the block reached its end, exited early (e.g. return statement) or threw an exception.

A try-with-resources block can, but does not have to, include one or more `catch` statements, in which case they apply to the block, the initialisation statement and the implied `close()`.

You can also include more than one resource in the try statement by separating them with semicolons inside the bracketed term.

|||advanced
Earlier versions of java used the `finally` keyword to achieve something similar, but it was more challenging to get right especially if the close function could also throw an exception. Since Java 7, try-with-resources is the correct pattern to use and you should almost never need a `finally` block. You can implement `AutoCloseable` on your own classes to support this.
|||

## Opening a connection

You open a connection by calling

```java
try(Connection c = DriverManager.getConnection(connection_string)) {
    // do stuff with connection
} catch (SQLException e) {
    // handle exception, for example by wrapping in RuntimeException
}
```

The connection string is a string containing a URL such as 

    jdbc:mariadb://localhost:3306/DATABASE?user=USER&localSocket=/var/run/mysqld/mysqld.sock

When you try and open a connection, Java looks for a driver on your classpath that implements the addressing scheme (e.g. `mariadb`) that you have requested. This makes setting up the classpath a bit tricky, but we have maven to manage that for us.

However, we need to understand a bit about networking and security to make sense of that URL.

In a traditional database set-up, the database lives on its own machine (or cluster of machines) and applications connect to it over the network. To do this, by default, databases listen on TCP port 3306.

For security reasons, a competent adminstrator will set things up so that there
is a firewall preventing access to the database from any machines except those
of applications (and possibly developers and administrators), the database
machine will certainly not be available directly from the internet. Then,
applications will also need a username and password to connect to the database.
Since these passwords are used by applications, and do not need to be remembered
by humans, there is absolutely no excuse for choosing weak ones: the absolute
minimum is something with 128 bits of entropy. Computers have no problems
remembering something this long! In this case you add the extra `pass=` argument
to the connection string, and to prevent passwords being sent unencrypted over
the network (even if it's your internal network) you can also set up TLS or a
similar tunneling technology.

|||advanced
Learning how to secure things takes time but doing things like long
passwords and encryption by default is only a start.  If you want to
get clever you could muck about with behavioural checks so that if
someone starts doing something they don't normally do it triggers
logs.  How are you going to spot when your database has been attacked?
How are you going to tell when its being attacked but hasn't yet been
broken in to?  How are you going to get it back up and running before
someone comes and yells at you?

Whilst the clever stuff is all fun and good an *awful* lot of this
ultimately boils down to good old fashioned sysadmining.  Backup
everything regularly. Note what changes.  Get your logs off the
machine ASAP before they can be tampered with.  Rotate your keys
regularly because you can write a shellscript for it and whilst it
make anything more secure it'll make a compliance person happy.

For a more complete guide to managing a computer, see any of Michael W
Lucas's books.
|||

On our VM, when you set up mariadb by default, the database server and client
are both running on the same machine, so you can gain both security and
performance by not using a network connection at all - instead when you type
`mysql` it connects over a POSIX socket, another special type of file (type `s`
in `ls -l`), in this case `/var/run/mysqld/mysqld.sock`. A POSIX socket is like
a pair of pipes in that it allows bidirectional, concurrent communication
between different processes, but with an API closer to that of a network (TCP)
socket.


The point of all this discussion is that for your VM, your connection string
will look like this (all on one line with no newlines):

    jdbc:mariadb://localhost:3306/DATABASE?user=USER&localSocket=/var/run/mysqld/mysqld.sock

The `localSocket` option overrides the host/port at the start. For this to work, you need the mariadb driver and a library called JNA (Java Native Access) on your classpath, and of course your system needs to support sockets.

The more standard connection string for a TCP connection would look like this:

    jdbc:mariadb://localhost:3306/DATABASE?user=USER

Which really does connect to TCP port 3306 on localhost.

|||advanced
You can configure this on your VM if you wanted to: the main mariadb
configuration file is `/etc/my.cnf` which in our case just contains a statement
to include all files in the `/etc/my.cnf.d/` folder; in there we have
`mariadb-server.cnf` which contains the lines

    [mysqld]
    skip-networking

Remove the last line and restart the server (`systemctl restart mariadb`) and then your mariadb server (`mysqld`) will really be listening on port 3306.

We didn't notice this with the console client `mysql` because that by default tries the socket first, and then port 3306 if the socket doesn't exist. However the JDBC driver will only try exactly the options you give, and if you don't tell it to use the socket, it will try port 3306 and throw and exception if nothing is listening there.
|||

## POM file

Under `code/jdbc/` in this unit's repository you can find a minimal JDBC application that uses the `elections` database. Download this to your VM with `wget` (or get it from the unit repository, if you have cloned it there) and extract it to an otherwise empty folder (`tar -xvf jdbc-example.tar`). It contains a file `pom.xml` and a file `src/main/java/org/example/Example.java`.

In the POM file, we note the following dependencies:

```xml
<dependencies>
    <dependency>
        <groupId>org.mariadb.jdbc</groupId>
        <artifactId>mariadb-java-client</artifactId>
        <version>2.7.1</version>
    </dependency>
    <dependency>
        <groupId>net.java.dev.jna</groupId>
        <artifactId>jna</artifactId>
        <version>5.6.0</version>
    </dependency>
    <dependency>
        <groupId>net.java.dev.jna</groupId>
        <artifactId>jna-platform</artifactId>
        <version>5.6.0</version>
    </dependency>
</dependencies>
```

The first one is the mariadb JDBC driver. When maven runs a program, it automatically puts the dependencies on the classpath; if you left this off then creating the `Connection` would throw an exception.

The other two are the JNA (Java Native Access) libraries for your platform, that the driver uses to connect to a POSIX socket. If you left these off, the driver would ignore the `localSocket` option, try to connect to port 3306, and throw an exception because there is nothing listening there (unless you have configured it).

  * Run `mvn compile` in the folder with the POM file to download the dependencies and compile the example program.
  * Run `mvn exec:java` to run the program. This uses the `exec-maven-plugin` configured later in the POM file to launch the program with the main class `org.example.Example` and the correct classpath. It should print out a list of parties.
  * If you want, you can use `mvn package` to build two JAR files in `target`: one is just the compiled example class, but the more interesting one has `jar-with-dependencies` in its name and contains the compiled class and all dependencies, namely the JDBC mariadb driver and JNA (and all their dependencies). You can run this jar with `java -cp jdbc-example-0.1-jar-with-dependencies.jar org.example.Example` without using maven if you want to. This file is built by the `maven-assembly-plugin` which we have also configured in the POM file.

## SQL from Java

In the `Example.java` class, we can see an example of JDBC in action:

```java
private void readData(Connection c) {
    String SQL = "SELECT id, name FROM Party";
    try (PreparedStatement s = c.prepareStatement(SQL)) {
        ResultSet r = s.executeQuery();
        while (r.next()) {
            int id = r.getInt("id");
            String name = r.getString("name");
            System.out.println("Party #" + id + " is: " + name);
        }
    } catch (SQLException e) {
        throw new RuntimeException(e);
    }
}
```

  - The SQL command goes in a string. If we wanted to add parameters for a prepared statement, we put question marks here.
  - We create a `PreparedStatement` in another try-with-resources block: we need to close statements as soon as we are done with them, but it's ok for a program to keep the database connection open for as long as it runs.
  - In this case, we have no parameters to pass, so we execute the query to get a `ResultSet`, a "cursor" (a kind of iterator) on the results. (A `ResultSet` is also a resource, but it closes automatically when its statement closes, so we don't have to handle this ourselves.)
  - We iterate over the rows of the result and do something with them, in this case printing to standard output.
  - All these operations can throw an `SQLException`, so we catch it at the end, and because this is just a small example program, we handle it by throwing an exception to terminate the whole program.

## Result Sets

Java is an object-oriented language with a compile-time type system: if you declare that a `class Person` has a field `int age`, then the compiler will stop you from ever trying to put a string in there. JDBC cannot offer you this level protection because when you compile your Java program, you don't know what tables and fields exist in the database (even if you do know, someone could change them after the program has been compiled).
So you have to fall back to some more C-like patterns for using the database.

A result set can either be pointing at a row in the database or not. If it is pointing at a row, you can read values with the `get...` methods. If the result set is not pointing at a row, then trying to read anything throws an SQLException. The rules here are:

  - When you get the result set back, it starts out pointing _before the first row_, so reading immediately would throw an error.
  - Calling `boolean next()` tries to advance a row. If this returns true, then you have got a new row and can read from it; if you get false then you have stepped beyond the last row and it would be an error to read. (If there are no rows in your result at all, then the first call to `next()` will already return false.)
  
The correct pattern to use the result set is normally a while loop, as each time you land in the loop body you're guaranteed to have found a row:

```java
while (r.next()) {
    // we have a row, do something with it
}
```

There are however a couple of exceptions to this pattern. First, some statements like `select count(...)` will always return exactly one row - maybe the value in the row will be zero, but that's not the same thing as no row at all - so in this case you can do

```java
if (r.next()) {
    // this should always happen    
} else {
    // this should never happen
    // throw an exception or something
}
```

It would still be an error to access the one row before calling `next()`, and we are not the kind of people who ignore return values from API calls.

Another special case is if you want to do something special with the first row:

```java
if (r.next()) {
    // if we get here then there was at least one row
    // we're on the first row and can do something special with it
    do {
        // this block will be called exactly once for every row
        // including the first one
    } while (r.next())
} else {
    // if we get here then there were no rows at all
}
```

The `do-while` loop lets us write a block that is called exactly once for every row, while still letting us do something special with the first row without needing an ugly `boolean isFirstRow` flag or something like that.

Inside a result set, as long as we're sure we're on a row, we can read values from columns by declaring their name and type:

```java
int id = r.getInt("id");
```

This tells JDBC that there is a column named `id` of type `int`, and to get its value. (You get an exception if the name or type are wrong.) Other methods include `getString`, `getDouble` etc.

For this reason, in your SQL statement, you want to be clear about the names and order of the colums you're fetching:

  - If a column is something more complicated than a field, then give it an alias, e.g. `SELECT COUNT(1) AS c` then you can do `getInt("c")`.
  - Never do `SELECT *` from JDBC, always list exactly the columns you need. This both fixes the order you get them in, and is more efficient if you don't need all of them.

## Exercise 1

Modify the example program so it takes a party ID as a parameter, and displays only that party's name, or the string "No party with this ID." if there isn't one in the database.

To do this you will have to change the following:

  - `main` reads a parameter off `args`, or prints an error message if you didn't pass an argument.
  - `main` passes the parameter as an extra int argument to `readData`.
  - Set the parameter as a question mark in the prepared statement, and then bind the parameter to the statement. 
  
The command for binding a parameter is `s.setInt(pos, value)` where `pos` is the index of the parameter (question mark) in the string, _starting the count at 1 not 0_. So you simply want `s.setInt(1, value)`. Of course there are also `setString` etc. and these methods on the statement take a second parameter of the appropriate type.

The easiest way to run your command with a parameter is to build a jar with dependencies and then to call `java -cp JARFILE MAINCLASS PARAMETERS`, any further command line parameters to Java after the main class get passed as arguments to this class.

## Exercise 2

A service is a piece of code that can be called by other code and typically accesses resources for them. This exercise is about writing a `DataService` that abstracts away the JDBC access for the rest of your program.

Create the following classes in their own files (you can use private fields with public constructors/getters/setters if you prefer):

```java
public class Party {
    public int id;
    public String name;
}

public class Ward {
    public int id;
    public String name;
    public int electorate;
}

public class Candidate {
    public int id;
    public String name;
    public Party party;
    public Ward ward;
    public int votes;
}
```

Now, write a class `DataService` with the following description:

  - DataService implements `AutoCloseable`. It has one public constructor that takes a connection string and creates a `Connection` using this string, which it stores in a private field. The `close()` method closes the connection.
  - A method `public List<Party> getParties()` that returns a list of all parties in the database, by using JDBC on the provided connection.
  - A method `public Party getParty(int id)` that returns the party for this id, if there is one, otherwise null.

These methods should handle all possible cases (e.g. `getWards` must still work if there are no wards in the database). but they should not throw an SQLException. Instead, make your own exception class called something like `DataServiceException` derived from `RuntimeException` (this can be an inner class of `DataService` if you want) and wrap the `SQLException` in that.

_This is not an excuse for sloppy programmers to ignore the exceptions, by the way!_

Now, adapt the `Example` program so that

  - The main program uses the `DataService` and the domain classes (e.g. `Party`) and doesn't know about JDBC directly.
  - If you pass an id as a parameter, it fetches the party with this id (if there is one) and displays party information from the `Party` instance.
  - If you don't pass an id, it displays the list of all parties.

|||advanced
The `DataService` class is a resource, and it opens a connection in its constructor and closes it when you close the instance. This is a standard pattern and works perfectly if the programmer using it uses it in a try-with-resources block.

However, someone could create an instance, close it manually, and then try to continue using it, which would cause a `SQLException` on the connection. To handle this case by programming defensively, you could:

  1. In the close method, set the connection field to null after closing it as a sign that this instance has been closed.
  2. In all other methods, check that the connection field is not null first thing in the method and throw and exception if it is (you can write your own private method for this). According to Java conventions, the correct exception to throw in this case is a `java.lang.IllegalStateException` which means roughly _you are calling a method at the wrong time_ - in this case after closing the resource in question.
|||

## Exercise 3

Implement a `Candidate getCandidate(int id)` method on the data service too. This will require you to use a JOIN in your SQL and to create instances of all three domain classes.
