# Set up the database

## History

In this unit, we will be using the free database MariaDB, which is a clone of MySQL and was written by the same author - Michael "Monty" Widenius, from Finland. The history behind the naming is that Monty first created MySQL (named after his daughter, My) which became the most popular open-source database. He sold MySQL to Sun, who were in turn bought by Oracle - who are famous for their commercial database software. As a result, Monty created a clone of MySQL called MariaDB (named after his other daughter). MySQL and MariaDB are compatible in many ways and most of what we learn on this unit will apply equally to both of them, although both Oracle (for MySQL) and the open-source community (for MariaDB) have added new features to their databases.

Although we will be using MariaDB, in some places the name MySQL will still appear - most notably as the name of the command-line program that you use to access the database.

## Install the database

Open the Alpine virtual machine and install the database with

```sh
$ sudo apk add mariadb mariadb-client
```

The `mariadb` package contains the server that stores the data and lets clients log in. `mariadb-client` is a command-line client (with the command name `mysql`); later on we will also use a Java client to access a database from a Java application.

The database server is now installed, but we still need to create a database:

```sh
$ sudo /etc/init.d/mariadb setup
```

Files in `/etc/init.d` are service scripts; services are commands that can be started automatically when the machine starts and often run in the background - in this case the mariadb service runs the server so that clients can connect to it. We had to use the full path as the `/etc/init.d` folder is not normally in your PATH variable, as it's mostly used by the system rather than directly by users. We are manually calling the service's `setup` command to create the database - if you look inside the service script, you'll see that it calls the `mariadb_install_db` program to create a database in `/var/lib/mysql`. This path is not writable for normal users, so we need sudo on this command.

If you read the output of this command, you will see a warning about security. This is important and we will come back to it.

We now have a database, but the server is not running yet. We can start it for now with

```sh
$ sudo rc-service mariadb start
```

Check that the service is running with

```sh
$ rc-status
```

This should show `mariadb [ started ]` somewhere at the bottom under the "manual" runlevel. This means we've started the server, but it won't start automatically next time we restart the machine. Let's change that:

```sh
$ sudo rc-update add mariadb default
```

This adds the mariadb service to the "default" runlevel, which is for things that you want to start when the machine starts. For example, the ssh service is already here otherwise you would not be able to log in to the machine with `vagrant ssh` at all. Check with another `rc-status` that mariadb is still running, but now listed under "default".

## Security

To log in to a database, you normally need a user account and an authentication factor (such as a password, or a private key). However, in the latest Alpine version, mysql user accounts are linked to system user accounts. Try out the following:

  - As `vagrant`, log in to the database with `mysql`. You should see the mysql prompt. Try `SHOW DATABASES;` including the semicolon at the end, and press ENTER. You should see two databases including a default one called `test`. Exit again with `exit` or Control+D.
  - Try `sudo mysql` then `SHOW DATABASES;` again. You should now see more databases, including one called `mysql`. Next type `SELECT Host,User from mysql.user;`. Then log out again.

If you see three or four lines of result from the above which are _all_ prefaced with 'localhost' in the Host column, then you don't need to execute the script mentioned below (though the rest of this section is still worth reading to understand more about mysql database security), and indeed trying to execute the script will result in an error message (because you attempt to remove something that doesn't exist). 

The mysql command line tool tries to log you in to the database using the same user account as your current system one - it uses a system call to get the id and name of the user calling it - so when you run it as the system root user (with sudo), then you also get logged in to the database as the database root user, which is why you can see more databases. The `mysql` database contains tables with database configuration including user accounts and other settings.

The default set-up will allow anyone to log in and see some of the database, for example the `test` tables. This is not particularly secure. Most distributions come with a `mysql_secure_installation` script that sets up more secure access rights. We are going to do a similar thing, but with a custom setup for our purposes.

