# Hello World in React

In this exercise we will build a simple React app that greets the user, and so demonstrates managing state and passing it between components.

Create a react app folder with `npx create-react-app FOLDERNAME`. Edit the port if necessary, as described on the previous page.

You can start the development server (`npm start`) and it will automatically reload when it detects that you have edited a source file. This feature can be quite convenient to develop with.

We will create an app with three components:
  - The app component manages some state, namely a person's name.
  - The input component lets you enter and change your name.
  - The output compoment displays "Hello, NAME".

## A basic app

First, strip out the sample code so your `App.js` file looks like this:

```js
import './App.css';
import React from 'react';

class App extends React.Component {
  render() {
    return (
      <p>App</p>
    )
  }
}

export default App;
```

Save the file - if the `npm run` server is running in another window, it will reload - and check that you get a page with just the text `App`.

## Add some state

In the app class, we can add some state such as a name field:

```js
import './App.css';
import React from 'react';

class App extends React.Component {
  state = {
    name: 'David'
  }

  render() {
    return (
      <p>Hello, {this.state.name}!</p>
    )
  }
}

export default App;
```

Check that this now displays `Hello, David!`. 

## Pass state between Components

Let's make a separate component to display the name - add this class before the `export default` line:

```js
class NameGreeter extends React.Component {
  render() {
    if (this.props.name === "") {
      return (
        <p>Hello!</p>
      )
    } else {
      return (
        <p>Hello, {this.props.name}!</p>
      )
    }
  }
}
```

This component expects one property (the react version of a "parameter") called `name` and displays either a generic greeting or a greeting with a name.

Change the render method for the App class to this:

```js
render() {
  return (
    <NameGreeter name={this.state.name} />
  )
}
```

This tells react that when it's time to render the App, it should create a `NameGreeter` component and pass it one prop called `name` which has the value of the name in the current state.

Note how we refer to `this.state.name` in the component that owns the state, but `this.props.name` in the child component. Generally, `this.state` is a component's own state and `this.props` is state (or other things) that a component gets from its parent.

You could try making more than one name greeter, but a JSX block must always have a single root tag so this won't work:

```js
// don't do this
return (
  <NameGreeter name={this.state.name} />
  <NameGreeter name={this.state.name} />
)
```

But this is fine:

```js
return (
  <div>
    <NameGreeter name={this.state.name} />
    <NameGreeter name={this.state.name} />
  </div>
)
```

## Change State

We are going to make a `NameEditor` component with an input field to change the name. 
However, the name _belongs_ to the app component: this is the _state lifting_ pattern in React, where if more than one component wants to 'share' some state, then you make a common parent component to hold the state. Any changing of the state has to happen on the parent component that 'owns' it, so we have to create functions to pass it around correctly.

First, create a new component like this:

```js
class NameEditor extends React.Component {
  render() {
    return (
      <p>
        <label for="name">Name: </label>
        <input type="text" id="name" value={this.props.name} />
      </p>
    )
  }
}
```

And change the render method of the `App` component to create a name editor:

```js
return (
  <div>
    <NameEditor name={this.state.name} />
    <NameGreeter name={this.state.name} />
  </div>
)
```

When you run this, it will show you an input box with the current name, but if you try and change it then React will change it straight back again.

Input and output in React works with _data binding_: react maintains the correspondence between items on the screen (such as the input field) and its own state, but by default this only works in one way: React makes sure that the components on the screen reflect React's own state.

To make the edit box work, we have to first create a function on the `App` component that allows the state to be updated:

```js
class App extends React.Component {
  constructor() {
    super();
    this.onNameChange = this.onNameChange.bind(this);
  }

  onNameChange(newName) {
        this.setState({name: newName})
  }

  // state and render method here, same as before
}
```

The real work is happening in `this.setState`, we can't just do `this.state.name = newName` as that would not trigger React's updates. The `setState` function which is part of React, apart from setting the new state, also re-renders any component that needs to update itself.

The constructor is just boilerplate code to correctly re-bind the `this` variable for `onNameChange`, you have to do this for every method you write in a React class. You also need to call the `super()` constructor explicitly at the start of the constructor, as this calls the `React.Component` constructor to set the component up correctly.

We also have to let the name editor know which function to call to process changes. Change the JSX line that creates it to

```html
<NameEditor name={this.state.name} onNameChange={this.onNameChange} />
```

We did not put brackets after the function name, as we don't want to call the function when the component is created or rendered, we just want to tell it "here's a function that you can call later when you need it".

Next, in the `NameEditor` class, we create a method to handle updates:

```js
constructor(props) {
  super(props);
  this.onNameChange = this.onNameChange.bind(this);
}

onNameChange(e) {
  this.props.onNameChange(e.target.value);
}
```

If our component takes props, then we should pass them to the super constructor too.

The parameter `e` is an element of type event, which is triggered by the input component when the user changes its value. The event class has a property `target` which refers to the element on the page that triggered it, and if that was an input box like it is here then we can read its `value`. This is what we pass, via `props`, back to the `App` component.

Finally, change the line that creates the input box to

```html
<input type="text" id="name" value={this.props.name} onChange={this.onNameChange} />
```

The `onChange` attribute of an `<input>` is defined in the HTML standard and takes a JavaScript function that should be called whenever the input value changes.

With all this in place, you should be able to run the app and edit the text box, and watch the greeting change as you do this.

## Sequence of Events

Make sure you understand what happens when you type in the input box. You can observe this yourself if you set breakpoints in the F12 debug tools:

  1. You type in the input box.
  2. The browser reacts by calling the input box's `onChange` function with one parameter, an `Event`. This function is `NameEditor.onNameChange`.
  3. Your `NameEditor.onNameChange` calls `App.onNameChange`.
  4. `App.onNameChange` calls React's `setState`.
  5. In response to this, React calls `render()` on the `App`.
  6. This triggers further `render()` calls in both `NameGreeter` and `NameEditor`.

## Build the app

When you have finished developing an app, run `npm run build`. This will create your app in `build/`, compiling the JSX to JavaScript and HTML files. You can open `build/index.html` in a web browser without a server running.

## Read all about it

We have essentially, with a different example, done step 10 of the [official React tutorial](https://reactjs.org/docs/lifting-state-up.html). After the workshop, you may want to read this page again.
