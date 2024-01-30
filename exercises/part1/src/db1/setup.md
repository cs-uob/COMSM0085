# Set up the database

## History

In this unit, we will be using the free database MariaDB, which is a clone of MySQL and was written by the same author - Michael "Monty" Widenius, from Finland. The history behind the naming is that Monty first created MySQL (named after his daughter, My) which became the most popular open-source database. He sold MySQL to Sun, who were in turn bought by Oracle - who are famous for their commercial database software. As a result, Monty created a clone of MySQL called MariaDB (named after his other daughter). MySQL and MariaDB are compatible in many ways and most of what we learn on this unit will apply equally to both of them, although both Oracle (for MySQL) and the open-source community (for MariaDB) have added new features to their databases.

Although we will be using MariaDB, in some places the name MySQL will still appear - most notably as the name of the command-line program that you use to access the database.

## Install the database

Open your VM and install the database with the appropriate commands.
On Debian that is:

```sh
$ sudo apt install mariadb-{server,client}
```

|||advanced
What's that funky squiggly bracket doing?  Bash expands it to
`mariadb-server mariadb-client`.  Similarly if you typed: 
`cc -o hello{,.c}` it would get expanded to `cc -o hello hello.c`.
There are *loads* of shorthand tricks for typing stuff quicker in a
shell: try and pick them up as you go!

**Question:** What does `echo {a,b,c}-{1,2,3}` print?  Try and guess
before running it.
|||

The `mariadb-server` package contains the server that stores the data and lets clients log in. `mariadb-client` is a command-line client (with the command name `mysql`); later on we will also use a Java client to access a database from a Java application.

The database server is now installed, but our system won't start it
unless you ask it to.  On Debian the service manager is *SystemD*.  We
can start the server running with:

```sh
$ sudo systemctl start mariadb
```

Check that the service is running with

```sh
$ sudo systemctl status mariadb
$ sudo journalctl -u mariadb
```

Set it to run by default with:

```sh
$ sudo systemctl enable mariadb
```

|||advanced
Whilst Linux has *more or less* standardized on using SystemD as the
service manager... it is unpopular in certain quarters.  Other systems
exist!  Alpine Linux (which was the VM image we *used* to use) uses
OpenRC.  The BSDs mostly do it with a hodge-podge of shellscripts.
Macs use something called `launchctl`.

The argument against SystemD is that it breaks compatibility with the
POSIX OS standard and goes against _The UNIX Way_ (do one thing
well); that the developer Lennart Poettering is a bit controversial
(soft skills are important!);
and quite frankly the overreach of the project is incredible.  As well
as managing services it can also encrypt your home folder, manage WiFi
connections, manage your log files and system name and much, much, more.

The arguments for it are that it is fast, gets rid of a bunch of janky
shell scripts, and standardizes things in a way that makes sense for
Linux.  Linux distro's used to be much more diverse but nowadays the
choice is mostly what package manager do you want to use and what
desktop do you want by default.

For now SystemD seems to be what we've settled on for Linux.  It's
mostly fine once you learn it but do try a BSD system and see what it
used to be like and if you prefer it!
|||

## Security

To log in to a database, you normally need a user account and an
authentication factor (such as a password, or a private key). However,
in the latest version, mysql user accounts are linked to system user
accounts. You should probably secure it though.  Running a
public-facing database without security will end in databreaches and
fines quicker than you can type `metasploit`.

The default set-up will allow anyone to log in and see some of the
database, for example the `test` tables but this is not particularly
secure. Most distributions come with a `mysql_secure_installation`
script that sets up more secure access rights. Run it and set a
password for the root user (otherwise it'll be the default root
password or blank).
    
## Creating a database

Right, you have a mysql server running! Lets connect it to a database!
To create the database:

```sh
mysqladmin -u root -p create mydatabase
```

To connect to it:

```sh
mysql -u root -p mydatabase
```

That should drop you into a prompt!  Congratulations! You have a
running database.

## Importing sample data

We have prepared some sample data that we will be using in this and the following weeks.

First, download the following two files and place them in the same folder as your Vagrantfile. This folder is important as the `sample-data.sql` script contains hard-coded absolute paths starting in `/vagrant/` to import some of the data. You can download the files the same way as you did before with the secure setup file.

```sh
cd /vagrant
wget https://raw.githubusercontent.com/cs-uob/COMSM0085/master/code/databases/sample-data.sql
wget https://raw.githubusercontent.com/cs-uob/COMSM0085/master/code/databases/sampledata.tar
tar -xvf sampledata.tar
```
This creates a folder sampledata with the files we need.

If you are using a local copy of this repository, you can also find the files under `/code/databases`.

The `tar` file is a _tape archive_: a file that contains further files and folders, as if it were a folder itself. 

|||advanced
The options here are x=extract a file, v=verify (print the name of every processed file to standard output), f=the filename is in the following argument. You may sometimes see this command without the '-' for these options -- this works because `tar` supports an older convention where options are not prefixed with a dash, but to be safe you should stick to the modern convention (which it also understands).

To create a tar file yourself, the command would be `tar -cvf ARCHIVE.tar FILE1 FILE2...` where c=create the archive if it doesn't exist, and assume all arguments not consumed by another flag refer to files to be added. In fact, `tar -xvf ARCHIVE.tar FILES...` also works and only extracts the named files from the archive.
|||

Load the sample data with the following command:

```sh
mysql -u root -p -e 'source /vagrant/sample-data.sql'
```

This pulls in some data in CSV files (have a look at the script if you want) and creates a default user "vagrant" who can log in to the database without a password, but can only read and not write the two sample databases "census" and "elections". There is another database called "data" which starts out empty, and "vagrant" can both read and write it.

|||advanced
It also seems to throw a bunch of errors and was left to us by the
people who previously ran the unit.  It's on our list of jobs to fix,
but it seems to work anyway?  YOLO.  Pull requests appreciated.
|||

You can now log in to the database and try the following:

  * `mysql` on its own logs you in, you now get the database prompt `MariaDB [(none)]>` to show that you haven't loaded a particular database yet.
  * `SHOW DATABASES;` on the database prompt gives you a list of databases which you have access too.
  * Select one with the USE command, for example `USE elections;`. Your prompt should now read `MariaDB [elections]>`.
  * `SHOW TABLES;` will show the tables in the selected database.
  * There's a Party table in the elections database, so `SELECT * FROM Party;` will show you the data.
  * You could also use `DESCRIBE Party;` to show a list of columns and types in the Party table.
  * Finally, `exit` or Control+D on a line of its own gets you back to the shell.

You can open the SQL and CSV files under `/vagrant/sampledata` to compare with the output you get from MariaDB. Study this until it makes sense to you. The `setup.sql` files contain the database schemas and the `import.sql` ones pull in the sample data.

## On a lab machine

On a lab machine, to save disk space your VMs may not remain between
reboots - and because they are not hosted on the network file system,
if you log in to a different machine next time, your changes will not
be saved either but you will get the VM reinstalled from scratch. To
make sure the database is ready whenever you need it, open the
`Vagrantfile` in a text editor and add the setup commands to the
provisioning script. The commands are the same ones that we have done just now
manually.
