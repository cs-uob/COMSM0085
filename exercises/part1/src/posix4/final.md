## The final challenge

The final challenge for this part of the unit is to write a C program that uses pipes to interact with bc to add the numbers from 1 to 10, as an example of concurrency and inter-process communication in action. For this, you will need to put together items from the previous pages for this activity.

The general ideas are:

  1. Create two pipe variables called `up` and `down`.
  2. Fork the process. This shares the pipes between both copies of the process.
  3. The parent process will write to the down pipe and read from the up pipe, so it should close the down reader and the up writer.
  4. The child process closes the down writer and the up reader, redirects its standard input to the down reader and its standard output to the up writer, and then execs `bc`. This keeps the redirected standard input and output.
  5. The parent process now writes its sums starting with `1+2` to the down writer with `write` and then uses `read` on the up reader to get the result. You can use a function `evaluate()` like in the previous example that handles the reading/writing and prints debug information to standard output (we don't need standard error as the pipe is a separate file descriptor).
  6. The parent cleanly closes the pipes when it is done, and writes the result to standard output.

Two constraints here:

  - All calls to Posix or file I/O functions _must_ be checked for error return values. It is ok to terminate the program in case of fatal errors rather than try and fix the cause, but not to just carry on ignoring the return value. You can reuse the `check()` function for this.
  - Calls to `read` and `write` must be assumed to be able to fail with `EINTR`, in which case they need to be retried, so these functions must be called from within loops as you saw in the busybox sources.

The one new function you need to know is `int dup2(int src, int dest)` which redirects the destination to be a duplicate of the source. For example if `dr` is a file decriptor for the down reader, then `ok = dup2(dr, 0)` redirects standard input (file descriptor 0) to read from the down reader. Of course, you have to check the return value `ok`!

|||advanced
One way of using `dup2` is to redirect your own standard output to a file, then any calls to `printf` or other functions from then on should end up in the file. If you later on want to restore the original standard output, you can first call `int dup(int fd)` which makes a copy of the file descriptor - for example, if a file is open on file descriptor 3, then

```C
saved = dup(1);      check(saved, "duplicating standard output");
ok = dup2(3, 1);     check(ok, "redirecting standard output");
/* any printf etc here will go to the file on fd 3 */
ok = dup2(saved, 1); check(ok, "restoring standard output");
ok = close(saved);   check(ok, "closing duplicate");
```

shows how you can restore the original standard output by making a copy. If no other file descriptors are open, then `saved` will likely have a value of 4, as file descriptors are just numbers to communicate with the kernel and the kernel usually gives you the next consecutive unused one when you open or duplicate a file descriptor.
|||
