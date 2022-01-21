# Build tools: Java

In the Java world,

  - The `javac` compiler turns source files (`.java`) into `.class` files;
  - The `jar` tool packs class files into `.jar` files;
  - The `java` command runs class files or jar files.

A Java Runtime Environment (JRE) contains only the `java` command, which is all you need to run java applications if you don't want to do any development. Many operating systems allow you to double-click jar files (at least ones containing a special file called a `manifest`) to run them in a JRE.

A Java Development Kit (JDK) contains the `javac` and `jar` tools as well as a JRE. This is what you need to develop in java.

`maven` is a Java package manager and build tool. It is not part of the Java distribution, so you will need to install it separately.

You can do this exercise either on Alpine, or on your own machine where you have probably already installed Java for the OOP/Algorithms unit, and you can use your favourite editor. The exercises should work exactly the same way in both cases, there is nothing POSIX-specific here.

## Installing on Alpine

On Alpine, install the `openjdk8` and `maven` packages. Alpine's JDK does not end up on the `PATH`, presumably in case you want to have several different JDKs on the same machine, so you should run the following command and also add it to your `~/.profile`:

    export PATH="$PATH:/usr/lib/jvm/java-1.8-openjdk/bin/"

This lets you run `javac`, although you could of course also run it by calling it with the full path to the file.

## Installing on your own machine

