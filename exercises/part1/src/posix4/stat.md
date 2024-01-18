# Inodes and System Calls

In this exercise we will look under the hood of the `stat` system call, which returns information about an inode.

_Note: for this exercise it's even more important than usual that you are using Debian within Vagrant, as you will get different results if you try it on Windows Subsystem for Linux or on a Mac for example._

A system call is a way for a linux user or program to interact with the kernel, and there are usually at least three ways of calling each one:

  1. Execute the system call directly in assembly.
  2. Use the wrapper function provided by your C library.
  3. Use a command-line program provided by your distribution.

## Preparation

Have a look at the manual page `man stat` for the `stat` system call. The abbreviated headers are:

```C
#include <sys/stat.h>

int stat(const char *pathname, struct stat *statbuf);
int fstat(int fd, struct stat *statbuf);
int lstat(const char *pathname, struct stat *statbuf);
```

`stat` is the main system call: you give it a pathname and it fills a `struct stat` for you with information about the inode associated with this pathname, however if the pathname is a symbolic link then it follows the link and returns information about the target inode. If you do not want this behaviour, you can use `lstat` instead.

`fstat` takes an open file descriptor instead of a file name: this is fine for getting the inode information (in the kernel, a file descriptor contains an inode number) but you will not be able to get a file name back from this - remember, _files don't have names; names have files_.

Later in the manual page, it explains the `struct stat` contents. Let's have a look at the sources directly though:

  * `nano /usr/include/sys/stat.h` shows you the header file and the function definitions, including the bitmasks for the mode bits e.g. `#define S_IRUSR 0400` is the "user can read" bit and the file type bits e.g. `#define S_IFDIR 0040000`. Note, in C, numbers with a leading 0 are octal!
  * The definition of the `struct stat` is in another file included from `sys/stat.h`, namely `bits/stat.h`; open that in your editor too and have a look at it.
  * The types of the fields in the structure (`dev_t`) etc. are yet in another file - `bits/alltypes.h` if you're curious - but eventually they get defined as `long`, through intermediate definitions of `_Int64` etc. Basically, on a 64-bit machine, most of these fields are 64 bits.

Run the following short C program to check the size of your `struct stat`; I get 144 bytes but note down if you get something different:

```C
#include <sys/stat.h>
#include <stdio.h>
int main() {
    printf("Size: %lu bytes\n", sizeof(struct stat));
    return 0;
}
```

## The assembly level

Create a file with the following content - the convention for assembly files is usually to end in `.s`, so I've called mine `dostat.s`:

```asm
.section .text
.global  _start

_start:
    mov $6,  %rax
    lea str, %rdi
    lea buf, %rsi
    syscall

    mov $60, %rax
    mov $0,  %rdi
    syscall

str: .asciz "/dev/stdin"

.section .data
buf: .skip 144
```

Change the 144 in the last line if you got a different size for your structure.

