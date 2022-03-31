# Setting Things Up

The application lives in the `code/application` folder of the unit repository.

## The Database

For the application to work, you will need a MariaDB database that serves the `census` database.

If you want to run the database on a vagrant VM but the Java application on your own machine (this is the recommended way), make sure the VM is serving the database correctly:
  - MariaDB must be installed on the VM and the census database installed as described earlier in the unit.
  - Port 3306 must be exported in the `Vagrantfile`.
  - The `/etc/my.cnf.d/mariadb-server.cnf` must have the `skip-networking` line commented out or removed.

If you want to run the database and the Java application on your vagrant VM, make sure that the following are set up:
  - MariaDB must be installed on the VM and the census database installed as described earlier in the unit.
  - You must export port 8000 in the `Vagrantfile`. You do not need to export port 3306 to the host, as both the database and the application using it will be running on the VM.
  - Either the `/etc/my.cnf.d/mariadb-server.cnf` must have the `skip-networking` line commented out or removed, or in `src/main/resources/application.properties` you must add `?localSocket=/var/run/mysqld/mysqld.sock` to the end of the data source URL to use a socket instead of a network (TCP) connection.

If you want to run everything on your own machine, then you need to install and run MariaDB and make sure the server is running on port 3306 (this proably means uncommenting `skip-networking` in a configuration file). By default, the Java application expects the database to have a username of `vagrant` and an empty password, but you can edit this in `src/main/resources/application.properties`.

## The React Client

The client lives in `code/application/client` in the unit repository.

There are two ways to run the client. First (and recommended), install nodejs and npm if you have not done so already - this can be on a VM or on your local machine - open a terminal in the `client` folder and run the following:

  - `npm install` to download and install the dependencies. These will end up in a folder `node_modules`, which is (sensibly) excluded from the repository via a `.gitignore` file in the same folder. You will get some warnings which you can ignore for now.
  - `npm run-script build` will build the application and put the results in the `build` folder (which is also sensibly excluded from the repository).
  - Copy the contents of the `build/` folder to the folder `../src/main/resources/static/` (the `../` is relative to the `client/` folder)  for the Java application to serve.

If you are actively developing the react application, then instead of building it you can use `npm start` which will run a development server on `localhost:3000`. The advantage of this method is that whenever you change a source file in the client folder, it will recompile and reload the react client automatically.

## The Java Application

In the folder `code/application` in the repository, there is a maven `pom.xml` file.
  - Open this folder in a terminal and run `mvn spring-boot:run`.

This will automatically download any dependencies.

You can now point your browser at `localhost:8000` and you should see an overview of the regions of England. Clicking an item such as a region navigates to it, and the _Details_ link loads the employment statistics for the current unit in a second panel on the right-hand side.

## Developer Tools

For the following walkthrough of the application it is helpful to have everything running and to have the browser's F12 developer tools open in the tab running the application.

Since this is a React app, you may also want to install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) extension if you are using a Chrome-based browser (chrome, chromium, edge etc.). This provides extra React debugging and development integration, for example a new _Components_ tab showing the structure of the React components on the page with their state and props.
