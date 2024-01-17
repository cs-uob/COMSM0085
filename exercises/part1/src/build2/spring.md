# Spring

The [Spring framework](https://spring.io/) helps you develop modern
web / cloud / microservice / serverless / _(insert buzzword here)_
applications in Java. Netflix, for example, uses it.  

|||advanced
Jo is cantankerous and old and so doesn't use it and prefers to
either use CGI scripts, or a rather weird old thing called inetd.
They're out of fashion nowadays, but worth reading up on---especially
inetd which can save you a bunch of code for a simple webapp.
|||

## Vagrant preparation

Web applications listen to a port (normally TCP port 80 for HTTP, 443
for HTTPS in production; 8000 or 8080 while in development). If you
are following these exercises on your host OS, you can skip this
preparation. If you are in a VM on vagrant, then although you can quickly get an application to work on port 8080 inside the VM, you need one extra step to make it accessible from your browser outside the VM.

Add the line

    config.vm.network "forwarded_port", guest: 8080, host: 8080

to your Vagrantfile just below the `config.vm.box` line, then restart the VM by logging out and doing `vagrant halt` then `vagrant up`. Your firewall may pop up a warning and ask you to approve this.

Now, while the VM is running, any connection to port 8080 on your host OS will be sent to the VM (this also means that if you're doing web development on the host, you can't use port 8080 for anything else while the VM is up - if you need port 8080, just pick another port number for the `guest` part).

## Spring set-up

Spring wants to make setting up a project as easy as possible, so go to [start.spring.io](https://start.spring.io/) and you get a graphical interface to create a spring/maven project.

  * Pick "Maven Project" and "Java language".
  * Enter a group id and artifact id (you can use `org.example` and `project`).
  * Make sure "packaging" is on JAR and "Java" (version) is on 17 (or
    whatever you have installed).
  * Under _Dependencies_ on the right, click "Add Dependencies" and add "Spring Web".
  * Click "Generate" at the bottom, this downloads a ZIP of a project (complete with pom.xml file and folders) that you can unzip either on the host or in the VM.

To unzip the file in the VM, place it in the same folder as your
Vagrantfile on the host, then inside the VM it will appear in the
`/vagrant` folder. The command `unzip` is your friend.  Install it if
not already installed.

This project uses Spring Boot, a library and plugin to help with building and running Spring applications, so the only maven command you need is

    mvn spring-boot:run

which will recompile if necessary, and then run the application. Once it's running, you can go to [localhost:8080](http://localhost:8080) in a browser on your host OS (whether the Spring application is running on the host, or inside the VM as long as you've set up the port forwarding as described above). You will see an error message as there's no pages yet, but the application is running. Stop it with Control+C.

## Development

Open the source file under `src/main/java/...`. I called mine "project" so the class is `ProjectApplication`, but the name doesn't matter.

  - Add the `@RestController` annotation to the application class.
  - Create a method as follows:

```java
@GetMapping("/")
public String mainPage() {
    return "Hello, Software Tools!\n";    
}
```

  - Add the imports for the two annotations you've just used; they're both in the package `org.springframework.web.bind.annotation`.

Now you can re-run the project with maven, go to `localhost:8080` on your browser and you should see the message. Congratulations - you've built your first Java/Maven/Spring web application!

_You can also access the web page from the terminal on your host machine with `wget localhost:8080 -q -O /dev/stdout` which should print "Hello, Software Tools!" on your terminal. If you just do `wget localhost:8080` it will save the output to a file with the default name `index.html`._

The `@GetMapping` means, when a HTTP GET request comes in for a URL with the path in the annotation (such as a browser would send), then run this function. For example, accessing `localhost:8080/pages/index.html` would look for a mapping `/pages/index.html` where as the `/` mapping covers when you type no path at all. You can start to see that URL paths on the web are modelled on POSIX paths as you learnt in this unit, with forward slashes and a concept of a "root folder" `/` which is what gets returned when you type a website's name in your browser without a path on the end.

You've seen that build tools like maven automate the process of downloading the libraries your project needs and compiling your project. The Spring Framework automates (as far as possible) the process of running these libraries when your application starts, and getting them all to work nicely together (there is a _lot_ going on in the background from a web request arriving to your function being called to get the page contents).
The obvious next step would be to use thymeleaf to render HTML templates to make proper pages. This is indeed something you'll learn about later in this unit and in your second-year software project next year, but there are a few more steps you'll need to know to do this, and I don't want to go into that today - that's quite enough material for one workshop.
