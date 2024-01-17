# Input/Output in C

## Reminder: C file handling

You should already be familiar with the following C functions from `<stdio.h>`, though you can look up details with `man 3 FUNCNAME` on a lab machine:

  - `FILE *fopen(const char *path, const char *mode)` opens a file, returning a file handle if successful and NULL otherwise. On some systems, it makes a difference whether you read a file in text mode (`r`) or binary mode (`rb`), the difference being that the former activates an extra "line discipline" in the C library. For example on Windows, text mode translates a lone `\n` character to `\r\n`. _On POSIX systems, there is no difference between text and binary mode._ 
  - `int fclose(FILE *file)` closes a file, and flushes any pending writes. It returns 0 on success and nonzero in case of errors.
  - `int fflush(FILE *file)` flushes a file: for output, it makes sure any buffered characters are written out. For input, it throws away any unread input in the c library input buffer. It returns 0 on success and nonzero in case of errors. `fflush(NULL)` flushes all open files.
  - `int feof(FILE *file)` returns nonzero if the file in question has reached end-of-file, and zero otherwise. This is the only correct way to test for an end-of file condition.
  - `int ferror(FILE *file)` returns nonzero if the file in question is in an error state. For example after a `fread` that did not return the expected number of blocks, exactly one of `feof` and `ferror` will return nonzero, indicating what happened. In case of an error, the global variable `errno` will contain the error code.
  - `size_t fread(void *dest, size_t size, size_t num, FILE *file)` reads up to `num` blocks of `size` bytes into the buffer at `dest` and returns the number of blocks read (for a block size of 1, this is the number of bytes). If the return value is less than `num` then either an error occurred or the end of the file was reached.
  - `size_t fwrite(const void *buffer, size_t size, size_t num, FILE *file)` writes up to `num` blocks of `size` bytes from the `buffer` to the `file` and returns the number of blocks written. If this is less than `num`, then an error occurred during the writing.