The setup file is located at the address given below. You can download it for example with `wget ADDRESS` in Alpine linux; `wget` is a download program. Place it in the same folder as your Vagrantfile (in `/vagrant`, if you're doing the download from within Alpine).

```
https://raw.githubusercontent.com/cs-uob/COMSM0085/master/code/databases/secure-setup.sql
```

  - Run the command `sudo mysql -e 'source /vagrant/secure-setup.sql'` to run this script as the database root user.
  - Now try a simple `mysql` again. This time, it should not let you log in.

The `-e` option to mysql means "run the following command line argument as a script", as you know already from sed and several other tools; `source` means "load a file and run it" and the file in question is part of the lab package I have prepared for you.

The secure-setup script is as follows:

```sql
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
```

The first two lines remove some default users: one with the empty username, and all versions of root that let you log in over the network. The only versions of root that still exist are now "localhost" (e.g. from the same machine), 127.0.0.1 (same thing but using IPV4 notation) and "::1" (same in IPv6). This means that now, if your VM is connected to the internet, you cannot log in as root remotely at all, which is the correct attitude to security. To administer a database, you should always first log in to the machine via ssh using a key file, then log in to the database from the machine itself.

Next in the setup script, we remove the default test database and user.

Finally, `FLUSH PRIVILEGES` updates the in-memory cache of the users table, making your new permissions take effect.

Note: what happens when you install the mariadb package (or install it from a ZIP file) depends on the distribution. For some distributions, installing the package automatically creates a database, and adds the server to the default runlevel. Alpine will not do any of these things for you - you have to configure it itself, which is a good opportunity to learn what's going on behind the scenes in other distributions. Most distributions will not, however, configure the security settings automatically - they typically leave the test database and let root login remotely. Wherever you install mariadb or mysql, please check this yourself - an unsecured database is something that hackers will be keeping an eye out for.

## Importing sample data

I have prepared some sample data that we will be using in this and the following weeks.

First, download the following two files and place them in the same folder as your Vagrantfile. This folder is important as the `sample-data.sql` script contains hard-coded absolute paths starting in `/vagrant/` to import some of the data. You can download the files the same way as you did before with the secure setup file.

```
https://raw.githubusercontent.com/cs-uob/COMSM0085/master/code/databases/sample-data.sql
https://raw.githubusercontent.com/cs-uob/COMSM0085/master/code/databases/sampledata.tar
```

If you are using a local copy of this repository, you can also find the files under `/code/databases`.

The `tar` file is a _tape archive_: a file that contains further files and folders, as if it were a folder itself. Extract it by going to `/vagrant` in Alpine and run

    tar -xvf sampledata.tar

This creates a folder sampledata with the files we need.

|||advanced
The options here are x=extract a file, v=verify (print the name of every processed file to standard output), f=the filename is in the following argument. You may sometimes see this command without the '-' for these options -- this works because `tar` supports an older convention where options are not prefixed with a dash, but to be safe you should stick to the modern convention (which it also understands).

To create a tar file yourself, the command would be `tar -cvf ARCHIVE.tar FILE1 FILE2...` where c=create the archive if it doesn't exist, and assume all arguments not consumed by another flag refer to files to be added. In fact, `tar -xvf ARCHIVE.tar FILES...` also works and only extracts the named files from the archive.
|||

Load the sample data with the following command:

```sh
sudo mysql -e 'source /vagrant/sample-data.sql'
```

This pulls in some data in CSV files (have a look at the script if you want) and creates a default user "vagrant" who can log in to the database without a password, but can only read and not write the two sample databases "census" and "elections". There is another database called "data" which starts out empty, and "vagrant" can both read and write it.

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

On a lab machine, to save disk space your VMs may not remain between reboots - and because they are not hosted on the network file system, if you log in to a different machine next time, your changes will not be saved either but you will get the VM reinstalled from scratch. To make sure the database is ready whenever you need it, open the `Vagrantfile` in a text editor and make the following changes.

  * On the line starting `apk add`, add the packages `mariadb` and `mariadb-client` to the end, separated by spaces.
  * Download and save the three setup files (`sample-data.sql`, `secure-setup.sql` and `sampledata.tar`) in the same folder as your Vagrantfile (this is on the host machine, so it will not get deleted along with the VM). 
  * Extract the tar file so that there is a folder `sampledata/` in the same folder as your Vagrantfile.
  * Following the `apk add` lines for mariadb in your Vagrantfile, add the following lines (obviously, exclude the line for `secure-setup.sql` if you didn't need to do this above):

```sh
/etc/init.d/mariadb setup
rc-update add mariadb default
rc-service mariadb start
mysql -e 'source /vagrant/secure-setup.sql'
mysql -e 'source /vagrant/sample-data.sql'
```

This ensures that whenever vagrant recreates the VM, it installs the database for us. The commands are the same ones that we have done just now ourselves.
