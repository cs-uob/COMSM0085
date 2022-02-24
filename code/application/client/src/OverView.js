import React from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

class OverView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: "no", // options: no, yes, error
      item: null
    }
    this.navigate = this.navigate.bind(this);
    this.details = this.details.bind(this);
  }

  details() {
    this.props.details();
  }

  navigate(code, isParent) {
    this.props.callback(code, isParent);
  }

  _fetchData() {
    const url = "http://localhost:8000/api/" + this.props.type + "/" + this.props.code;
    console.log("OverView fetch " + url);
    fetch(url)
      .then(r => {
        if (!r.ok) {
          const e = "Attempting to load " + r.url + " got status " + r.status + ".";
          this.setState({loaded: "error", errmsg: e})
        }
        return r.json()
      })
      .then (
        (result) => {
          if (this.state.loaded !== "error") {
            this.setState({loaded: "yes", item: result})
          }
        },
        (error) => {
          this.setState({loaded: "error", errmsg: "Network error"})
        }
      )
  }

  componentDidMount() {
    this._fetchData()
  }

  componentDidUpdate(oldProps) {
    if (this.props.code !== oldProps.code) {
      this.setState({loaded: "no"});
      this._fetchData()
    }
  }

  hasChildren() {
    return this.state.item[this.props.children] !== undefined;
  }

  children() {
    const ch = this.state.item[this.props.children];
    if (ch === undefined) {
      return ""
    } else {
      return ch.map(i =>
        <li key={i.code}><Button className="pt-0 pb-0" variant="link" 
            onClick={() => this.navigate(i.code, false)}>{i.name}</Button></li>
        )
    }
  }

  parent() {
   const code = this.state.item.parentCode;
   if (code === undefined) {
     return ""
   } else {
     return (
      <Button variant="link" className="p-0"
              onClick={() => this.navigate(code, true)}>
              Back to parent</Button>
     )
   }
  }

  render() {
    switch (this.state.loaded) {
      case "no":
        return (
          <Card>
            <Card.Body>
              <Card.Text>
                Loading ...
              </Card.Text>
            </Card.Body>
          </Card>
        )
      case "error":
        return (
          <Card>
            <Card.Body>
              <Card.Text>
                An error occurred.
              </Card.Text>
              <Card.Text>
                {this.state.errmsg}
              </Card.Text>
            </Card.Body>
          </Card>
        )
      default: // yes
        return (
          <Card>
            <Card.Body>
              <Card.Title>{this.state.item.name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{this.props.displayName}</Card.Subtitle>
              <Card.Text>
                <b>ID: </b>{this.state.item.code} <br />
                {this.hasChildren() ? <b>Contains:</b> : ""} </Card.Text>
              <ul>
              { this.children() }
              </ul>
              { this.parent() }
              <Button variant="link" onClick={this.details}>
              Details</Button>
            </Card.Body>
          </Card>
        )
    }
  }
}

export default OverView;
