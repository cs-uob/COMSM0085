# Hibernate

JDBC lets us connect to a database and pull out data, but we have to do a lot of manual coding to check and convert types, deal with result sets and exceptions etc. We can abstract away most of this into a service class like the `DataService` at the end of the last page, but we still have to write the data service - even though it is a lot of boilerplate code that we almost need to copy-paste from a template for each new class. We could write a script that given an ER diagram in some machine-readable format, automatically generates a data service for this class to automate all this - or we could use Hibernate to do this for us.

Hibernate is an object-relational mapping (ORM) framework, that is to say it automatically generates an advanced form of data service at runtime which includes many extra features such as sessions, transactions, caches and connection pools. It implements the Java Persistence Api (JPA), an API that in turn builds on JDBC for the purpose of implementing ORMs. Actually Hibernate has its own features that go beyond JPA, such as its own query language.

In a real application, you will be using an ORM most of the time, but you can fall back to SQL for more advanced queries that the ORM cannot support easily.

## Example application - set-up

There is an example application in `code/orm` in the unit repository.

The POM file simply has an extra dependency on Hibernate:

```xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>5.4.27.Final</version>
</dependency>
```

Hibernate's configuration lives in `src/main/resources/hibernate.cfg.xml`. Hibernate uses a _Session Factory_ to create sessions, in which you can make queries:

