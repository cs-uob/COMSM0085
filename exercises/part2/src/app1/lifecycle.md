# React Lifecycles

React components have a [lifecycle](https://reactjs.org/docs/react-component.html). The first important rule is that react can call `render()` any time it likes, and your implementation must always do something (other than crash) even if the component is not in a useful state. For example, if no data has been loaded yet then you can just display "loading ..." as we do in this example application, using the `state.loaded` flag to keep track of whether there is data to display or not.

React will call certain lifecycle methods on your component:

  - `componentDidMount` gets called after the component is created and rendered for the first time. If you need to load data asynchronously (as we do here) then this is the method to do it in (in our case we delegate to `_fetchData` because there's another lifecylce method that wants to use this code too).
  - `componentDidUpdate` gets called after a component's props or state have changed. This is another place where you can make network requests, for example.
  - `componentWillUnmount` gets called before react removes a component. We do not need this in our application, but it can be used to e.g. save some data before the component "closes".

In `componentDidUpdate`, you should always check if this is a "real" update with an if-condition guard. Otherwise, you create an infinite loop: if `componentDidUpdate` calls `setState`, then the state change triggers another `componentDidUpdate` call. So this code:

```js
componentDidUpdate(oldProps) {
    if (this.props.code !== oldProps.code) {
        this.setState({loaded: "no"});
        this._fetchData()
    }
}
```

only does anything if the props have just changed, namely because the parent component has just re-rendered us with a new code and/or type of geographical unit to display. In this application, that can only happen in a `navigate()` call.

This application also shows an example of _separation of concerns_: the `App` itself is in charge of holding the information on what item is currently being displayed, and knowing that e.g. the child elements of a country are called regions. The app class is also responsible for knowing how to navigate: the `OverView` can ask the app to navigate, but the app could in principle also refuse this. The app class does not however deal with loading, storing or displaying data for the individual countries, regions or other geographical units.

The `OverView` component's responsibility is to display the information for the object it is currently given via its props. It does not know how to navigate (beyond passing requests to the app) but it does know, given a code and a type, how to fetch, store and display that object.

The general pattern here is that the `OverView` updates its _state_ based on its _props_ - remember that a component's state is the "stuff it manages itself" whereas props are "stuff the parent is in charge of managing". This is a common pattern in react programming, but it has some complexities and the recommended solution has changed over time. In this application we follow the recommendation in the [component documentation](https://reactjs.org/docs/react-component.html#componentdidupdate) to deal with this in `componentDidUpdate`, but a [2018 react blog entry](https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change) suggests using `getDerivedStateFromProps` instead.