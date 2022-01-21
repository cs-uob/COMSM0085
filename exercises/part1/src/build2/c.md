# Build tools: C

In this exercise you will practice the traditional way of building C projects from source. We are going to use the sqlite database as an example project to build.

Download the source file [https://sqlite.org/2021/sqlite-autoconf-3340100.tar.gz](https://sqlite.org/2021/sqlite-autoconf-3340100.tar.gz) into your Alpine VM with `wget` or similar and extract it with `tar zxvf FILENAME`. This creates a subfolder, do a `cd` into it.

You can see a file called `INSTALL` which you can open in a text editor to find the standard instructions:

> Briefly, the shell commands `./configure; make; make install` should configure, build, and install this package.

## Configure

If you look at the first line of the configure script, it starts `#! /bin/sh` as that path should be valid on just about any vaguely posix-compatible system. The whole thing is just over 16000 lines, so you don't want to read all of it.

Run the script with `./configure`. You can see that it does a lot of checking, including things like:

  - Whether your system has a C compiler.
  - Whether your C compiler is gcc.
  - Whether your C compiler actually works.
  - Whether standard headers like `string.h` or `stdlib.h` exist.
  - Whether the readline library is installed on your system.

Your configure script should run through and print `creating Makefile` on one of its last lines.

The configure script is basically a collection of tests for every single bug and oddity found on any system known to the autoconf developers that could break the build. For example, someone once reported a bug in a build on Sun OS 4 (released in 1988), so in lines 2422 and following of the configure script we read

> `# Use test -z because SunOS4 sh mishandles braces in ${var-val}.`
> 
> `# It thinks the first close brace ends the variable substitution.`
> 
> `test -z "$INSTALL_PROGRAM" && INSTALL_PROGRAM='${INSTALL}'`

## Make

Type `make` to build sqlite. If it's not installed, `sudo apk add make` will fix that.

Some of the compiler commands might take a while to run. While they're running, note the number of configuration variables (everything passed with a `-D`) involved; some of them turn on/off features (for example readline support is off if it can't find the header files for it on your system) and some of them set options specific to the operating system and compiler, for example `-DHAVE_STRING_H` defines whether `string.h` exists on your system.

These translate to `#ifdef` commands in the source files, for example in `shell.c` starting at line 121 we include readline, if the header files exist:

    #if HAVE_READLINE
    # include <readline/readline.h>
    # include <readline/history.h>
    #endif

The last command run by the makefile is

    gcc [lots of options] -g -O2 -o sqlite3 sqlite3-shell.o sqlite3-sqlite3.o -lreadline -lcurses

This should build an executable `sqlite3` that you can run (use `.q` to quit again).

_If you want to, you can now type `sudo make install` to copy the executable to `/usr/local/bin`._