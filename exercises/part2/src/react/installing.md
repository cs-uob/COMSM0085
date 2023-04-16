# Installing React

## Nodejs and NPM

JavaScript's original selling point was that it runs in the browser. [NodeJS](https://nodejs.org) is a JavaScript runtime without a browser, so you can for example write a server / back-end in JavaScript too. Using a library called [Electron](https://electronjs.org), you can even write desktop apps in JavaScript/NodeJS (Electron is essentially google's Chrome browser without the branding, so you can use it to build your own user interface.) We will need NodeJS to run React, which compiles JSX code into JavaScript and HTML.

NodeJS comes with its own package manager, NPM (NodeJS Package Manager). The shell command to run it is `npm`, but there is also `npx` which downloads the latest version of a package and immediately runs it, if it contains a command-line tool.

  - Install NodeJS for your operating system. On alpine, use `sudo apk add nodejs npm`; for other operating systems you can download it from [nodejs.org](https://nodejs.org/en/) or use your system's package manager, if available.

## Your first React app

  - Create a new react app with `npx create-react-app FOLDERNAME`. You cannot call the folder `react` itself, so please choose a different name. Downloading and preparing everything for the first time might take a while.
  - By default, react uses port 3000 for its server. If you want another port, like 8000, edit `package.json` and edit the line 

``` 
"start": "react-scripts start",`
```

to read as follows

```
"start": "PORT=8000 react-scripts start",
```

  - Start the react app with `npm start` inside the folder with the `package.json` and open your browser on `localhost:8000` or whichever port you are using (the default is 3000). You should see a message "Edit `src/App.js` and save to reload." in your browser.

## Explore the Code
Have a look at the structure of the project files:

  - `package.json` is the configuration file (like the `pom.xml` for Java/maven).
  - The page being served is `public/index.html` although the server replaces `%PUBLIC_URL%` itself (in development this just becomes the empty string). Note the contents of the page are essentially `<div id="root"></div>`, but if you look at the source in the browser (Control+U) you will see that react has added a line at the end of the body pulling in the JavaScript files. If you look with the developer tools (F12) you will see that the content of the app has been added as a child of the root div.
  - The code lives in `src/`, mainly in `src/App.js`. The default code uses a function style component rather than a class style one, but the elements you see in the JSX code here (the HTML-embedded-in-JavaScript) are the ones that you saw in your browser inside the root div.
