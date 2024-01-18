# Set-up

From this point on we will be running web servers on our development environment, and connecting to them with web browsers. To get this to work we need to set some things up first, so please follow the instructions for your environment:

## Lab machine, native

These instructions apply if you are working directly on a lab machine (not using a Vagrant VM).

You do not need to set up anything special. As you are not root, you can only serve from TCP ports 1024 or above, but that is not a problem - we will use port 8000 by default.

Proceed directly to [exploring HTTP](explore.md).

## Lab machine, with Vagrant

If you want to run a server inside a Vagrant VM and connect to it with a browser directly on the lab machine (outside the VM), then you will need to tell Vagrant which ports within the VM to make available outside the VM. Open your Vagrantfile and add the line

    config.vm.network "forwarded_port", guest: 8000, host: 8000

in the main block (just before the `config.vm.provision` line will do), then restart your VM if it is already running. This tells Vagrant to open a server on port 8000 on the host (the lab machine), and forward any traffic it receives to port 8000 on the VM.

You can now start the VM, run a server inside the VM, and connect to it from the browser on the lab machine.

Proceed to [exploring HTTP](explore.md) and run the server (the `nc` command) inside the VM, but use the browser on the lab machine directly. Note that the `http-response` file mentioned on that page needs to go in the correct folder inside the VM, where you started the server.

## Your own machine, without Vagrant

If you have a system that supports the `nc` and `wget` commands (Mac OS, Linux or WSL should all offer the option to install them) then you can proceed directly to [exploring HTTP](explore.md).

You might get one or more firewall warning pop-ups, which you will have to "allow".

## Your own machine, with Vagrant

Configure vagrant as in the section "Lab machine, with Vagrant" above, that is add the line

    config.vm.network "forwarded_port", guest: 8000, host: 8000

to the Vagrantfile and restart Vagrant. You can now run servers in the VM and clients (such as your favourite browser) on your own machine.

You might get firewall warning pop-ups, which you will have to "allow".

Proceed to [exploring HTTP](explore.md). If you don't have `wget` on your own machine, you can open a second terminal and log in to the VM from there, then run both `wget` and the server inside the VM that way - then later on, when you're using a browser instead of `wget` for the client, you can just open the browser on your own machine.

## Over SSH

For security reasons, you will not be able to run a web server on a lab machine (whether in a VM or not) and connect to it from your local web browser. If you have no other option than to use a remote connection, you should use [x2go](https://wiki.x2go.org/doku.php/download:start) to connect to a lab machine with a graphical user interface, and run both the server and browser through that. This software uses ssh internally so you need to connect to `rd-mvb-linuxlab.bristol.ac.uk` using `seis.bris.ac.uk` as the proxy server.
