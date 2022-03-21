window.onload = function () {
  let wards = fetch('https://opendata.bristol.gov.uk/api/v2/catalog/datasets/wards/records?limit=50&select=name,ward_id')
    .then(response => response.json())
    .then(populateWards)
    .catch(err => console.log(err));
}

function populateWards(wards) {
  let buttons = new DocumentFragment();

  wards.records.forEach(w => {
      const [id, name] = [w.record.fields.ward_id, w.record.fields.name];
      const b = document.createElement("button");
      b.textContent = name;
      b.onclick = displayData(id, name);
      buttons.appendChild(b);
  });
  
  let nav = document.getElementById("nav");
  nav.textContent = '';
  nav.append(buttons);
}

function displayData(id, name) {
  
  function buildPopulation(records) {

    // Make heading
    let heading = document.createElement('h2');
    heading.textContent = 'Population';

    // Make table
    let table = document.createElement('table');
    table.setAttribute('id','populationTable');

    // Make table header
    let header = document.createElement('tr');
    header.innerHTML = '<th>Year</th><th>Population</th></tr>';
    table.appendChild(header);
    
    // Populate table
    records.sort((x1, x2) => x1.record.fields.mid_year < x2.record.fields.mid_year ? -1 : 1)
      .forEach(r => {
        let year = document.createElement('td');
        year.textContent = r.record.fields.mid_year;
        let population = document.createElement('td');
        population.textContent = r.record.fields.population_estimate;

        let row = document.createElement('tr');
        row.append(year, population);
        table.appendChild(row);
    });
    
    let population = new DocumentFragment();
    population.append(heading, table);
    
    return population;
  }

  return function () {
    let wards = fetch(`https://opendata.bristol.gov.uk/api/v2/catalog/datasets/population-estimates-time-series-ward/records?limit=20&select=mid_year,population_estimate&refine=ward_2016_code:${id}`)
      .then(response => response.json())
      .then(data => {
        let heading = document.createElement('h1');
        heading.textContent = name;
        
        let population = buildPopulation(data.records);

        let dataPane = document.getElementById("dataPane");
        dataPane.textContent = '';
        dataPane.append(heading, population);
      })
      .catch(err => console.log(err));
  }
}