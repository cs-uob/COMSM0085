# Input/output in POSIX

Both the C library and the POSIX standard library contain file I/O functions. Usually, the C library ones build on the POSIX ones if you are on a POSIX system.

The POSIX I/O functions are declared in `fcntl.h` and `unistd.h`. The main ones are:

## Open and Close

  - `int open(const char *pathname, int flags, [mode_t mode])` opens a file and returns a file descriptor. The flags are the boolean OR (`|`) of one or more of the following:
    * `O_CREAT`: if the file does not exist, create it. In this case the _optional_ mode parameter can be used to specify the permissions for the newly created file. If the `O_CREAT` flag is omitted and the file does not exist, `open` returns an error.
    * `O_EXCL`: return an error if the file already exists (only really useful together with `O_CREAT`).
    * `O_PATH`: don't really open the file, just make a file descriptor (that you can use to e.g. `stat` the file). In this case you do not need one of the three flags mentioned in the next point.
    * `O_RDONLY`, `O_WRONLY`, `O_RDWR`: exactly one of these mutually exclusive flags must be set to indicate whether you want read, write or both access modes on the file.
    * `O_TRUNC`: if the file already exists, then its previous contents are overwritten if you open it to write.
    * `O_NONBLOCK`: this is the most interesting option and the main reason why you might want to use `open` over `fopen`. More details on this in the next activity.
    * There are a lot more flags that you can see with `man 2 open`.
  -   - `int close(int fd)`: close a file descriptor. Returns 0 on success and -1 (setting errno) on error.

You might wonder how a C function call can have an _optional_ parameter. The function is actually declared in `fcntl.h` as `int open(const char*, ...)` where the ellipsis means _any number of parameters of any type_ just like `printf` uses.

If `open()` fails, it returns a negative number that indicates the error code: see `errno.h` for the names of the codes and the manual page (`man 2 open`) for what each one means for this function.

## (Non)blocking IO

When you read from a regular file, there is a short delay while the kernel does the actual reading for you - possibly it has to fetch the data from disk. This is not what is meant by blocking. However, when you read from a pipe (e.g. you call `a | b` in the shell and `b` reads from standard input) or from a named pipe (FIFO), then if no process is connected to the writing end, your system call blocks until someone writes to the pipe.

The Posix functions offer an option `O_NONBLOCK` that makes a call fail instead of block. This is one of the reasons that you might use `read` directly rather than `fread`. While this is an important topic for concurrent programming (and especially network programming), that can wait until second year.

## Read and Write

  - `ssize_t read(int fd, void *buf, size_t count)`: read up to `count` bytes from the file descriptor `fd` into the buffer. In case of an error, this returns -1 and puts the error code in `errno`. If the end of file is reached, then the return value might be less than count (possibly zero) but this does not count as an error.
  - `ssize_t write(int fd, const void *buf, size_t count)`: the same but for writing to a file (descriptor).


Before you use any of these functions, there are two warnings. The small one is that unlike the C library which provides _buffered_ input/output, the POSIX functions do not - so while it's ok to read a large file one character at a time with `fread` due to buffering, this becomes really inefficient if you use the basic `read`.

The big warning is that checking return values is even more important than usual because these functions can return two kinds of errors: fatal ones (e.g. file not found) and temporary ones, which basically means _try again_, so in some cases the correct pattern to use these functions is to call them in a loop that repeats until the function either succeeds or returns a fatal error. Specifically, `read()` can return any of the following:

  * -1, `errno = EINTR`: the call was interrupted, try again.
  * -1, `errno = EAGAIN` or `errno = EWOULDBLOCK`: you have requested non-blocking IO, and the call would block.
  * -1, any other errno: a fatal error occurred and `errno` gives more information. You must not retry the call.

## Exercise

In the sources for busybox (`git clone git://busybox.net/busybox.git`), use your shell skills to find the source file and line where the function `safe_read` is defined, and study the pattern used there to operate `read` in a loop.

