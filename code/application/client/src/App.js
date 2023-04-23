import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import OverView from './OverView';
import UnitView from './UnitView';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      overview: "country",
      overviewName: "Country",
      overviewCode: "E92000001",
      overviewChildren: "regions",
      detail: "",
      detailName: "",
      detailCode: ""
    }
    this.navigate = this.navigate.bind(this);
    this.details = this.details.bind(this);
  }

  details() {
    console.log("details for " + this.state.overview + " " + this.state.overviewCode);
    this.setState({
      detail: this.state.overview,
      detailName: this.state.overviewName,
      detailCode: this.state.overviewCode
    })
  }

  navigate(code, isParent) {
    // Called when we want to change the main view.
    switch (this.state.overview) {
      case "country":
        // no parent option here
        this.setState({
          overview: "region",
          overviewName: "Region",
          overviewChildren: "counties",
          overviewCode: code,
          detailCode: ""
        })
        break;
      case "region":
        if (isParent) {
          this.setState({
            overview: "country",
            overviewName: "Country",
            overviewChildren: "regions",
            overviewCode: code,
            detailCode: ""
          })
        } else {
          this.setState({
            overview: "county",
            overviewName: "County",
            overviewChildren: "wards",
            overviewCode: code,
            detailCode: ""
          })
        }
        break;
      case "county":
        if (isParent) {
          this.setState({
            overview: "region",
            overviewName: "Region",
            overviewChildren: "counties",
            overviewCode: code,
            detailCode: ""
          })
        } else {
          this.setState({
            overview: "ward",
            overviewName: "Ward",
            overviewChildren: undefined,
            overviewCode: code,
            detailCode: ""
          })
        }
        break;
      case "ward":
        // wards have no children
        this.setState({
          overview: "county",
          overviewName: "County",
          overviewChildren: "wards",
          overviewCode: code,
          detailCode: ""
        })
        break;
      default:
          console.log("App.navigate")
    }
  }

  render() {
    return (
      <div className="App">
        <Navbar bg="primary" variant="dark">
          <Container>
            <Navbar.Brand href="#home">Census Explorer</Navbar.Brand>
          </Container>
        </Navbar>
        <Container className="mt-2">
          <Row>
            <Col>
              <OverView displayName = {this.state.overviewName}
                        type = {this.state.overview}
                        code = {this.state.overviewCode}
                        children = {this.state.overviewChildren}
                        callback={this.navigate}
                        details={this.details}></OverView>
            </Col>
            <Col>
              {
                this.state.detailCode === "" ? "" :
                <UnitView displayName={this.state.detailName} 
                          type={this.state.detail} 
                          code={this.state.detailCode}></UnitView>
              }
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

export default App;
