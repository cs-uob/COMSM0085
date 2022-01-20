# Alpine linux system administration

Start your alpine box if necessary by going to the folder with the `Vagrantfile` in your terminal, and typing `vagrant up`. Log in to your alpine linux box with `vagrant ssh`. We are going to get to know linux in general and alpine in particular a bit.

## The file system

Linux (and other POSIX-like operating systems) work with a single file hierarchy with a root folder `/`, although there may be different file systems mounted at different places under that. How files are organised in here are documented in the [Filesystem Hierarchy Standard (FHS)](https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html). Have a look with the command `ls /`:

`/bin` stands for binaries, that is programs that you can run. Have a look with `ls /bin`: there will be a lot of commands in here, including ls itself. Indeed you can find out where a program is with `which`, so `which ls` will show you `/bin/ls` for example.

If you have colours turned on (which is the default) you will see that a couple of files like `bash` are green, but the rest are blue - this indicates the file type, green is an executable program, blue is a link to another file. Have a look with `ls -l /bin`: the very first character of each line indicates the file type, the main ones being `-` for normal file, `d` for directory and `l` for a so-called _soft link_.

Note that, as you can see on the last entry of each line, most files here are links to `/bin/busybox`! Busybox is, in its own words:

> BusyBox is a multi-call binary that combines many common Unix
  utilities into a single executable.  Most people will create a
  link to busybox for each function they wish to use and BusyBox
  will act like whatever it was invoked as.
  (from `busybox --help`)

Busybox is a distribution of the many common POSIX commands (you can see which ones with `busybox --help`) packed into a single program. This means that you can run for example `busybox ls` to run the ls command. However, when you call `ls` directly, your shell runs the `/bin/ls` command, which is just a link to busybox. 

|||advanced
How does busybox know which command you want?

Remember that in C, each program's main function can take an argument vector `char **argv` and that `argv[0]` is the name of the file that was used to call the program - this is what busybox looks at when you call `ls` or any of the other linked programs in `/bin`.
|||

Busybox is used in alpine linux because alpine is a minimal linux distribution and busybox is a minimal implementation of lots of common commands. As a result, the alpine/busybox version of say ls might not have as many options as the ls on the lab machines.

Back to `ls /` and the folders in the root folder. `/etc` stores system-wide configuration files and typically only root (the administrator account) can change things in here. For example, system-wide ssh configuration lives in `/etc/ssh`.

