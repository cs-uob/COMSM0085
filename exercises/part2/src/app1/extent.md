# The extent problem

On the server side, imagine a request comes in for a `Region` object.

It looks like spring, hibernate and jackson (the library that produces JSON) should be able to handle this automatically, hibernate converting a database row in to a Java object and jackson converting that to a string containing JSON, with Spring making sure the correct classes are loaded in the first place.

Unfortunately, the automatic approach assumes that there is only one way to deal with each domain class. If you can answer the question "if you load a region, do you want the counties or not?" once and for all in your application, then the automatic approach will work. However,

  - When we are viewing a region, we do want to know the counties, as we want to show a clickable list of counties to the user.
  - When we are viewing a country, we want to know the regions, but we do not care about the counties in the regions, and even less about the wards in the counties - otherwise a request for England would load the entire contents of the country, region, county and ward tables into memory all at once!

The solution in this application is to use explict _extents_, that is for each object we declare when we fetch it what properties we do or don't want to see.

The first step is to tell Hibernate not to do any joins unless told to, for example in the Region class with two `FetchType.LAZY` entries:

```java
// Region.java

@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="parent")
@JsonView(Region.class)
private Country parent;

@OneToMany(fetch = FetchType.LAZY, mappedBy = "parent")
@JsonView(Region.class)
private List<County> counties;
```

When we're fetching a region, the controller uses our own `findByIdFull` method:

```java
// RegionController.java

@GetMapping(path="/api/region/{id}", produces="application/json")
String getRegionById(@PathVariable String id) {
    Region r = repository.findByIdFull(id);
    return ModelClass.renderJSON(r, Region.class, id);
}
```

which has an annotation declaring its extent:
```java
// RegionRepository.java

@Query("SELECT r FROM Region r JOIN FETCH r.parent LEFT JOIN FETCH r.counties WHERE r.id = ?1")
Region findByIdFull(String id);
```

Here, we use HQL (Hibernate Query Language) `JOIN FETCH` to declare that when we're loading a region with this method, we want both the parent (country) and all the children (counties), but not for example the children of the children (wards) as they're not in the query. The `?1` at the end is HQL's way of doing a bound parameter for a prepared statement.

The result is now that when we're trying to display a region, we get exactly the extent of information that we need to create the links, no more and no less.
In contrast, when we're fetching a region through another query (e.g. to display a country) then the extent of that query will not load the region's children, as we don't need them.

## Extents and JSON

The problem is even more pronounced when converting to JSON, as when we are displaying a region we do not want this to happen:

```JSON
{   "code":"E12000009",
    "name":"South West",
    "counties": [
        {"code":"E06000022",
         "name":"Bath and North East Somerset",
         "parent":???} 
... ]}
```

A region countains counties (which we want to see to create the list), and those counties have parents, and their parents are regions. So what do we put for the parent of this county? It can't be a copy of the region otherwise we have created infinite recursion. JSON doesn't have a nice way to make a "pointer" back to the copy of the region we already have (which is how the problem is avoided for Java objects in memory).

We can't say either that all objects should ignore their parents, as when we're displaying a county, we need the code of the parent to make the "Back to parent" link work. But when we're displaying a region, we don't care about the parent objects of the containing counties: not only don't we need to create links for them, but we already know the code - it's the code of the region we're currently displaying.

Jackson, the JSON generation library, by default displays all properties of an object - that is, it looks for all getter methods on a class and calls all of them in turn. There are several ways this can not end up with what we want.

First, if regions have counties as children and counties have regions as parents (a so-called _bidirectional association_) then the "call all getters recursively" strategy ends up in an infinite loop (in practice, it crashes with a stack overflow).

Secondly, if we call a getter on something that Hibernate hasn't fetched yet with a JOIN, then what the getter actually returns is a Hibernate proxy object, that in turn responds to calls to its getters by firing off a new SQL query to fetch the requested data.

