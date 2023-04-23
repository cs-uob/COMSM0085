import React, { useEffect, useState } from 'react';

import Card from 'react-bootstrap/Card';

function UnitView({ displayName, type, code, callback, details, children}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [item, setItem] = useState({});
  const [errmsg, setErrmsg] = useState(null);
  
  function _fetchData() {
    const url = "http://localhost:8000/api/details/" + type + "/" + code;
    console.log("UnitView fetch " + url);
    fetch(url)
    .then(r => {
      if (!r.ok) {
        const e = "Attempting to load " + r.url + " got status " + r.status + ".";
        setIsLoaded(true);
        setIsError(true);
        setErrmsg(e);
      }
      return r.json()
    })
    .then (
      (result) => {
        if (!isError) {
          setIsLoaded(true);
          setItem(result);
        }
      },
      (error) => {
        setIsLoaded(true);
        setIsError(true);
        setErrmsg("Network error");
      }
    )
  }

  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
    _fetchData();
  }, [_fetchData]);

    
  if (isLoaded === false) {
    return (
      <Card>
        <Card.Body>
          <Card.Text>
            Loading ...
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
  if (isError) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Error</Card.Title>
          <Card.Text>
            An error occurred.
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
  return (
    <Card>
      <Card.Body>
        <Card.Title>Statistics</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">for {displayName} {code}</Card.Subtitle>
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
            item.map(i =>
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
  );
}

export default UnitView;
