/*
  *
  * █▀█ █▄▄ ░░█ █▀▀ █▀▀ ▀█▀ █▀
  * █▄█ █▄█ █▄█ ██▄ █▄▄ ░█░ ▄█
  *
*/

// A JS object is a collection of key-value pairs.

let lecturer = {
  first : "Alex",
  last : "Kavvos"
}

lecturer.first;
lecturer.last;
lecturer['first'];

lecturer.unit = "COMSM0085";
lecturer;

lecturer.hasOwnProperty("unit");
lecturer.hasOwnProperty("salary");

lecturer.tutees = ["Alice", "Bob"];
lecturer;

lecturer.address = {
  building: "Merchant Venturers Building", 
  postcode: "BS8 1UB"
};
lecturer;

lecturer.address.building;

// objects are passed by reference
const lecturer2 = lecturer;
lecturer2.first;
lecturer.first = "Aleks";
lecturer2.first;

/* 
  * Up to this point we have been working with a fragment of JS objects known as
  * JSON (JavaScript Object Notation). These are simple objects which can be
  * _serialized_, i.e. written down as human-readable text that can be sent over
  * the web using HTTP, and so on.
  *
  * JSON comprises objects whose values are JSON values, i.e.
  * - numbers
  * - booleans
  * - strings
  * - null 
  * - arrays of JSON values
  * - and other JSON objects.
  * 
  * It does NOT allow functions, the undefined value, regular expressions, etc.
*/

// An object in the JSON fragment can be _stringified_, i.e. turned into a
// string (for sending over the network, saving in a text file, etc.)
const s = JSON.stringify(lecturer);
typeof s;
s;

// It can then be _parsed_ to be turned back into an object.
const lecturer3 = JSON.parse(s);
typeof lecturer3;
lecturer3;

/*
  * As functions are data values, they can be stored in objects.
  * When that happens, we call these functions _methods_.
  * 
  * You should never use arrow notation for defining methods.
*/

let counter = {
  "value" : 0,
  "inc" : function () { this.value += 1; }
}

counter.value;
counter.inc();
counter.value;
counter.inc();
counter.value;

counter.value = 5;
counter;

/*
  However, there is no mechanism for hiding state, i.e. making variables private.
  So we are free to do something like this:

    counter.inc = function () { console.log("counter object hacked!"); }

  Fortunately, there is a solution using functions and local variables.
*/

const makeCounter = function () {
  let value = 0;

  return {
    "getValue" : function () { return value; },
    "inc" : function () { value += 1; }
  }
}

counter = makeCounter();
counter.getValue();
counter.inc();
counter.getValue();
counter.inc();
counter.getValue();

counter2 = makeCounter();
counter2.getValue();
counter.getValue();