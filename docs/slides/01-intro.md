# Software Tools
(COMS10012 / COMSM0085)

Lecturers: 
 - [Joseph Hallett](mailto:joseph.hallett@bristol.ac.uk)
 - [Matthew Edwards](mailto:matthew.john.edwards@bristol.ac.uk)
 - [Manolis Samanis](mailto:manolis.samanis@bristol.ac.uk)

Unit Director:
 - COMS10012: Joseph
 - COMSM0085: Matthew

---
## Unit Structure

- 2 **workbooks** every week, with guidance & video introductions
    + All on unit website https://cs-uob.github.io/{unit}
- 1 intro lecture   (Tuesday @ 11:00 in Phys 1.11)
- 1 3-hour lab session (Friday in MVB 2.11)

### Part 1:
 1. System administration (`ssh`,`vagrant`,`apt`)
 2. Version control (`git`)
 3. Shell scripting (`sudo`,`grep`,`sh`) and build tools (`make`,`javac`,`pip`)
 4. Debugging (`gdb`,`strace`,`ltrace`)
 5. Databases (`mariadb`, SQL) 

### Part 2:
 6. The Web (HTTP, HTML)
 7. Stylesheets (CSS)
 8. Dynamic content (Javascript)
 9. Web scraping (`wget`, BeautifulSoup)
 10. Practical encryption (`gpg`, OpenSSL, LetsEncrypt)

---

## Assessment for COMS10012

One 2-hour paper-based multiple-choice exam.
  - Taken during the summer assessment period (13th - 31st May).
  - Questions will be drawn from across Part 1 & Part 2 of the unit. 
  - Notes are permitted.

_Plus_: completion of the **mandatory attendance hurdle** for labs.
### Resit
 - Different exam of the same format.
 - Taken during the reassessment period (5th - 15th August).

---

## Assessment for COMSM0085

Combined result of 2 in-class tests. Each will be:
 - 1 hour long.
 - Blackboard examination taken under exam conditions in MVB 2.11. 
 - Combination of multiple-choice, true/false and fill-in-the-blanks
 - Notes (and use of the shell) are permitted. 
 - No language-assistance tools, AI help or similar are permitted.

### Part 1
 - Test takes place after Reading Week (Week 6 of TB2)
 - 16 questions across all of Part 1

### Part 2
 - Test takes place in Week 11 (after end of Part 2)
 - 16 questions across all of Part 2

If you pass on the combined result of Part 1 & Part 2, _you pass_ (even if you failed one test). 

If you fail on the combined result, _you fail_ (even if you passed one test).  

Short mock exams will be made available. 

### Resit
 - 2-hour paper-based multiple-choice exam.
 - Taken _in person_ during the resit period.
 - Questions covering _both_ Part 1 & Part 2.
 - Notes are permitted (but nothing else).

---

## Expectations


- Approach workbooks with the intent to learn.
  - Blindly copying-and-pasting from the workbook often won't work.
  - You will be assessed in part on your ability to apply tools to new problems.

+ You are expected to start the workbooks _before_ the Friday lab.
  + Watching intro videos for the first time in the lab is a poor use of contact time!
  + There is (intentionally) too much content to easily finish within the lab session.
  + Make the best use of the TAs and lecturers -- get stuck _before_ you go to the lab, and there'll be more time to help you.

- Don't be afraid to ask.
  - Use the Teams channel to raise problems or queries. Other people benefit!
  - Sometimes we make mistakes -- if you point it out we can act on it.

+ Attend the labs.

---

# Week 1: POSIX Systems 

We will be covering:

### Workbook 1: System Administration
(or, "A Sysadmin's Illustrated Primer")
- Using `ssh` to access the lab machines remotely.
- Setting up key-based SSH login (in the workbook).
- Vagrant, your Debian setup, and why we're using it.
- Installing packages on Debian.

### Workbook 2: The POSIX shell
(or, "grep gud")
- Shell basics: globbing, arguments, and variables.
- Pipes, and why 'plumbing' is essential to using the shell effectively.
- Regular expressions (with `grep` and `sed`)


---

## Workbook 1 Preview: SSH

Goal: log in to the lab machines remotely (so we can do exercises from our beds)

Secure Shell -- tool for secure remote shell sessions. 

Requires the machine we want to log in to (the host) to already be running `sshd` -- the 'daemon' that handles
SSH connections.

`ssh user@host`

Problem: The lab machines aren't directly accessible over the internet.

`ssh user@seis.bris.ac.uk`

SEIS: Not a lab machine, but accessible from the internet.

`ssh user@rd-mvb-linuxlab.bristol.ac.uk`

A load-balancer randomly assigns us to a lab machine!

`user@host:~$`

---

## Workbook 1 Preview: Vagrant

Some of the things you will do in this unit require admin rights.

But we don't want to give you admin rights to the lab machines.

Solution: Virtual machines managed by a container system (`vagrant`).

You can freely reconfigure, install software, destroy the OS, etc.

Write a `Vagrantfile` which specifies the configuration.

`vagrant up` to launch the VM.

`vagrant ssh` to log in to the VM.

`vagrant halt` to shut down the VM.

On the lab machines: VM storage isn't persistent.

---
## Workbook 2 Preview: Grep

*G*lobal *R*egular *E*xpression *P*rint.

Regular expressions are a series of characters that define a pattern that we
want to select or find within a piece of text. The regular expression rules form
a primitive _grammar_ (a Type 3 on the Chomsky hierarchy) that can be used for
specific purposes. 

`grep pattern file`

The patterns can be sequences you want to find.

`grep ench /usr/share/dict/cracklib-small`

But also include control characters with special meaning

`grep ^ench /usr/share/dict/cracklib-small`

`grep ench$ /usr/share/dict/cracklib-small`

`grep ^..ench..$  /usr/share/dict/cracklib-small`

Searching for patterns in text is an extraordinarily common task for
programmers, and regular expressions are _much_ more powerful than the above
indicates.

---
## Workbook 2 Preview: Pipes

Some other tools: `head`, `tail`, `less` `wc -l`.

But how can we combine these tools?

_Pipes_ connect Unix tools together. 

`grep ench /usr/share/dict/cracklib-small | head`

`grep ench /usr/share/dict/cracklib-small | head -10`

`grep ench /usr/share/dict/cracklib-small | head -10 | wc -l`

`grep ench /usr/share/dict/cracklib-small | head -10 | tail -1`

`grep ench$ /usr/share/dict/cracklib-small | sed 's/ench/itch/' | less`

With pipes, Unix tools (that 'do one thing well') can be stitched together into
powerful single-use systems to accomplish difficult tasks.

Implements a form of software modularity & reusabilty, accessible at your
primary interface with the OS.

---
## The End

We'll see you on Friday.
