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
      const b = createElementText("button", name);
      b.onclick = displayData(id, name);
      buttons.appendChild(b);
  });
  
  let nav = document.getElementById("nav");
  nav.textContent = '';
  nav.append(buttons);
}

function createElementWith(tag, xs) {
  let elem = document.createElement(tag);
  for (const x of xs) {
    elem.appendChild(x);
  }
  return elem;
}

function createElementText(tag, text) {
  let elem = document.createElement(tag);
  elem.textContent = text;
  return elem;
}

function createElementHTML(tag, html) {
  let elem = document.createElement(tag);
  elem.innerHTML = html;
  return elem;
}

function displayData(id, name) {
  
  function buildWardPopulation(records) {

    // Make heading
    let heading = createElementText('h2', 'Population');

    // Make table
    let table = createElementWith('table',
      [createElementHTML('tr', '<th>Year</th><th>Population</th>')].concat(
          records.filter(d => d.record.fields.mid_year >= 2015)
            .sort((x1, x2) => x1.record.fields.mid_year < x2.record.fields.mid_year ? -1 : 1)
            .map(r =>
              createElementWith('tr', [
                createElementText('td', r.record.fields.mid_year),
                createElementText('td', r.record.fields.population_estimate)
              ])
            )
        )
    );
    table.setAttribute('id','populationTable');
    
    let population = new DocumentFragment();
    population.append(heading, table);
    
    return population;
  }
  
  function buildWardLifeExpectancy(records) {

    // Make heading
    let heading = createElementText('h2', 'Life expectancy (2018-2020)');

    // There should be a unique record
    let [r] = records.filter(d => d.record.fields.year === '2018-2020')
    
    // Make table
    let table = createElementWith('table', [
        createElementWith('tr', [
          createElementText('td', 'Male life expectancy'),
          createElementText('td', Math.round(r.record.fields.male_life_expectancy))
        ]),
        createElementWith('tr', [
          createElementText('td', 'Female life expectancy'),
          createElementText('td', Math.round(r.record.fields.female_life_expectancy))
        ])
    ]);
    table.setAttribute('id', 'lifeExpectancyTable');

    let lifeExpectancy = new DocumentFragment();
    lifeExpectancy.append(heading, table);
    
    return lifeExpectancy;
  }

  return function () {
    Promise.all(
      [
        fetch(`https://opendata.bristol.gov.uk/api/v2/catalog/datasets/population-estimates-time-series-ward/records?limit=20&select=mid_year,population_estimate&refine=ward_2016_code:${id}`),
        fetch(`https://opendata.bristol.gov.uk/api/v2/catalog/datasets/life-expectancy-in-bristol/records?limit=20&refine=ward_code:${id}`)
      ]
    )
    .then(resps => Promise.all(resps.map(d => d.json())))
    .then(([population, lifeExpectancy]) => {
          let dataPane = document.getElementById("dataPane");
          dataPane.textContent = '';
          dataPane.append(
            createElementText('h1', name),
            buildWardPopulation(population.records),
            buildWardLifeExpectancy(lifeExpectancy.records)
          );
    });
  }
}