import React from 'react';

import Card from 'react-bootstrap/Card';

class UnitView extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        isLoaded: false,
        isError: false,
        item: {}
      }
    }
  
    _fetchData() {
      const url = "http://localhost:8000/api/details/" + this.props.type + "/" + this.props.code;
      console.log("UnitView fetch " + url);
      fetch(url)
      .then(r => {
        if (!r.ok) {
          const e = "Attempting to load " + r.url + " got status " + r.status + ".";
          this.setState({isLoaded: true, isError: true, errmsg: e})
        }
        return r.json()
      })
      .then (
        (result) => {
          if (!this.state.isError) {
            this.setState({isLoaded: true, item: result})
          }
        },
        (error) => {
          this.setState({isLoaded: true, isError: true, errmsg: "Network error"})
        }
      )
    }

    componentDidMount() {
      this._fetchData();
    }
  
    componentDidUpdate(oldProps) {
      if (this.props.code !== oldProps.code) {
        this.setState({isLoaded: false});
        this._fetchData();
      }
    }
  
    render() {
      if (this.state.isLoaded === false) {
        return (
          <Card>
            <Card.Body>
              <Card.Text>
                Loading ...
              </Card.Text>
            </Card.Body>
          </Card>
        )
      }
      if (this.state.isError) {
        return (
          <Card>
            <Card.Body>
              <Card.Title>Error</Card.Title>
              <Card.Text>
                An error occurred.
              </Card.Text>
            </Card.Body>
          </Card>
        )
      }
      return (
        <Card>
          <Card.Body>
            <Card.Title>Statistics</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">for {this.props.displayName} {this.props.code}</Card.Subtitle>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Occupation class</th>
                  <th style={{textAlign: "right"}}>Women</th>
                  <th style={{textAlign: "right"}}>Men</th>
                  <th style={{textAlign: "right"}}>Total</th>
                </tr>
              </thead>
              <tbody>
              {
                this.state.item.map(i =>
                  <tr key={i.occId}>
                    {
                      i.occId === 0 ? <th>{i.occName}</th> : <td>{i.occName}</td>
                    }
                    <td style={{textAlign: "right"}}>{i.women}</td>
                    <td style={{textAlign: "right"}}>{i.men}</td>
                    <td style={{textAlign: "right"}}>{i.total}</td>
                  </tr>
                )
              }
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )
    }
}

export default UnitView;
