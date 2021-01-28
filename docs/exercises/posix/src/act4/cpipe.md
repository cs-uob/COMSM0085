## Pipes in C

## Types of inter-process communication

You can use any of the following for one process to talk to another:

  - Pipes in the shell, e.g. `cat FILE | grep STRING`. We are going to learn how to manage these pipes ourselves from a C program.
  - Named pipes (FIFOs), which are pipes that have filenames.
  - `popen`, a C function that launches a new process with a pipe either for reading or writing, but not both.
  - TTYs, as explained in the lectures. The C interface for using TTYs starts with `posix_openpt()` and is fairly complicated.
  - Sockets. This includes both network sockets (TCP) and also UNIX sockets, which are another type of special file. Unlike pipes, sockets provide bidirectional communication.

We are going to be using pairs of pipes, since a single pipe only works in one direction.

## C functions

We will need the following functions for our task, all from `unistd.h`:

  - `int pipe(int fd[2])` creates a pipe. It takes an array of two integers and creates two file descriptors in them, one for the reading and one for the writing end of the pipe. Details in `man 2 pipe`, and like all system calls, you need to check the return value and look at `errno` if it is negative.
  - `int dup2(int oldfd, int newfd)` changes `newfd` to point to the same file descriptor as `oldfd`. This is the system call version of the shell redirect.
  - `pid_t fork()` creates a copy of the current process, and is the starting point for launching another process. Once you are sure that it has not returned an error, then the child process will see return value 0 and the parent process will see a return value >0, which is the process id of the child process.
  - `int execve(const char *path, char *const argv[], char *const envp[])` replaces the current process by the indicated process, this is the C version of typing a shell command except that (1) the shell does fork-then-exec and (2) there is no shell involved, so you cannot use shell features like `*` expansion or builtin commands like cd here.

Here is the basic way to launch a program from another, keeping the original program running:

```C
/* launch.c */
#include <unistd.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

char* command = "/bin/echo";
char* argv[] = {"echo", "Hello", NULL};
char* envp[] = {NULL};
/* both argv and envp must be NULL-terminated arrays,
   also argv[0] has to be the program name (busybox cares about this)
 */

int main() {
    int ok = fork();
    if (ok < 0) {
        printf("fork() failed: %s\n", strerror(errno));
        return 1;
    }
    /* ok, fork succeeded and the following code will now be running TWICE */
    if (ok == 0) {
        /* This is the child process */
        ok = execve(command, argv, envp);
        if (ok < 0) {
            printf("execve() failed: %s\n", strerror(errno));
            return 1;
        }
        /* we will never get here as if execve succeeded, we're gone */
    }
    
    /* if we got here, then we're the parent process */
    printf("Launched a child process, it has pid %u.\n", ok);
    
    return 0;
}
```
If you run this several times in a row, you might see the PID of the child increasing by 2 each time, why is this?

And here is the basic way to work with pipes:

```C
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

typedef int fd;
typedef fd Pipe[2];
fd Reader(Pipe p) { return p[0]; }
fd Writer(Pipe p) { return p[1]; }

void check(int ok, char *where) {
  if (ok < 0) {
    fprintf(stderr, "Error in %s: %s\n", where, strerror(errno));
    exit(1);
  }
}

int main() {
  int ok;
  Pipe p;
  ok = pipe(p);           check(ok, "opening pipe");
  ok = close(Reader(p));  check(ok, "closing reader");
  /* here we can write to p */
  ok = close(Writer(p));  check(ok, "closing writer");
  return 0;
}
```

Let's go through this step by step.

  * A file descriptor is simply an integer. so we make a typedef for this.
  * A pipe is a pair of file descriptors for reading and writing, implemented as an array of length 2. The second typedef is C syntax for defining `Pipe` with a capital P to be `fd[2]` We use a capital P because lowercase `pipe` is already in use for the function that sets up a pipe.
  * The functions `Reader` and `Writer` are just for convenience.
  * In main, we declare a variable of type `Pipe` and open it with `pipe()`. Like all POSIX functions this returns a negative number in case of errors, and we have to check for this: it's not safe to use the pipe if it was not opened correctly. The pipe does not need a name as it's local to our program, but you can print the value of the integers if you like, it should be something like (3, 4) as 0-2 are already in use for standard input, output and error.
  * In this example we want to use a pipe for writing to, so we close the reding end first. This is important when sharing a pipe between two processes: only one process should have each end open. (There are scenarios where you might want both ends of a pipe open in the same process, but they are more advanced than what we are doing here.)
  * In the line where the comment is, we can write to the pipe - you will see how soon.
  * Finally, before returning, we close the writing end of the pipe to ensure the process on the other end knows we're done: if we don't do this, they could get a "broken pipe" (EPIPE) error.

We still need to learn how to write to a file descriptor, though. And this pipe won't do anything useful until we can connect something to the other end.

|||advanced
If you look at the pattern for checking return values

    ok = pipe(p); check(ok, "create pipe");

you might be wondering why we don't just combine it into one:

    check(pipe(p), "create pipe");

This is absolutely fine except if we want to debug the function being called, as it makes using the debugger's step features more complicated (more on this in future weeks of this unit). It's just a personal preference of mine not to combine the two.

Of course, if you want to use line-based features of debuggers like breakpoints a lot, you might even want to put the check on a separate line.

You might have wondered if the all-in-one pattern is because it "swallows" the return value. That is not a problem: we could adapt check to return its first parameter as the return value if it's not an error, then where you do need the value you can do things like

```C
int pid = check(fork(), "trying to fork");
if (pid > 0 ) { /* parent */ }
else { /* child */ }
```

This is one of several patterns for error handling you will see in C, although this particular one is commonly implemented as a macro so it can also print the file and line where the error occurred:

```C
#define check(ok, where) _check(ok, where, __FILE__, __LINE__)
int _check(int ok, char *where, char *file, int line) {
  if (ok < 0) {
    fprintf(stderr, "Error at %s on line %i while %s: %s\n", 
            file, line, where, strerror(errno));
    exit(1);
  }
  return ok;
}
```

Since C99 you can also use `__func__` to get the name of the current function.

You will find various patterns like this a lot if you start looking into real C code bases. Of course, most real programs will try to handle an error where possible rather than just exit the whole program.
|||