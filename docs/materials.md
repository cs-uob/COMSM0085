# Course materials

The contents of this course are hosted as a git repository on GitHub, at
[github.com/cs-uob/COMSM0085](https://github.com/cs-uob/COMSM0085). 

You can ```git clone``` the repository (you'll learn what this means in week 13) to obtain an
offline copy. Following that, you can ```git pull``` (you'll learn this too) to see if there have
been any updates. The main page for the website is `docs/README.md`, and the subpages for different
parts are fully built HTML/CSS websites. Of course, you can also just use the website online.

Videos are hosted externally on the university systems, but we are using a trick that allows you (at
the moment) to access the raw mp4 files. You can download them for offline watching if you like, but
you may not share them with non-students or reupload them anywhere else online: it is _not_ your
intellectual property.

## Weeks 13 and 14: Introduction to POSIX and Git

Here you will learn how to administer a Linux/POSIX system. We will be using Alpine linux.

The material for these weeks is hosted on [exercises/posix](./exercises/posix). This includes both video links and workshop content.

  * [Activity 1](./exercises/posix/act1/index.html) is for the Monday workshop in Week 13 (2pm-4pm, Monday 1 February). Ideally you will have watched the videos for Activity 1 by Monday, but you can catch up later if you like as it is the first week of term.
  * [Activity 2](./exercises/posix/act2/index.html) is for the Thursday workshop in Week 13 (1pm-3pm, Thursday 4 February).
  * [Activity 3](./exercises/posix/act3/index.html) is for the Monday workshop in Week 14.
  * [Activity 4](./exercises/posix/act4/index.html) is for the Thursday workshop in Week 14.

This material will be consolidated in Week 15.
  
## Weeks 16 and 18: Databases

We will learn the basics of relational databases. We will be using MariaDB.

The material for these weeks is hosted on [exercises/databases](./exercises/databases). This includes both video links and workshop content.

  * [Activity 1](./exercises/databases/databases/1/sql-introduction.html) is for the Monday workshop in Week 16 (22 February)
  * [Activity 2](./exercises/databases/databases/2/sql-beginners.html) is for the Thursday workshop in Week 16 (25 February)

This is then interrupted by the reading week (Week 17, 1 March - 5 March), during which you should consolidate this material.

  * [Activity 3](./exercises/databases/databases/3/sql-intermediate.html) is for the Monday workshop in Week 18 (8 March).
  * [Activity 4](./exercises/databases/databases/4/sql-java.html) is for the Thursday workshop in Week 18 (11 March).


## Week 19: Databases consolidation

During Week 19 we will revisit the activities of Weeks 16 and 18.

* On Monday we will spend some time completing Activity 4.

* On Thursday we will revise the more complicated of SQL queries of Activity 3.
## Week 20: Build tools

Please watch the following videos:

  * [Build Tools (Part 1)](https://ams-hsta-ims-ond.mediasite.com/MediasiteDeliver/vol01/bristoluniversity/MP4Video/e4cdcf68-e1e3-4e01-8eba-bf22a48a2f5f.mp4/QualityLevels(698000)) (25 minutes) [slides](https://cs-uob.github.io/COMS10012/slides/Build%20Tools%201.pdf)
  * [Build Tools (Part 2)](https://ams-hsta-ims-ond.mediasite.com/MediasiteDeliver/vol01/bristoluniversity/MP4Video/7aa9e7bf-de38-42bf-8fef-11585ca85f72.mp4/QualityLevels(698000)) (18 minutes) [slides](https://cs-uob.github.io/COMS10012/slides/Build%20Tools%202.pdf)

During the Monday activity, we will learn the basics of
  * the GNU tool [make](./buildtools/c.html)
  * [Maven](./buildtools/java.html)

Optionally and in your own time, you may also consider learning a bit about

  * the Python tool [pip](./buildtools/python.md)
  * [debugging](https://web.microsoftstream.com/video/b920571e-e55c-4dbc-b29c-162c5a565486?list=studio). There 
    are also some exercises here:
     * Text: [text.c](/COMS10012/resources/debugging/text.c) and [text.h](/COMS10012/resources/debugging/text.h). Compile with `gcc -Dtest_text -g text.c -o text`.
     * Stackcalc: [stackcalc.c](/COMS10012/resources/debugging/stackcalc.c) and [stackcalc.txt](/COMS10012/resources/debugging/stackcalc.txt). You need to `sudo apk add readline-dev` then compile with `gcc -g stackcalc.c -o stackcalc -l readline`.