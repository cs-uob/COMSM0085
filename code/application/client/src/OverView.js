import React, { useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function OverView({ displayName, type, code, callback, details, children}) {
  const [loaded, setLoaded] = useState("no"); // options: no, yes, error
  const [errmsg, setErrmsg] = useState(null);
  const [item, setItem] = useState(null);

  function navigate(code, isParent) {
    callback(code, isParent);
  }

  function _fetchData() {
    const url = "http://localhost:8000/api/" + type + "/" + code;
    console.log("OverView fetch " + url);
    fetch(url)
      .then(r => {
        if (!r.ok) {
          const e = "Attempting to load " + r.url + " got status " + r.status + ".";
          setLoaded("error");
          setErrmsg(e);
        }
        return r.json()
      })
      .then (
        (result) => {
          if (loaded !== "error") {
            setLoaded("yes");
            setItem(result);
          }
        }).catch((error) => {
          setLoaded("error");
          setErrmsg("Network error");
        }
      )
  }

  useEffect(() => {
    setLoaded("no");
    _fetchData();
  }, [code]);

  function hasChildren() {
    return children !== undefined;
  }

  function createChildren() {
    const ch = item[children];
    if (ch === undefined) {
      return ""
    } else {
      return ch.map(i =>
        <li key={i.code}><Button className="pt-0 pb-0" variant="link" 
            onClick={() => this.navigate(i.code, false)}>{i.name}</Button></li>
        )
    }
  }

  function parent() {
   const code = item.parentCode;
   if (code === undefined) {
     return ""
   } else {
     return (
      <Button variant="link" className="p-0"
              onClick={() => navigate(code, true)}>
              Back to parent</Button>
     )
   }
  }

  switch (loaded) {
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
              {errmsg}
            </Card.Text>
          </Card.Body>
        </Card>
      )
    default: // yes
      return (
        <Card>
          <Card.Body>
            <Card.Title>{item.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{displayName}</Card.Subtitle>
            <Card.Text>
              <b>ID: </b>{item.code} <br />
              {hasChildren() ? <b>Contains:</b> : ""} </Card.Text>
            <ul>
            { createChildren() }
            </ul>
            { parent() }
            <Button variant="link" onClick={details}>
            Details</Button>
          </Card.Body>
        </Card>
      )
  }
}

export default OverView;