`/lib` contains dynamic libraries - windows calls these `.dll` files, POSIX uses `.so`. For example, `/lib/libc.so.6` is the C library, which allows C programs to use functions like `printf`. You can see with `ls -l /lib` that the C library is actually a link to `/lib/libc.musl-x86_64.so.1`: [musl](https://musl.libc.org/) is a minimal implementation of the C library, which is the version that alpine linux chose to use by default. From their website:

> musl is an implementation of the C standard library built on top of the Linux system call API, including interfaces defined in the base language standard, POSIX, and widely agreed-upon extensions. musl is lightweight, fast, simple, free, and strives to be correct in the sense of standards-conformance and safety.

`/home` is the folder containing users' home directories, for example the default user vagrant gets `/home/vagrant`. The exception is root, the administrator account, who gets `/root`.

`/sbin` (system binaries) is another collection of programs, typically ones that only system administrators will use. For example, `fdisk` creates or deletes partitions on a disk and lots of programs with `fs` in their name deal with managing file systems. `/sbin/halt`, run as root (or another user that you have allowed to do this), shuts down the system; there is also `/sbin/reboot`.

`/usr` is a historical accident and a bit of a mess. A short history is on [this stackexchange question](https://askubuntu.com/questions/130186/what-is-the-rationale-for-the-usr-directory) but essentially, in the earliest days,

  * `/bin` was only for binaries needed to start the system - or at least the most important binaries that needed to live on the faster of several disk drives, like your shell.
  * `/usr/bin` was where most binaries lived which were available globally, for example across all machines in an organisation.
  * `/usr/local/bin` was for binaries installed by a local administrator, for example for a department within an organisation.

In any case, `/usr` and its subfolders are for normally read-only data, such as programs and configuration files but not temporary data or log files. It contains subfolders like `/usr/bin` or `/usr/lib` that duplicate folders in the root directory.

Ubuntu's way of cleaning this mess up is to make its `/bin` just a link to `/usr/bin` and putting everything in there. On alpine linux, there is still a distinction between the two, but most binaries in both folders are links to `/bin/busybox` anyway. For example, if you do `which ls` you find `/bin/ls`, but `which which` shows `/usr/bin/which`, but both of these are in fact just links to `/bin/busybox`.

`/tmp` is a temporary filesystem that may be stored in RAM instead of on disk (but swapped out if necessary), and that does not have to survive rebooting the machine.

`/var` holds files that vary over time, such as logs or caches.

`/dev`, `/sys` and `/proc` are virtual file systems. One of the UNIX design principles is that almost every interaction with the operating system should look to a program like reading and writing a file, or in short _everything is a file_. For example, `/dev` offers an interface to devices such as hard disks (`/dev/sda` is the first SCSI disk in the system, and `/dev/sda1` the first partition on that), memory (`/dev/mem`), and a number of pseudoterminals or ttys that we will talk about later. `/proc` provides access to running processes; `/sys` provides access to system functions. For example, on some laptop systems, writing to `/sys/class/backlight/acpi_video0/brightness` changes the screen brightness.

The `/vagrant` folder is not part of the FHS, but is a convention for a shared folder with the host on vagrant virtual machines.

## Package managers

Linux has had package managers and repositories since the days when it was distributed on floppy disks. A repository is a collection of software that you can install, and can be hosted anywhere - floppy disk, CD-ROM, DVD or nowadays on the internet. A package manager is software that installs packages from a repository - so far, this sounds just like an _app store_ but a package manager can do more. For one thing, you can ask to install different versions of a particular package if you need to. But the main point of a package manager is that packages can have dependencies on other packages, and when you install one then it installs the dependencies automatically.

Nano is a basic text editor that works in the console, and is installed in most linux distributions including the ones on seis and the lab machines, so you can use it to edit files remotely. However, in alpine linux it is not installed by default: type `nano` and you get `nano: command not found`. You can install it with the command

```
sudo apk add nano
```

  * `sudo` (superuser do) allows you to run a command as root, also known as the administrator or superuser. Depending on how your system is configured, this might be not allowed at all (you can't do it on the lab machines), or require a password, but on the alpine/vagrant distribution you are allowed to do this. It is good practice to use sudo for system adminstration instead of logging in as root directly, but if you ever really need a root shell then `sudo bash` gets you one - with `#` instead of `$` as prompt to warn you that you are working as root.
  * `apk` is the alpine linux package manager.
  * `add PACKAGE` adds a package, which means download and install it and all its dependencies (nano is so small that it has none).

You can now do `nano FILENAME` to edit a file. The keyboard shortcuts are at the bottom of the screen, the main one you need is Control+X to exit (it will ask if you want to save, if you have unsaved changes).

Next, install git with `sudo apk add git`. Git requires two dependencies (apart from the ones already installed on the base system), as you can see in the output:

```
(1/3) Installing expat (2.2.8-r0)
(2/3) Installing pcre2 (10.33-r0)
(3/3) Installing git (2.22.4-r0)
```

`expat` is an XML parser (for configuration files) and `pcre2` implements perl-compatible regular expressions for searching for text.

We can use apk to explore this further, try the following:

  * `apk info git` shows information about the git package, including a short description and the website.
  * `apk info -a git` shows more information, including the dependencies (section "depends on", there are 5 listed but two are already part of the base system, `libc.musl` is the C library and `libz` is a compression library similar to "zip") and a list of all files installed by the package.

Note how git is built out of a number of subcommands in `/usr/libexec`. For example, when you do `git branch`, that ends up calling `/usr/libexec/git-core/git-branch`.

The commands above did not require `sudo` as they do not change any files on the system.

## Update and upgrade

The repositories that you are using are recorded in `/etc/apk/repositories`, have a look at this file with `cat` or `nano` to see where they are, then look up the sites in your browser. There are folders for different processor architectures (the one in use is stored in `/etc/apk/arch`) and these contain all the packages as well as a file `APKINDEX.tar.gz` that contains a list of all packages and versions.

Two commands a system adminstrator should run regularly for security reasons:

  * `sudo apk update` fetches the new package list from the repository. This way, apk can tell you if any packages have been updated to new versions since you last checked.
  * `sudo apk upgrade` upgrades every package that you already have installed to the latest version in your local package list (downloaded when you do an `apk update`).

## Lab machines

If you are running a virtual machine on the lab machines, then your virtual machine might not be around after the lab machine reboots or you log out and in again and end up on a different machine - as the notice when you log in tells you, the virtual machines are stored under `/tmp`.

It would be annoying to have to reinstall your favourite packages every time you log in to a different machine, so you should put them in your Vagrantfile and then `vagrant up` will do this for you automatically. The Vagrantfile already contains a line `apk add libc6-compat` which installs a package by default - you can put as many as you like on this line separated by spaces. There is no `sudo` here because when vagrant is installing the system, it is running as root automatically.

  * Add `nano` and `git` to this line so next time you rebuild the vagrant machine, they are added automatically.
  * Log out of your vagrant machine and do a `vagrant destroy` which removes the virtual machine. Then reload with `vagrant up` which will download and provision the box again.
  * Log in with `vagrant ssh` and check that git and nano are installed.

For the next exercise, please also install the `gcc` package that gets you a C compiler, as well as `musl-dev` which contains header files like `stdio.h`. These, in case you wondered, live in `/usr/include`.
