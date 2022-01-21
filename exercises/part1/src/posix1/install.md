# Installing vagrant and alpine linux

[Vagrant](https://www.vagrantup.com/) is a program to manage virtual machines (VMs). Based on a configuration file called a `Vagrantfile`, it can download and configure disk images, which it calles boxes, and call other programs to run them. Vagrant does not run the VM by itself, so you will need another program like [virtualbox](https://www.virtualbox.org/) for that.

## Installing on your own machine

To use vagrant on your own machine (recommended), follow these steps:

  * Go to [https://www.vagrantup.com/downloads](https://www.vagrantup.com/downloads) and download the version of vagrant for your operating system. Windows, Mac OS and common versions of linux are supported.
  * Download and install virtualbox from [https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads).
  * Reboot your machine.

If you are on linux, you can of course also install the programs from your distribution's repository. Vagrant's developers actually recommend against this because they claim that some distributions package outdated versions, but it is your choice.

## Configuring a box

Next, you are going to configure a virtual machine using [alpine linux](https://www.alpinelinux.org/), a minimal linux distribution that we will be using in this unit. 

  * Create an empty folder somewhere.
  * In that folder, create a file called Vagrantfile (capitalised, and with no extension) and add the following lines to it - or just download the file from [here](../resources/Vagrantfile):

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "generic/alpine314"
  config.vm.synced_folder ".", "/vagrant"

  config.vm.provision "shell", inline: <<-SHELL
    apk add libc6-compat
  SHELL
end
```

This configuration file is actually a script in the ruby programming language, but you don't need to learn that to use vagrant. Let's look at what it does.

  * `config.vm.box` selects the virtual machine image, or box in vagrant-speak, to use. You can see a list of available ones at https://app.vagrantup.com/boxes/search.
  * `config.vm.synced_folder` sets up a shared folder between the guest (virtual machine) and host (your machine).
  * The `config.vm.provision` runs a provisioning command when the box is first downloaded and installed. These commands run as root on the virtual machine, and in this case we are using the `apk` package manager (we will talk about this later on) to install the packages `libc6-compat`.
  * The `<<-SHELL` construction is called a "here document", and is a way in some programming languages of writing multi-line strings. It tells ruby to treat everything until the closing keyword SHELL (which is arbitrary) as a string, which can contain several lines.

|||advanced
Alpine linux uses the musl libc distribution, which is smaller than and has a few distinct differences from the normal GNU libc. To avoid these incompatibilities causing you hard-to-find problems when you are compiling C programs, we are installing `libc6-compat` that makes alpine compatible with the standard libc.
|||

## Running vagrant

  * Open a terminal in the folder containing the Vagrantfile. If you are on windows, both the windows CMD and the windows subsystem for linux terminal will work equally well for this purpose.
  * Run the command `vagrant up`. This starts the virtual machine configured in the current folder, and if it has not been downloaded and provisioned yet (as is the case when you run `up` for the first time) then it does this for you as well.
  * When vagrant tells you the machine is running, run `vagrant ssh` to log in to your virtual machine. If it asks you for a password, use `vagrant`.
  * You should now see the virtual machine prompt `alpine310:~$`. Try the command `ls /` and check that there is a folder called vagrant in the top-level folder, along with system ones with names like `usr` and `bin`.

There are two kinds of errors you might get during `vagrant up`:

  - If vagrant complains that it can't find a provider, then you have probably not installed virtualbox, or not rebooted since installing it.
  - If you get some odd crash or error message about hypervisors, see the page [https://www.vagrantup.com/docs/installation](https://www.vagrantup.com/docs/installation) for instructions, section _Running Multiple Hypervisors_. Basically, you cannot run vagrant when another program is already using your processor's virtualisation subsystem, and the page gives instructions how to turn off the other one.

## Shutting down cleanly

To exit the virtual machine, type `exit` which will get you back to the shell on the host machine. On the host, `vagrant halt` cleanly shuts down the virtual machine.

Promise yourself that you will always do this before turning off your computer, if you have been using vagrant!

## Running on a lab machine

Vagrant is already installed on the lab machines in MVB 2.11, so you can remotely log in and launch a box from there. This will get you exactly the same alpine environment as if you run on your own machine, and everyone should try this out too. If for some reason you cannot run vagrant on your machine, then as long as you have an internet connection you should still be able to run it on the lab machines.

First, we connect to a lab machine: open a terminal and run the command `ssh lab` that you configured in the previous section on SSH.

On the lab machine, we need to create a folder and load a Vagrantfile as above, but let's download the Vagrantfile from the unit webpage instead of typing it out. Run the following shell commands (the third one starting `wget` must be all on one line, even if your web browser has added a line break):

```sh
mkdir softwaretools
cd softwaretools
wget https://raw.githubusercontent.com/cs-uob/COMS10012/master/exercises/part1/src/resources/Vagrantfile
```

You can call the top folder (softwaretools) anything you like and put it anywhere you want. You can now run `vagrant up` followed by `vagrant ssh` from inside that folder.

|||advanced
When you `vagrant up`, vagrant internally connects port 22 on the guest (which `sshd` on the guest is listening to) to port 2222 on the host. When you provision a vagrant machine, this creates a key pair on the host and loads the public key into the guest. The private key is actually in the file `.vagrant/machines/default/virtualbox/private_key` on the host, and the public key in `/home/vagrant/.ssh/authorized_keys` on the guest. So what `vagrant ssh` does is launch `ssh -i KEYFILE vagrant@localhost -p 2222`.
|||

## Warning about lab machines - read carefully!

Your files in your home directory on a lab machine are stored in a network folder, so that you see the same files whichever lab machine you log in to; they are also automatically backed up.

If lots of students created lots of VMs in their home folders, this would take up lots of space, and it would be slow: running an operating system over a network share causes both bandwidth and latency problems.

Instead, IT has configured vagrant on the lab machines to store VMs in the `/tmp` folder which is local to each machine. This means that:

  * If you log in to a different lab machine, your VMs will be gone.
  * If you log in to the same lab machine but it has restarted since you last logged in, your VMs will be gone.
  * Your VMs, and with them any files you store in the VM itself, are not backed up.

This is not as much a problem as it seems because this is how virtual machines are meant to work: if one is not available, vagrant downloads and provisions it. For this reason, for any software you want installed on your VMs in the lab machines, you should write the install command into the provisioning script in the Vagrantfile so it will be re-installed the next time Vagrant has to set up the VM. We will learn how to do this soon.

However, this still leaves files that you create on the VM itself, such as the ones you will create for the exercises in this unit. The basic warning is that _any files in your home directory will be lost when the VM is rebuilt_. That is why we have set up a shared folder which you can access as `/vagrant` on the VM, which maps to the folder containing your Vagrantfile on the host machine. Because this is stored under your home folder on the lab machine, it lives on the network file store and so it is backed up and available from all lab machines.

So whenever you log in to a VM on a lab machine to do some work, you should `cd /vagrant` and use that instead of your home folder for any files that you don't want to lose. If you are running vagrant on your own computer, then nothing will be deleted except if you give vagrant a command to rebuild the VM yourself.
