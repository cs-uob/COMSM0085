const data = {
  "pets": [
    {
      "name": "Scooby",
      "breed": "Labrador"
    },
    {
      "name": "Lassie",
      "breed": "Collie"
    },
    {
      "name": "Toto",
      "breed": "Terrier"
    },
    {
      "name": "Rin Tin Tin",
      "breed": "German Shepard"
    }
  ]
};

const tableHeaderHTML = `
<tr>
  <th>Name</th>
  <th>Breed</th>
</tr>
`;

const petRowHTML = `
<tr>
  <td>PET_NAME</td>
  <td>PET_BREED</td>
</tr>
`;

let petsHTML = tableHeaderHTML;

function handleClick() {

  data.pets.forEach(pet => {
    petsHTML += petRowHTML
      .replace('PET_NAME', pet.name)
      .replace('PET_BREED', pet.breed)
  });

  document.getElementById('dogsTable').innerHTML = petsHTML;
}