Hibernate's proxy objects are a good solution to simple cases of the extent problem: when fetching a region, don't load the counties by default, but load them in a separate query if someone actually tries to access them later on. Unfortunately, especially combined with a "fetch all getters" JSON renderer, this gets you the N+1 problem as we already discussed earlier. Assuming we fetch just children, not parents to avoid the infinite loop, then even if Hibernate is clever enough to use a single query to get all the counties in a region, when the JSON renderer loops over each county to get the wards (which we don't want in the first place when displaying a region!) that's one query per county, so the N+1 problem in action.

My recommended solution here is the following line in `src/main/resources/application.properties`:

```
spring.jpa.open-in-view=false
```

This turns off the proxy objects' ability to load data later on: a call to load data that was not JOINed to start with now causes an exception. This is a good thing: you will immediately notice any extent problems (because they crash your application) and you can go and adjust your HQL queries to fix the problem. You can even write unit tests to make sure all your methods run correctly, whereas there is no easy way to write a unit test for "did this method only use 1-2 SQL queries to load its data".

To really solve the problem, we have to tell jackson which properties we want in our JSON, and again the answer is "it depends": when we're displaying a region, we do want the region's counties; when we're displaying a country, we want the regions but not the counties.

In the `ModelClass` base class for our domain classes, we customise exporting to JSON:

```java
// ModelClass.java

public static <T> String renderJSON(T element, Class<T> cls, String id) {
    if (element == null) {
        throw new NoSuchElementException(cls, id);
    }
    try {
        return new ObjectMapper()
            .writerWithView(cls)
            .writeValueAsString(element);
    } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
    }
}
```

The key call here is `writerWithView(cls)` that creates a JSON writer for a particular _view_, allowing you to have more than one view per class. In this case we choose to reuse the domain classes as the views, namely, when we are viewing the contents of e.g. a region, then the view class is simply `Region`.

We can now declare attributes to have a `@JsonView`:

```java
// Region.java

@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="parent")
@JsonView(Region.class)
private Country parent;

@OneToMany(fetch = FetchType.LAZY, mappedBy = "parent")
@JsonView(Region.class)
private List<County> counties;
```

Jackson will only export an attribute if the view class is equal to, or a subclass of, the class requested in the code above so we now have the following situation:

  - When we are viewing a region, the view class is `Region` so the region's parent and children (counties) will be included in the JSON.
  - When we are viewing a country, the view class is `Country` so the parents and children of the country's regions will not be included in the JSON.

## The mystery of `getParentCode()`

There is one more trick in the region class:

```java
// Region.java

public Country getParent() { return parent; }
public String getParentCode() { return parent.getCode(); }
```

Jackson calls all the getters except ones it's been told not to, so when we're exporting a country to JSON, it won't call `getParent` on the contained regions because the `Region.parent` field is marked as `@JsonView(Region.class)`.

However, Jackson will call `getParentCode` on the regions, so the actual JSON returned for the country view ([http://localhost:8000/api/country/E92000001](http://localhost:8000/api/country/E92000001)) looks like this (with some pretty-printing):

```json
{ "code":"E92000001", "name":"England", 
  "regions": [
      {"code":"E12000001","name":"North East","parentCode":"E92000001"},
      {"code":"E12000002","name":"North West","parentCode":"E92000001"},
      {"code":"E12000003","name":"Yorkshire and The Humber","parentCode":"E92000001"},
      {"code":"E12000004","name":"East Midlands","parentCode":"E92000001"},
      {"code":"E12000005","name":"West Midlands","parentCode":"E92000001"},
      {"code":"E12000006","name":"East of England","parentCode":"E92000001"},
      {"code":"E12000007","name":"London","parentCode":"E92000001"},
      {"code":"E12000008","name":"South East","parentCode":"E92000001"},
      {"code":"E12000009","name":"South West","parentCode":"E92000001"}
  ]
}
```

The regions don't show their parent, but they do show the `parentCode`. We don't need this for the application, this feature is more for demonstration purposes.

How does this work? Doesn't the following code require the parent to be loaded?

```java
public String getParentCode() { return parent.getCode(); }
```

The answer is no, for two reasons. First, the reason that these regions were fetched here at all is that they were children of the current country. Hibernate knows that the `country.regions` and `region.parent` match up (we told it with JPA annotations, after all) so it could figure out the parent in this case anyway.

For the second reason, try and manually visit the page [localhost:8000/api/regions](localhost:8000/api/regions) which is not used by the react client. This is handled by `RegionController.getAllRegions`:

```java
@GetMapping("/api/regions")
List<Region> getAllRegions() {
    return repository.findAll();
}
```

This in turn calls the `RegionRepository.findAll` method which is implemented inside JPA/Hibernate itself (you won't see it in the `RegionRepository` class itself, it's declared on the parent class `JpaRepository`). You can see the SQL query it ends up producing in the log output:

```SQL
select region0_.code as code1_2_, 
       region0_.name as name2_2_, 
       region0_.parent as parent3_2_
from Region region0_
```

There is no JOIN with the parent (country) class going on here. In the JSON output,
which does not use the `ModelClass` method of selecting an extent explicitly,
it just returns a `List<Region>` which spring takes as a cue to pass through
jackson to create JSON (shown here pretty-printed and abbreviated):

```JSON
[ { "code":"E12000001",
    "name":"North East",
    "parent":null,
    "counties":null,
    "parentCode":"E92000001"
  },
  { "code":"E12000002",
    "name":"North West",
    "parent":null,
    "counties":null,
    "parentCode":"E92000001"
  },
  /* and the others ... */
]
```

The parent and counties attributes are `null` because we haven't explicitly excluded them, yet jackson also can't fetch them because they were not JOINed in the original query and we have turned off "open session in view" which would allow them to be fetched when jackson asks for them. Jackson and hibernate work well enough together not to cause a crash here: jackson notices that the objects are hibernate proxies and first asks behind the scene "are these attributes available?" before trying to call e.g. `parent.getName()`.

So why does the following succeed? Think about it for a few moments.

```java
// Region.java

public String getParentCode() { return parent.getCode(); }
```

The answer is that the parent's code, but not the other attributes, is stored as a foreign key in the Region table, so the SQL query above actually does fetch the parent code.
When hibernate creates a Region object and the parent / counties are not included in a JOIN, it will replace the parent and counties with hibernate proxy classes that roughly do the following:

  - If "open session in view" (configuration line `spring.jpa.open-in-view` in `application.properties`) is turned on (this is the default) then the proxies run another SQL query to get the required data whenever someone asks for it, e.g. calls `getName()` on the parent proxy.
  - If "open session in view" is turned off, and someone asks for data that is not loaded yet, throw an exception.
  - Alternatively, libraries like jackson who notice the proxy objects can also ask "is this data available?" which is why the JSON returns "null" for the parent / counties in this case.

But since the parent code, unlike the rest of the parent data, was loaded in the original query, hibernate actually creates a proxy object here that stores this code and returns it if someone calls `getCode()` on the parent proxy. Only on the other methods like `getName()` where the data is not loaded yet, do you get an exception.

## Conclusion

The learning point here is that when you have a one-to-many relationship and you're working with an object on the side with the foreign key, then it's no extra effort to keep the foreign key around. There are two reasons you might want to do this.

The first is to avoid infinite recursion (or finite but unnecessary bloat) when transferring a collection of objects via JSON or some other mechanism that does not have a concept of "pointers". For example, when sending a country and its regions via JSON, we can't have the regions contain a copy of the country in their parent field (as that would cause infinite recursion), and JSON itself does not support a "pointer" data type, but we can emulate this by having the regions contain the country's code.

If the data is being put back into proper objects on the client side (e.g. we had JavaScript classes for countries and regions) then the foreign keys could be used to set up "pointers" (technically: object references) correctly again.

Secondly, foreign keys can be used for navigation. A common pattern is to include the foreign key in a link (in our case "back to parent") as an option for the user. In other words, to provide a "navigate to parent" feature, you do not have to fetch/join the parent object and then read its primary key: you can just use the foreign key that you already have, saving a JOIN. Clicking a navigation link that was created using a foreign key ends up fetching the object (in this case a country) with the matching primary key.