Let's see what's going on here:

  1. `.section .text` is an assembly directive to say _the following is code_, more precisely _it goes in the code section (which we named 'text' for obscure historical reasons)_.
  2. `.global _start` says to export the label `_start` to the linker, which is the assembly version of `main`: in fact, C programs really start at `_start` too as you can check by setting a breakpoint on this label in a debugger, this function is part of the C library and it sets a few things up and then calls `main`. When you return from `main`, then `_start` does some cleanup and exits the program cleanly with the correct return value.
  3. The way you invoke a system call is you put the system call number in the `rax` register, and parameters according to the platform convention - on Intel/AMD 64 bit, the first parameter goes in the `rdi` register, the second one in the `rsi` register. System calls and their parameters are documented [in this table](https://blog.rchapman.org/posts/Linux_System_Call_Table_for_x86_64/) for example. Return values from system calls end up in the `rax` register again. Looking ahead a bit in our assembly code, system call 60 is `sys_exit` and takes an exit code in `rdi`, so the lines `mov $60, %rax; mov $0,  %rdi; syscall` are the equivalent of `return 0;` in a main function of a C program or `exit(0);` anywhere else (indeed, that is the last thing the C library `_start` will do when `main` returns to it).
  4. System call 6 is `sys_lstat`, so the lines `mov $6,  %rax; lea str, %rdi; lea buf, %rsi; syscall` call `sys_lstat(str, buf)` where both `str` and `buf` are pointers. (`lea` stands for _load effective address_ and is similar to the `&var` address-of operator in C).
  5. `syscall` is an assembly instruction that hands control over to the operating system. It is comparable to a software interrupt as you might have learnt in Computer Architecture, but it is an optimised version (since many programs do a lot of system calls) that doesn't have the full overhead of the older interrupt mechanism on x86.
  6. `.asciz` is a zero-terminated string in C style (which is what the kernel expects). `.section .data` says _the following goes in the data section_, which we need because the buffer variable needs to be written to and the code section is read-only when a program is running. `.skip` reserves a block of the given size in bytes, similar to `byte buf[144];` in C (you can read `char` for `byte` if you want).

Assemble the program with
  * `as dostat.s -g -o dostat.o`
  * `ld dostat.o -o dostat`

The first command is the assembler itself, which produces and object file (C compilers usually do this too, but you don't see it unless you ask for it). `-g` is the same as for gcc, it includes debug information. `ld` is the linker which produces an executable.

You can run the program with `./dostat`, but it will simply exit with status 0. What we want to do is debug it with `gdb dostat` (install `gdb` with `apk` if you don't have it installed already), then do the following:

  * `break _start` to set a breakpoint.
  * `run` to start running (and hit the breakpoint).
  * `si` steps a single assembly instruction. Do this until you have passed the first `syscall` and land on the line `mov $60, %rax`.
  * The memory at `buf` now contains filled-in `struct stat` for `/dev/stdin`, the standard input file. Look at this with `x/40xb &buf` (memory dump, show 40 hex bytes starting at the buffer).

Based on what you know about the `struct stat` memory layout, what is the inode number and mode of `/dev/stdin`? Note down the inode number in decimal, and the low 16 bits of the mode word in binary. Note that the memory layout is most likely little-endian, and you are working with 64-bit long integers.

From this information, and the bit patterns in `/usr/include/sys/stat.h`, decode the file type and permissions of `/dev/stdin`.

You can then quit gdb with `q`, and answer yes when it askes whether you want to terminate the program.

## The C level

We will now do the same in C. Create this program, I've called it `exstat.c`, then compile and run it:

```C
#include <sys/stat.h>
#include <stdio.h>

int main() {
    struct stat buf;
    char *str = "/dev/stdin";
    int r = lstat(str, &buf);
    if (r != 0) {
        puts("An error occurred.");
        return 1;
    }
    printf("The inode number is %lu.\n", buf.st_ino);
    if (S_ISDIR(buf.st_mode)) { puts("It's a directory.");}
    if (S_ISCHR(buf.st_mode)) { puts("It's a character device.");}
    if (S_ISBLK(buf.st_mode)) { puts("It's a block device.");}
    if (S_ISREG(buf.st_mode)) { puts("It's a regular file.");}
    if (S_ISFIFO(buf.st_mode)) { puts("It's a FIFO.");}
    if (S_ISLNK(buf.st_mode)) { puts("It's a soft link.");}
    if (S_ISSOCK(buf.st_mode)) { puts("It's a socket.");}

    return 0;
}
```

Here we can see that we:

  1. Set up the buffer structure and execute the system call.
  2. Check the return value! If it's not 0, then an error occurred - the file `/usr/include/bits/errno.h` contains a table of error codes, although the system call will return the negative error code in register `rax`. The `man stat` manual page explains the meaning of each error code for this particular system call.
  3. Print the inode number (in decimal) and the file type.

Check that you get the same inode number and file type as you did with the assembly version.

## Symbolic links

The point of checking the file type is that `/dev/stdin` is a symbolic link. To find out where it points, you can use this function:

```C
#include <unistd.h>
ssize_t readlink(const char *pathname, char *buf, size_t bufsiz)
```

This is another system call wrapper (readlink is system call 89) which takes the pathname of a symbolic link and writes its contents (e.g. the file it points at) in a buffer. However, be aware of the following:

  * `readlink` does not zero-terminate its buffer! That is your responsibility as caller.
  * The returned value (yet another unsigned long) indicates what happened:
    - A positive value indicates the number of bytes written, so you know where to put the zero byte at the end.
    - If the return value is equal to the buffer size, then your buffer was too short, and the buffer may contain a truncated string.
    - If the return value was negative, then an error occurred.
    
In the assembly version, the negative error code would land directly in `rax`. This is why system calls return negative error codes, to distinguish them from successful return values as a successful call will never write a negative number of bytes.

However, the C wrapper is different as you can read in `man readlink`: it always returns -1 on error, but puts the error code (this time positive again) in a global variable called `errno`. You can match this against the codes in `errno.h` as before, and then check the manual page for an explanation of each one for this particular system call.

**Exercise**: write a C program that, starting with a filename you pass in `argv[1]`:
  1. `lstat`s the file and prints the inode number and file type of the file.
  2. If the file is a symbolic link, calls `readlink` to get the link target and repeats from 1. for the target file.

Since this is systems programming, make sure you check the return value of system calls, and correctly zero-terminate strings. If a system call fails, your program should print an error message and exit, and _never_ look at the buffer or string the system call wrote to, as it might not contain valid data.

Call your program for `/dev/stdin` and `/dev/stdout` to follow the chain of soft links for these files. Also try it on a few standard files and directories (including soft links).

## On the command line

To check the results of your program, the `stat` command line program (`/bin/stat`, in fact yet another soft link to busybox) calls stat and prints the output to the terminal. You can see with `stat --help` that it offers lots of custom formats.

Note that the `stat` command line tool calls the `lstat` system call by default, e.g. it does not follow soft links. `stat -L` gets you the link-following version.

To see how the command line version works, we are going to have a look at its sources.

Clone the busybox repository with `git clone git://busybox.net/busybox.git` (if that doesn't work for some reason, try the https version). Inside the cloned folder, the source file is `coreutils/stat.c` - open that and have a look:

  * The comments at the start are read by a custom build tool. The `//applet` line (currently line 38) says to build a command called `stat`.
  * `file_type` (line 123 at the time of writing) is the code for turning mode bits into strings, note there are lots of `#ifdef`s depending on what options you compile busybox with. Also, if you `stat` a file that does not match any known type, you get the string "weird file".
  * Most of the source file is the kind of "plumbing" that you need in any real C program. The interesting part is `do_stat` (line 588 at the time of writing):
  
First, it allocates a `struct stat` buffer like we did before. 

The key line is currently line 605 and following:

```C
if ((option_mask32 & OPT_DEREFERENCE ? stat : lstat) (filename, &statbuf) != 0) {
    bb_perror_msg("can't stat '%s'", filename);
    return 0;
}
```

Based on the value of `OPT_DEREFERENCE` (the `-L` command line flag), we call either the `stat` or `lstat` system call wrapper in the C library, and complain and exit if we don't get a success return value - remember, in case of errors, `struct stat statbuf` could be corrupted so we shouldn't look at it.

The rest of the function is basically setting up one giant `printf` statement to output the results in the correct format. Note here that the `struct stat` still doesn't know anything about the file's name, as that's not in the inode, but the command-line program does because you gave the name as an argument. 

If the file is a soft link, then we call a version of readlink - currently `xmalloc_readlink_or_warn` in line 713 - to display the link target. This function is implemented in `libbb/xreadlink.c` where it currently delegates to `xmalloc_readlink` on line 20, which calls `readlink` in a loop with increasing buffer sizes until it finds one that is big enough for the target - have a look at how this is implemented.

The main function for this utility is `stat_main`, currently on line 757. All this does is parse the command line arguments with `getopt32`, call the `do_stat` function in a loop for each command line argument (lines 787 and following in the current version) and then return success if all files were successfully processed, otherwise failure.

If nothing else, the learning point of this activity is that system programming in C and calling syscalls directly is a lot more involved than you may think! Please don't be that kind of programmer who [ignores system call error values, and makes terrible things happen](https://rachelbythebay.com/w/2014/08/19/fork/).

If you want to explore this code further, you can build your own busybox - install `ncurses` and `linux-headers`, then run `make menuconfig` to bring up a configuration menu (this is the part that uses ncurses, which is the menu system) and just select exit (with TAB then ENTER). Then you can `make` the whole thing.
