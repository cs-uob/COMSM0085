const tableHeaderHTML = `
<tr>
  <th>Name</th>
</tr>
`;

const petRowHTML = `
<tr>
  <td>PET_NAME</td>
</tr>
`;

const baseUrl = 'https://petstasdasdasdore.swaggeasdasdr.io/v2';
const resourcePath = '/pet/findByStatus'
const query = '?status=available'

let petsHTML = tableHeaderHTML;

function handleClick() {
  const path = `${baseUrl}${resourcePath}${query}`;

  fetch(path)
    .then(response => response.json())
    .then(data => {
      if(!Array.isArray(data)){
        throw new Error('The data is invalid!');
      }

      data.forEach(pet => {
        petsHTML += petRowHTML.replace('PET_NAME', pet.name);
      });

      document.getElementById('dogsTable').innerHTML = petsHTML;
    })
    .catch((error) => {
      console.log('ERROR HAS OCCURRED: ', JSON.stringify(error))
    });
}