```xml
<?xml version = "1.0" encoding = "utf-8"?>
<!DOCTYPE hibernate-configuration SYSTEM 
"http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
  <session-factory>
    
    <!-- These properties set up the database connection. -->
    <property name="dialect">org.hibernate.dialect.MySQLDialect</property>
    <property name="connection.url">jdbc:mariadb://localhost/elections?localSocket=/var/run/mysqld/mysqld.sock</property>
    <property name="connection.username">vagrant</property>
    
    <!-- Don't use this in production, use a connection pool instead. -->
    <property name="current_session_context_class">thread</property>

    <!-- Display generated SQL on the console. -->
    <property name="show_sql">true</property>

    <!-- The classes to map to database tables. -->
    <mapping class="org.example.Candidate" />
    <mapping class="org.example.Party" />
    <mapping class="org.example.Ward" />
    
  </session-factory>
</hibernate-configuration>
```

  - The _dialect_ selects the SQL dialect to speak to the database, in this case _MySQL_ (there's no separate MariaDB one because the two are for all practical purposes identical).
  - The connection string lives in `connection.url`, minus the username/password because there are separate properties for these. Note though that we have included the socket option here.
  - Username and, if you need it, password go in separate properties.
  - The connection pool is really important for performance in real applications, but we don't bother with that here and just say one connection per thread (we don't use multiple threads in our program so it doesn't matter as much).
  - `show_sql` is a debuging property that prints all generated SQL to standard output. This is useful to know about when debugging your own applications.
  - Finally, we list all the classes we want Hibernate to take care of. In SPE, you are going to use the Spring Framework which takes care of this automatically, but for now we're listing them all.

The classes themselves are standard Java value classes (private fields, public getter/setter) decorated with JPA annotations to explain to Hibernate how they work:

```java
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Party {
    @Id private int id;
    private String name;
    
    public Party() {}
    
    public int getId()      { return id; }
    public String getName() { return name; }

    public void setId(int id)         { this.id = id; }
    public void setName(String name)  { this.name = name; }
}
```

  - `@Entity` means this is something that maps to a table in the database. By default, Hibernate guesses the table name from the class name, but you could change this with a parameter e.g. `@Entity(name="Parties")`.
  - `@Id` indicates the primary key.

The candidate class is a bit more interesting as it has foreign keys:

```java
@ManyToOne 
@JoinColumn(name = "party")
private Party party;
```

  - `@ManyToOne` tells Hibernate that this is a foreign key for a many-to-one relationship (there is also `@ManyToMany`).
  - `@JoinColumn` sets the name of the foreign key column, as the default here would be `party_id`.

## Example application - querying

Let's look at the main class (Example.java). First, Hibernate uses a session factory to manage its own database connections and sessions:

```java
import org.hibernate.SessionFactory;
import org.hibernate.Session;
import org.hibernate.cfg.Configuration;

public class Example implements AutoCloseable {

  SessionFactory sessionFactory;

  public Example() {
    sessionFactory = new Configuration().configure().buildSessionFactory();
  }

  public void close() {
    sessionFactory.close();
  }

  // ...
}
```

You get one from the global `Configuration` class, to which you could pass parameters to override the ones in the XML file if you wanted to (this would let you change settings in response to command line arguments, for example). A session factory is a resource, so we make our own example class a resource too which lets us run it like this:

```java
public static void main(String[] args) {
    try (Example example = new Example()) {
        example.run();
    }
  System.out.println("Done.");
  System.exit(0);
}
```

The exit command at the end makes sure the program exits even if Hibernate still has a background thread running.

In the `run()` method, we use a Hibernate session, which manages a database connection:

```java
try (Session session = sessionFactory.openSession()) {
    // code
}
```

We then have three examples of using Hibernate.

### Loading an entity by ID

```java
Party p1 = session.get(Party.class, 1);
System.out.println("    The party with id=1 is: " + p1.getName());
```

To fetch an instance by id, we just call `get` on the session with the class we want and the id. Passing the class both tells Hibernate which table to load from, and it tells the compiler what type of object to return - the way Java generics work, this lets us assign the result to a `Party` variable directly without having to do a cast.

### Loading with a query

```java
TypedQuery<Ward> query = session.createQuery("FROM Ward", Ward.class);
List<Ward> wards = query.getResultList();
System.out.println("  Wards:");
for (Ward ward : wards) {
    System.out.println("    " + ward.getName());
}
```

A `TypedQuery` object takes a string in HQL, Hibernate's own query language (based on SQL) and the class of the object to return - this is so that the Java compiler can figure out the return type. `getResultList` returns all results as a list.

|||advanced
The `TypedQuery` interface is part of JPA and is declared roughly as follows:

```java
interface TypedQuery<T> {
  // ...
  List<T> getResultList();
}
```

This use of generics allows the compiler to be sure that the return type matches the type parameter you gave when you created the query. Of course, you don't create it directly but you ask for a query object from the Hibernate session, but behind the scenes there's an [org.hibernate.query.internal.QueryImpl<T>](https://docs.jboss.org/hibernate/orm/5.2/javadocs/org/hibernate/query/internal/QueryImpl.html) as well as many other Hibernate-related implementation classes.

These classes could take the type parameter as an argument to their constructor, but if you [look at the sources](https://github.com/hibernate/hibernate-orm/blob/master/hibernate-core/src/main/java/org/hibernate/query/internal/QueryImpl.java), they don't: it seems that Hibernate does a cast internally to get the types right, which is safe as long as the Hibernate developers know what they're doing.
|||

### Queries with joins and parameters

For a more involved example, we look at the following:

```java
TypedQuery<Candidate> q = session.createQuery("FROM Candidate c WHERE c.party.name = :name", Candidate.class);
q.setParameter("name", "Labour");
List<Candidate> candidates = q.getResultList();
System.out.println("  Labour Candidates:");
for (Candidate c : candidates) {
    System.out.println("    " + c.getName() + " (" + c.getWard().getName() + ")");
}
```

HQL, like SQL, allows a WHERE clause to filter results. It also allows prepared statements, but goes one better than JDBC in that parameters can have names. You declare a parameter with a colon in the query string (`:name`) and then use `setParameter(name, value)` to bind it - this method is written so that it can take a value of any type, presumably with a combination of overloading for int/float types and `Object` for everything else.

Hibernate will automatically do the JOINs necessary to fetch the party associated with each Candidate, the SQL it runs for this query looks like this on my machine:

```SQL
select party0_.id as id1_1_0_, party0_.name as name2_1_0_ from Party party0_ 
where party0_.id=?

select candidate0_.id as id1_0_, candidate0_.name as name2_0_, 
candidate0_.party as party4_0_, candidate0_.votes as votes3_0_, 
candidate0_.ward as ward5_0_ from Candidate candidate0_ 
cross join Party party1_ where candidate0_.party=party1_.id and party1_.name=?
```

Hibernate has decided to do two queries here (maybe in parallel, so the order the statements are printed on the terminal may not be accurate). The first one is because if there is no party with the supplied name, then Hibernate can stop and return an empty list; if there is then it continues with the second query to join the two tables.

## The N+1 problem

Note that in the queries above, Hibernate does not fetch the ward names. It doesn't matter here because they are already in Hibernate's cache from the previous query. However, if you comment out the first two queries and leave only the third one (lines 41-50 in Example.java), something horrible happens:

```SQL
select candidate0_.id as id1_0_, candidate0_.name as name2_0_, candidate0_.party as party4_0_, candidate0_.votes as votes3_0_, candidate0_.ward as ward5_0_ from Candidate candidate0_ cross join Party party1_ where candidate0_.party=party1_.id and party1_.name=?
select party0_.id as id1_1_0_, party0_.name as name2_1_0_ from Party party0_ where party0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
select ward0_.id as id1_2_0_, ward0_.electorate as electora2_2_0_, ward0_.name as name3_2_0_ from Ward ward0_ where ward0_.id=?
```

Hibernate is firing off one query per ward! This is called the N+1 problem, because one HQL query that returns N results ends up producing N+1 SQL queries, which is horribly inefficient expecialy for large N.

Looking at the loop structure:

```java
TypedQuery<Candidate> q = session.createQuery("FROM Candidate c WHERE c.party.name = :name", Candidate.class);
q.setParameter("name", "Labour");
List<Candidate> candidates = q.getResultList();
System.out.println("  Labour Candidates:");
for (Candidate c : candidates) {
    System.out.println("    " + c.getName() + " (" + c.getWard().getName() + ")");
}
```

From the query itself, it is not clear to Hibernate whether ward names will be needed or not, so Hibernate does not JOIN them by default which would be more efficient if you don't actually need them. In the for loop at the bottom however, you do access the names, so on every pass through the loop, Hibernate is forced to run a new query to get the name of the relevant ward.

|||advanced
How does Hibernate trigger a query off a simple `.getWard().getName()`, that you have implemented yourself in the Candidate and Ward classes?

The answer is that instead of actual Candidate objects, Hibernate creates a proxy subclass of Candidate at runtime and returns instances of this instead. These proxy objects have `getWard()` overridden to fire off another query if, and only if, they are actually called.
|||

The solution here is to tell Hibernate at query time that you'll need the wards:

```java
TypedQuery<Candidate> q = session.createQuery("FROM Candidate c JOIN FETCH c.ward WHERE c.party.name = :name", Candidate.class);
```

This is HQL for "I'm going to use the wards, so please do a JOIN to load them too". And Hibernate now uses a single query for the Candidates again:

```SQL
select party0_.id as id1_1_0_, party0_.name as name2_1_0_ from Party party0_ where party0_.id=?

select candidate0_.id as id1_0_0_, ward1_.id as id1_2_1_, candidate0_.name as name2_0_0_,
candidate0_.party as party4_0_0_, candidate0_.votes as votes3_0_0_,
candidate0_.ward as ward5_0_0_, ward1_.electorate as electora2_2_1_,
ward1_.name as name3_2_1_
from Candidate candidate0_
inner join Ward ward1_ on candidate0_.ward=ward1_.id
cross join Party party2_
where candidate0_.party=party2_.id and party2_.name=?
```

There is another way to solve this problem: if every time you load a Candidate, you want the ward name to be loaded as well, then you can declare this on the JPA annotation:

```java
@ManyToOne(fetch = FetchType.EAGER)
```

## Exercise 1

Implement a JPA/Hibernate example application for the census database using the Country, Region, County and Ward tables (ignore Statistic/Occupation for this exercise). You could implement the following in your main program for example:

  - Given a ward code, load the ward and print out all related information (ward name, county name etc.).
  - Given a ward name, print out all the counties that have a ward with that name.

Pay attention to avoiding the N+1 problem in the second case.

## Exercise 2

What you have learnt so far will allow you to navigate upwards in the hierarchy, e.g. given a ward you can find its associated county. This exercise is about the other way round: given a county object, you want to find all wards in it.

To do this, add the following property to your County class:

```java
@OneToMany(mappedBy = "county")
private List<Ward> wards;
```

The argument to `mappedBy` must be the field name of the field in the Ward class that contains the county reference - you might have called it `parent` or something else in your class.

Then, add a getter and setter for this list property.

You have now created what is called a _bidirectional association_: a ward contains a county property, and a county contains a list of wards. You can navigate in both directions in your Java code.

Write a query that loads the City of Bristol county (E06000023) and prints a list of all its ward names with a Java for loop starting from the county object. Make sure you write your HQL query so that you don't cause an N+1 problem here.

This example also helps to explain why we don't make everything eager fetched by default: if you did that with bidirectional associations, then loading any object at all would load the entire database into memory!
