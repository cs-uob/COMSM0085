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

You now have a running database and you can log in with `mysql`. However, the database will allow anyone to log in and change anything, which is not what you want - especially not on a production machine.

Most distributions come with a `mysql_secure_installation` script that prompts you for a database root password and sets up accounts. We are going to do a similar thing, but with a custom setup for our purposes.

  * Run `mysql -u root`. This should log you in as root without any authentication, which explains why I am making such a fuss about security! Quit again by typing Control+D.
  * Run `mysql -u root -e 'source /vagrant/secure-setup.sql`. The `-e` command means "run the following command line argument as a script", as you know already from sed and several other tools; `source` means "load a file and run it" and the file in question is part of the lab package I have prepared for you.
  * Run `mysql -u root` again. This time, it will not let you in, which is what we want.

The secure-setup script is as follows:

```sql
UPDATE mysql.user SET Password=PASSWORD('BA/458cR-5p.') WHERE User='root';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
```

The first line sets a root password, and also shows the absolute minimum standard for a password: 12 characters, mix of uppercase, lowercase and symbols, random-ish. This is the password that you will be using to log in as root to your database on the VM, but of course you can change it if you want to.

  * Type `mysql -u root -p` on the command line and press Enter. `-p` means "if a password is needed, prompt for one". You will be asked for the root password, type it in (without the quotes) and you should be let back in to the database. Once you are in, if you'd like to, you can use the first command from the secure-setup script to set a new password of your own.

The next two lines remove some default users: one with the empty username, and all versions of root that let you log in over the network. The only versions of root that still exist are now "localhost" (e.g. from the same machine), 127.0.0.1 (same thing but using IPV4 notation) and "::1" (same in IPv6). This means that now, if your VM is connected to the internet, you cannot log in as root remotely at all, even with the password, which is the correct attitude to security. To administer a database, you should always first log in to the machine via ssh using a key file, then log in to the database from the machine itself.

Next in the setup script, we remove the default test database and user.

Finally, `FLUSH PRIVILEGES` updates the in-memory cache of the users table, making your new permissions take effect.

Note: what happens when you install the mariadb package (or install it from a ZIP file) depends on the distribution. For some distributions, installing the package automatically creates a database, and adds the server to the default runlevel. Alpine will not do any of these things for you - you have to configure it itself, which is a good opportunity to learn what's going on behind the scenes in other distributions. Most distributions will not, however, configure the security settings automatically - some of them prompt for a root password at installation, but typically leave the test database and let root login remotely. Wherever you install mariadb or mysql, please check this yourself - an unsecured database is something that hackers will be keeping an eye out for.

## Importing sample data

I have prepared some sample data that we will be using in this and the following weeks.

First, download the following three files and place them in the same folder as your Vagrantfile. You can do this for example with `wget ADDRESS` in Alpine linux; `wget` is a download program.

```
https://cs-uob.github.io/COMS10012/resources/databases/sample-data.sql
https://cs-uob.github.io/COMS10012/resources/databases/secure-setup.sql
https://cs-uob.github.io/COMS10012/resources/databases/sampledata.tar
```

If you are using a local copy of this repository, you can find the files under `/resources/databases`.

The `tar` file is a _tape archive_: a file that contains further files and folders, as if it were a folder itself. Extract it by going to `/vagrant` in Alpine and run

    tar xvf sampledata.tar

This creates a folder sampledata with the files we need.

|||advanced
Note that `tar` uses an older convention where options are not prefixed with a dash; the options here are x=extract a file, v=verify (print the name of every processed file to standard output), f=the filename is in the following argument.

To create a tar file yourself, the command would be `tar cvf ARCHIVE.tar FILE1 FILE2...` where c=create the archive if it doesn't exist, and assume all arguments not consumed by another flag refer to files to be added. In fact, `tar xvf ARCHIVE.tar FILES...` also works and only extracts the named files from the archive.
|||

Load the sample data with the following command, which will ask for your root password:

```sh
$ mysql -u root -p -e "source /vagrant/sample-data.sql"
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
  * Following the `apk add` line in your Vagrantfile, add the following lines:

```sh
/etc/init.d/mariadb setup
rc-update add mariadb default
rc-service mariadb start
mysql -u root -e 'source /vagrant/sample-data.sql'
mysql -u root -e 'source /vagrant/secure-setup.sql'
```

This ensures that whenever vagrant recreates the VM, it installs the database for us. The commands are basically the ones that we have done just now, except that we source the sample data before running the secure setup. This is so that the sample data command does not need a password, as none has been set so far - that only happens during the secure setup command.
