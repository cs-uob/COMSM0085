import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import OverView from './OverView';
import UnitView from './UnitView';

function App() {
  const [overview, setOverview] = useState("country");
  const [overviewName, setOverviewName] = useState("Country");
  const [overviewCode, setOverviewCode] = useState("E92000001");
  const [overviewChildren, setOverviewChildren] = useState("regions");
  const [detail, setDetail] = useState("");
  const [detailName, setDetailName] = useState("");
  const [detailCode, setDetailCode] = useState("");

  function details() {
    console.log("details for " + overview + " " + overviewCode);
    setDetail(overview);
    setDetailName(overviewName);
    setDetailCode(overviewCode);
  }

  function navigate(code, isParent) {
    // Called when we want to change the main view.
    switch (overview) {
      case "country":
        setOverview("region");
        setOverviewName("Region");
        setOverviewChildren("counties");
        setOverviewCode(code);
        setDetailCode("");
        
        break;
      case "region":
        if (isParent) {
          setOverview("country");
          setOverviewName("Country");
          setOverviewChildren("regions");
          setOverviewCode(code);
          setDetailCode("");
        } else {
          setOverview("county");
          setOverviewName("County");
          setOverviewChildren("wards");
          setOverviewCode(code);
          setDetailCode("");
        }
        break;
      case "county":
        if (isParent) {
          setOverview("region");
          setOverviewName("Region");
          setOverviewChildren("counties");
          setOverviewCode(code);
          setDetailCode("");
        } else {
          setOverview("ward");
          setOverviewName("Ward");
          setOverviewChildren(undefined);
          setOverviewCode(code);
          setDetailCode("");
        }
        break;
      case "ward":
        setOverview("county");
        setOverviewName("County");
        setOverviewChildren("wards");
        setOverviewCode(code);
        setDetailCode("");
        break;
      default:
          console.log("App.navigate")
    }
  }

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
            <OverView displayName = {overviewName}
                      type = {overview}
                      code = {overviewCode}
                      children = {overviewChildren}
                      callback={navigate}
                      details={details}></OverView>
          </Col>
          <Col>
            {
              detailCode === "" ? "" :
              <UnitView displayName={detailName} 
                        type={detail} 
                        code={detailCode}></UnitView>
            }
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