You have probably already installed the JDK following the instructions in the OOP/Algorithms unit; it should basically resolve to 

  - download the [OpenJDK](http://openjdk.java.net/) distribution
  - unzip it somewhere
  - add the binaries folder to your `PATH`
  - set the `JAVA_HOME` variable to point to the folder where you unzipped the JDK.

To install maven, [follow these instructions](https://maven.apache.org/install.html) which again involve downloading a ZIP file, unzipping it somewhere and then putting the `bin` subfolder on your `PATH`.

Note: `JAVA_HOME` must be set correctly for maven to work.

## Running maven

Open a shell (windows CMD is fine too) and type `mvn archetype:generate`. This lets you _generate an artifact from an archetype_, which is wizard-speak for create a new folder with a maven file.

_If you get a "not found" error, then most likely the maven `bin` folder is not on your path. If you're on a POSIX system and have used your package manager, this should be set up automatically, but if you've downloaded and unzipped maven then you have to `export PATH="$PATH:..."` where you replace the three dots with the path to the folder, and preferably put that line in your `~/.profile` too. On Windows, search online for instructions how to set up the path variable, or you can drag-and-drop the `mvn.cmd` file from an Explorer window into a Windows CMD terminal and it should paste the full path, then press SPACE and enter the arguments you want to pass._

The first time you run it, maven will download a lot of libraries.

Maven will first show a list of all archetypes known to humankind (2885 at the time of counting) but you can just press ENTER to use the default, 1744 ("quickstart"). Maven now asks you for the version to use, press ENTER again.

You now have to enter the triple of (groupId, artifactId, version) for your project - it doesn't really matter but I suggest the following:

    groupId: org.example
    artifactId: project
    version: 0.1

Just press ENTER again for the following questions, until you get a success message.

Maven has created a folder named after your artifactId, but you can move and rename it if you want and maven won't mind as long as you run it from inside the folder. Use `cd project` or whatever you called it to go inside the folder.

If you're in a POSIX shell, then `find .` should show everything in the folder (in Windows, `start .` opens it in Explorer instead):

    .
    ./src
    ./src/main
    ./src/main/java
    ./src/main/java/org
    ./src/main/java/org/example
    ./src/main/java/org/example/App.java
    ./src/test
    ./src/test/java
    ./src/test/java/org
    ./src/test/java/org/example
    ./src/test/java/org/example/AppTest.java
    ./pom.xml

This is the standard maven folder structure. Your java sources live under `src/main/java`, and the default package name is `org.example` or whatever you put as your groupId so the main file is currently `src/main/java/org/example/App.java`. Since it's common to develop Java from inside an IDE or an editor with "folding" for paths (such as VS code), this folder structure is not a problem, although it's a bit clunky on the terminal.

## The POM file

Have a look at `pom.xml` in an editor. The important parts you need to know about are:

The artifact's identifier (group id, artifact id, version):

```xml
<groupId>org.example</groupId>
<artifactId>project</artifactId>
<version>0.1</version>
```

The build properties determine what version of Java to compile against (by passing a flag to the compiler). Unfortunately, the default maven template seems to go with version 7 (which for complicated reasons is called 1.7), but version 8 was released back in 2014 which is stable enough for us, so please change the 1.7 to 1.8 (there are some major changes from version 9 onwards, which I won't go into here):

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
</properties>
```

The dependencies section is where you add libraries you want to use. By default, your project uses `junit`, a unit testing framework - note that this is declared with `<scope>test</scope>` to say that it's only used for tests, not the project itself. You do not add this line when declaring your project's real dependencies.

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.11</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

The `<plugins>` section contains the plugins that maven uses to compile and build your project. This section isn't mandatory, but it's included to "lock" the plugins to a particular version so that if a new version of a plugin is released, that doesn't change how your build works.

The one thing you should add here is the `exec-maven-plugin` as follows, so that you can actually run your project:

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>exec-maven-plugin</artifactId>
    <version>3.0.0</version>
    <configuration>
        <mainClass>org.example.App</mainClass>
    </configuration>
</plugin>
```

The important line is the `mainClass` which you set to the full name (with path components) of your class with the `main()` function.

## Compile, run and develop

`mvn compile` compiles the project. The very first time you do this, it will download a lot of plugins, after that it will be pretty fast. Like `make`, it only compiles files that have changed since the last run, but if this ever gets out of sync (for example because you cancelled a compile halfway through) then `mvn clean` will remove all compiled files so the next compile will rebuild everything.

The `App.java` file contains a basic "Hello World!" program (have a look at this file). You can run the compiled project with `mvn exec:java` if you've set up the plugin as above. After you've run it the first time and it's downloaded all the files it needs, lines coming from maven itself will start with `[INFO]` or `[ERROR]` or similar, so lines without any prefix like that are printed by your program itself. You should see the hello world message on your screen.

The development workflow is now as follows: you make your edits, then run `mvn compile test exec:java` to recompile, run your tests, then run the program. (Like `make`, you can put more than one target on a command, separated by spaces.)

`mvn test` runs the tests in `src/test/java`. There is an example test already created for you (have a look).

`mvn package` creates a jar file of your project in the `target/` folder.

I assume that you will be storing your Java projects in git repositories. In this case, you should create a file `.gitignore` in the same folder as the `pom.xml` and add the line `target/` to it, since you don't want the compiled classes and other temporary files and build reports in the repository. The `src/` folder, the `pom.xml` and the `.gitignore` file itself should all be checked in to the repository.

_Exercise: make a change to the Java source code, then recompile and run with maven._

## Adding a dependency

[Thymeleaf](https://www.thymeleaf.org/) is a Java templating library. It lets you write a template file or string for example (depending on the syntax of your library)

    Hello, ${name}!

which you can later render with a particular name value. This is one of the standard ways of creating web applications, for example to display someone's profile page you would write a page template that takes care of the layout, styles, links etc. but uses template variables for the fields (name, email, photo etc.) which you render when someone accesses the profile page for a particular person. You will see this in more detail in your SPE project next year.

To use Thymeleaf or any other library, you first have to add it to your pom file. Go to [mvnrepository.org](https://mvnrepository.org) and search for Thymeleaf, then find the latest stable ("release") version. There is a box where you can copy the `<dependency>` block to paste in your pom file. The next `mvn compile` will download thymeleaf and all its dependencies.

Next, make a template file called `unit` in the folder `src/main/resources/templates` (you will have to create the folder first), and put the following lines in it:

    Unit: [(${name})]

    In this unit, you will learn about:

    [# th:each="topic: ${topics}"]
      - [(${topic})]
    [/]
    
This is thymeleaf "text" syntax, where the first line renders the value of a variable and the third-from-last line is the template equivalent of a 'for' loop that renders its contents once for each element in a list (or other collection data structure).

Thymeleaf needs to know where to find its template files, and in this example we are going to demonstrate loading resources from the classpath because that is the correct way to work with resources in a java application (there are special considerations for web applications, but they usually end up using the classpath in the end anyway).

In your Java source file, you can now do the following. First, the imports you will need:

```java
import java.util.List;
import java.util.Arrays;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
```

And the code:

```java
ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
resolver.setTemplateMode(TemplateMode.TEXT);
resolver.setPrefix("templates/");

TemplateEngine engine = new TemplateEngine();
engine.setTemplateResolver(resolver);

Context c = new Context();
c.setVariable("name", "Software Tools");
List<String> topics = Arrays.asList("Linux", "Git", "Maven");
c.setVariable("topics", topics);
String greeting = engine.process("unit", c);

System.out.println(greeting);
```

Compile and run this, and you should see:

    Unit: Software Tools

    In this unit, you will learn about:
    
      - Linux
      - Git
      - Maven

Let's look at how the code works.

  1. A template resolver is a class that finds a template when you give it a name (here: "unit"). In this case we use a resolver that loads off the classpath, so we just have to put the template files somewhere under `src/main/resources`; we tell it that we want the template files treated as text (e.g. not HTML), and that the template files are in a subfolder called `templates`.
  2. The template engine is the class that does the work of rendering the template, once the resolver has found the source file. 
  3. To render a template, you need a template name for the resolver to look up, and a context - an object on which you can set key/value parameters. In this case we're setting the key "name" to "Software Tools" and the key "topics" to a list of three topics. The names and types of keys obviously have to match what's in the template file.

_Exercise: rewrite this example to be a bit more object-oriented by creating a unit class:_

```java
public class Unit {
    private String name;
    private List<String> topics;
    public Unit(String name, List<String> topics) {
        this.name = name;
        this.topics = topics;
    }
    public String getName() { return this.name; }
    public List<String> getTopics() { return this.topics; }
}
```

_You will still need one single `setVariable` call, and in the template the syntax `[(${unit.name})]` should translate into a call to the getter._