A number of utility functions build upon these:

  - `int fprintf(FILE *stream, const char *format, ...)` writes formatted output to a file, usually by calling `fwrite` behind the scenes. `printf` is a shortcut for `fprintf(stdout, ...)`. These functions to not print a newline unless you ask for one. It returns the number of characters written, or a negative number if an error occurred.
  - `int fputs(const char *string, FILE *file)` writes a zero-terminated string to the file, not including the zero terminator. `puts` is a shortcut that writes to `stdout` _and_ adds a newline at the end. 
  - `int fputc(int c, FILE *file)` writes a single character (`c` is cast to an `unsigned char` first) and `putchar` is a shortcut for writing to `stdout` (but does not add a newline, unlike `puts`).
  - `int fgetc(FILE *file)` reads a single character from a file (but returns it as an int, however it's safe to cast to char). `getchar` is a shortcut that reads from standard input.
  - `char *fgets(char *buffer, int size, FILE *file)` reads up to `size-1` bytes into the buffer, stopping early if it finds a null byte, newline or end-of-file character. It then adds a zero-terminator to the string. If it stopped early because of a newline, the newline is included in the buffer; if it stopped due to an end-of-file then this is not included. Older versions of C included a `gets` version that reads from standard input and does not take a size argument; this is insecure as it can produce a buffer overflow and it should never be used. `fgets` is safe if the length of the buffer is at least `size` bytes. It returns a pointer to buffer on success and NULL if an error occurred. End-of-file counts as an error for this purpose if no characters could be read at all.

Fread (and fwrite) can return in one of three different states:

  1. The return value is equal to the number of items you asked to read/write (third argument). This means that the read/write was successful.
  2. The return value is not equal to the number of items, `ferror` returns nonzero on the file: an error occurred. The return value indicates how many items were successfully read or written before the error occurred. `errno` contains more information about what happened.
  3. The return value is not equal to the number of items, `ferror` returns zero on the file: end of file. Calling `feof` on the file will return nonzero. End of file when reading means exactly what it says; end of file when writing to something with a program on the other side (pipe, socket, pty) means the other side has closed the connection.

## Exercises

For our next exercise, we investigate how the C library file functions interact with the terminal. Compile this program:

```C
// program: input1.c //
#include <stdio.h>
#include <string.h>
#include <errno.h>

// Utility function to print an error message and return from main,
// use: return error(code, text); // in main
// prints text and the current errno value, then returns code.
int error(int ret, char* text) {
  int e = errno;
  printf("Error %s: %s (code %i).\n", text, strerror(e), e);
  return ret;
}

int main(int argc, char **argv) {
    if (argc < 2) { printf("Use: %s FILENAME\n", argv[0]); return 1; }
    printf("Opening [%s]\n", argv[1]);
    FILE *file = fopen(argv[1], "r");
    if (file == NULL) { return error(2, "opening file"); }
    
    char c, d;
    size_t result = fread(&c, 1, 1, file);
    if (result < 1) { 
      if (ferror(file)) {
        return error(2, "reading first character");
      } else {
        puts("No first character - end of file?");
        return 2;
      }
    }
    printf("Read character: [%c].\n", c);
    result = fread(&d, 1, 1, file);
    if (result < 1) { 
      if (ferror(file)) {
        return error(2, "reading second character"); 
      } else {
        puts("No second character - end of file?");
        return 2;
      }
    }
    printf("Read another character: [%c].\n", d);
    
    int e = fclose(file);
    if (e) { return error(2, "closing file."); }
    return 0;
}
```

The essence of the program are the four lines
```
fread(&c, 1, 1, file);
printf(..., c);
fread(&d, 1, 1, file);
printf(..., d);
```
which read two characters from the file indicated in its first argument, then print them out.
Note that we print the first character before reading the second, as this will become relevant.

The rest of the program is error handilng, and although some tutorials leave this off to make the code look easier, this sets you up for terrible habits - in the real world, errors happen and you need to handle them properly. So this program also shows the absolute minimum of error handling when you work with a file.

  * Make a file `file` containing some characters such as `abc` and run `./input1 file`. Convince yourself that the program prints the first two characters (first two bytes, to be precise).
  * Next, run `./input1 /dev/stdin`, to make it read from standard input. Notice that it blocks.
    Type a few characters such as `abc` and notice that the program prints nothing, until you press ENTER at which point both the "Read character" and "Read another character" output appears at once. **What is the reason for this?**
  * Restart the program, and when it is waiting for input, type `ab[BACKSPACE]c[ENTER]`. **Explain what you see.** 
  * What happens if you enter only one character and then press ENTER? What if you press ENTER and haven't typed anything at all?
  * If you want, verify that using fgetc / getchar produces the same behaviour on standard input: the program does not proceed past the first read command until you press ENTER. You can even try debugging with gdb to make sure.
  * Insert the line `setbuf(file, NULL);` just after the `fopen` line to make sure it's not the C library buffering.

Have you answered the questions in bold above before reading on?

  * Next, on your terminal, execute `stty -icanon`, which turns off the "icanon" setting. (The convention for `stty` is that an option name in an argument turns it on, except if prefixed with a minus which turns it off.)
  * Rerun the program (`./input1 /dev/stdin`) and see what happens now.
  * Turn "icanon" back on with `stty icanon`. 
  * Research what `icanon` does, for example in `man stty` on a lab machine or online.
  * **Why does BACKSPACE and `^U` work in your bash shell, even with icanon turned off?**

Next, we are going to experiment with the terminal in fully raw mode:

  * `stty -g` prints the current terminal setting in a format that you can save and load again. Take a look, then store them with the shell command `state=$(stty -g)`.
  * Execute `stty raw`, then run your program again. **The terminal looks a bit "messed up" - can you tell what is happening?** Try another command like `ls` in raw mode too if that helps.
  * Restore your terminal settings with `stty $state`, reading them back from the variable where you stored them. You can then reset the window with `^L`.

There is an important warning here if you are ever benchmarking a program that produces (standard) output - the total running time will be the sum of the program's running time and the connected terminal's running time to process the output. For example, printing a sequence of newline characters is typically slower than printing a sequence of 'a's, even if both programs are doing `putc` in a loop, because the terminal has extra work to do on each newline.

Here is another C program to experiment with:

```C
// input2.c //
// Reads characters in a loop and prints their hex codes. 
// Quit with 'Q'.

#include <stdio.h>

int main() {
  unsigned char c;
  int r;
  setbuf(stdout, NULL);
  while(1) {
    r = fread(&c, 1, 1, stdin);
    if (r < 1) break; // bail out on error or eof
    if (c == 'Q') break;
    printf("(%02X) ", c);
  }
  return 0;
}
```

  * What do you expect to happen if you run this in a "normal" terminal and type a few characters?
  * Run it in a terminal with icanon turned off and type a few characters. Notice that you can still cancel it with `^C`.
  * Run it in a terminal in raw mode and type a few characters. What happens now when you press `^C`?

Luckily, we built in another way to quit the program with Q!

  * In raw mode, try a few "special" keys such as ENTER, ESC, the arrow keys, function keys (F1, F2) etc.
  * We turned off buffering for standard _output_. Why is this important - what happens otherwise and who is doing the buffering?

What actually happens when you press Control-C in a terminal in "cooked" mode is it sends the signal `SIGINT` (interrupt) to the connected program - the default behaviour for this signal is to terminate the program. Putting the terminal in raw mode just passes the control code for Control-C on to the program, though it would still quit if you sent it a SIGINT another way (e.g. with the `kill` command from another terminal). However, you could also write a signal handler in your own program that reacts to SIGINT and does something else, for example just ignores the signal.

When you type say an `a`, even in raw mode, the character appears on your screen even though there's no print command for it. This is the terminal echo; you can turn even this off with `stty -echo` but you are now typing blind! You can still start your program with `./input2` followed by ENTER, and it will still print the hex codes of everything you type from then on until you press Q but it will no longer show you the characters themselves. If you saved the terminal state before, then typing `stty $state` and ENTER will get you your echo back.
