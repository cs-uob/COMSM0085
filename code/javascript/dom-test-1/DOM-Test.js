const t = document.querySelector('img');
t.remove();
document.body.appendChild(t);
document.body.insertBefore(t, document.body.firstChild);

let x = document.createElement('p');
x.setAttribute('id', 'wrong');
x.textContent = "This largely stopped when things became digital.";
document.body.appendChild(x);

let y  = document.getElementById('wrong');
y.textContent = "Nowadays these are digitally generated.";