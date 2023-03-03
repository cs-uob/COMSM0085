.const fs = require('fs');

/* Loads the first argument as a file, removes all punctuation, 
   and computes the frequency of each word. */
let ws = null;
fs.readFile(process.argv[2], 'utf8', function (err, data) {
  if (err) {
    return console.log("error: " + err);
  }
  const punct = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
  ws = data.replace(punct, '').trim().split(/\s+/);
  count(ws);
});



function count(words) {
  
  function insert(w, t) {
    if (t === null)         { t = { word : w, count : 1, left : null, right : null }; }
    else if (w === t.word)  { t.count += 1; }
    else if (w < t.word)    { t.left  = insert(w, t.left); }
    else                    { t.right = insert(w, t.right); }
    return t;
  }

  function flatten(t) { 
    if (t === null) { return []; }
    else { 
      return [...flatten(t.left), {"word" : t.word, "count" : t.count}, ...flatten(t.right)];
    }
  }

  let root = null;
  words.forEach(w => { root = insert(w, root); });
  const results = flatten(root);
  console.log(results);
}