# Git, part 1

For this exercise, I am assuming that you are working on alpine linux and have nano, git and gcc with musl-dev installed as in the last exercise.

## Configuring your identity

Run the following two lines to set up git correctly. You only need to do this once when you install git, but not every time you create a new repository.

```
git config --global user.name "YOURNAME"
git config --global user.email "YOUREMAIL"
```

where you obviously replace your name and email with something of your choice; I've put them in double quotes because this lets you include a space between your first and last names and the @ character in your email address.

This does not create a user account - git just uses your name and email to record the author in any commits you make, so you can put anything you like here (git will happily accept `-` as your email address, and it does not send you email). Of course, once you are working in a team with other students, you will probably want to use your real name so they know who has made which commits.

If you are running a VM on a lab machine, then you would need to reconfigure git every time vagrant rebuilds the VM, for example when you log in to a different lab machine. You can put these commands in your Vagrantfile, like anything else that you want to run when vagrant (re)builds your box, but they need to be run as the vagrant user and not the root user. So add the following block to your vagrantfile just before the `end` line, editing your name and email address obviously; the key point being the `privileged: false` entry which runs the commands as the `vagrant` user:

```
config.vm.provision :shell, privileged: false, inline: <<-SHELL
    git config --global user.name "YOURNAME"
    git config --global user.email "YOUREMAIL"
SHELL
```

Of course this will only work if git is installed, but you've added git to the `apk add` line in the previous provision block already so it will be installed.

## A sample project and repository

Let's say you want to start developing a C program. Let's make a folder:

```
mkdir project1
cd project1
git init
```

The last command created an empty git repository in a subfolder called `.git`. We can check with `git status` to see whether there are any changes, and git reports `nothing to commit`.

Create a file, for example with `nano main.c` and add some sample content like this (you should be able to copy-paste into your terminal):

```C
// file: main.c
#include <stdio.h>

int main() {
    puts("Hi");
    return 0;
}
```

|||advanced
If you install the `nano-syntax` package, you get syntax highlighting in nano, but you need to configure this first. The syntax files themselves live in `/usr/share/nano`, for example `c.nanorc` for the C language, but you have to include the ones you want in a file `~/.nanorc`. For example, if this file contains the line `include /usr/share/nano/c.nanorc` then nano will do syntax highlighting on C files. You can turn this on and off with Alt+Y.

On another note - if you just want to print a simple string in C, then please use puts not printf. Printf with one argument is silly and, depending on how you write it, also insecure.
|||

Do a `git status` and you will see `main.c` in red under _untracked files_ - this is a new file that git does not know about yet. Do `git add main.c` followed by another `git status` and the file is now green under _files to be committed_.

Commit the file with `git commit -m "first file"` or something like that - you need double quotes if you want spaces in your commit message. Try `git status` again and you should see _nothing to commit, working tree clean_ which means git is up to date with your files. Try `git log` and you will see that there is now one commit in the log.

|||advanced
Every git commit must have a commit message. You can either add one with the `-m` flag, or leave that off and git will drop you into the system default editor to write one. That is normally vi, which has a unique set of keyboard commands (the command to quit is `:q` followed by ENTER). You can run the shell command `export EDITOR=nano` to change your default editor, then a raw `git commit` will launch nano. If you want to keep this setting when you relaunch your shell next time you log in, then the export line has to go in a file called `.profile` in your home directory, which is a file that the bash shell processes when it starts up.

To keep a profile file around when vagrant rebuilds your VM if you're on a lab machine, I would put the file in `/vagrant/.profile` as that is backed up (it ends up in the folder on the host machine with the Vagrantfile) and then put the following command in your non-privileged provisioning block from the last advanced note: `ln -s /vagrant/.profile /home/vagrant/.profile`. This creates a soft link like you have already seen in `/bin` earlier.
|||

## Ignoring files

Compile your code with `gcc main.c -o program`, and check with `./program` that it runs and prints _Hi_. (If you get an error that `stdio.h` doesn't exist, then you have installed gcc but not `musl-dev` which is the package that contains the header files.)

If you look at `git status` now, the program file shows as untracked, but we do not want to commit it: the repository works best when you store only your source code, and anyone who needs to can check out a copy and build from there. Among other things this means that people on different platforms e.g. linux and mac, intel and ARM and so on can each compile the version that works for them.

So we want to tell git to ignore the program and changes in it, which we do by creating a file called `.gitignore` and adding an expression on each line to say which file(s) or folders to ignore - you can use `*.o` to select all object code files, for example.

  * Create a file `.gitignore` and add the single line `program` to it.
  * Do another `git status` and notice that while the program is now ignored, the ignore file is marked as new. This file does belong in the repository, so add it and commit it.
  * Check that `git status` reports _clean_ again, and that `git log` contains two commits.

## Commit and checkout

As you develop, you should regularly code, commit, repeat. To practice this, change _Hi_ to _Hello_ in the program, rebuild and run the program, then add and commit the source file again - check with `git status` at the end that you get _clean_ again.

The command `git add .` adds all new and changed files and folders in the current folder in one go, and is typically the quickest way to add things when you want to commit all your changes since the last commit.

Sometimes you want to go back and look at another commit, or undo a commit that broke something - this is when you want a checkout.

  * Use `git log` to show the history of your commits. (When you have more than one screen, `git log |less` lets you scroll.)
  * Note the first 6 or so characters of the commit hash of the commit where you added the ignore file, but before changing _Hi_ to _Hello_. You need at least 6 characters, but only as many so that it's not ambiguous to git which commit you mean.
  * Run `git checkout HASH` where HASH is the 6 or however many you need characters of the commit in question. Git will print a warning about the HEAD pointer.
  * Check the source file, and notice that it is now back on _Hi_.
  * Use `git checkout master` to return to the latest version of your files, and git will set up the HEAD pointer again ready to accept new commits.

|||advanced
If you actually want to undo a commit, then you have two options:

  * `git revert HASH` adds a new commit that returns the files to the state they were before the commit with the given hash. This is safe to use during team development, as it's just adding a new commit. If you have commits A, B and do `git revert B` then you get a new commit C so anyone else using the repository sees a sequence of commits A, B, C; but the state of the files in C is the same as in A.
  * `git reset HASH` undoes commits by moving the HEAD pointer back to the commit with the given hash, but leaves the working copy alone (you can use the `--hard` option to change the files as well). This will break things if you have shared your newer commits with other developers, but it's safe to use to undo changes that you haven't pushed yet (we'll learn about this next time). The effect is as if the commits which you've reset had never happened.

Note: if you want to revert a commit because you accidentally commited a file with secret information, and you've already pushed the commit, then you also have to look up online how to "force push" your changes to erase all traces of the file on github (or other online providers). If the secret file contained any passwords, even if you reverted the commit immediately, then you should consider the passwords compromised and change them at once.
|||
