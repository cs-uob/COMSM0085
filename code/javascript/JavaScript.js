/* BASIC DATA */
  
"hello";
1 + 2;
2.5 + 1;
1/3;

typeof "hello";
typeof 1;
typeof true;

0 === 1;
0 == false; 
undefined == null;
undefined === null;
// NEVER EVER USE ==

/* VARIABLES */

let x = 5;
x;
x = x+1;
x;

const y = 5;
// y = y+1;
y;


/* FUNCTIONS */

function f(x) {
  return x+1;
}
f(0);
f(0, 1);
f(0, 1, 2, 3);
f();

// FUNCTIONS ARE DATA

function g1(x) { return x+1; }
g1(0);

let g2 = function (x) { return x+1; }
g2(0);

let g3 = x => { return x+1 };
g3(0);

let g4 = x => x+1;
g4(0);

let test_function = function fact(n) { return n === 0 ? 1 : n * fact(n-1); };
test_function(6);


// CURRYING AND CLOSURES

let add_me = function (x) { return function (y) { return x + y; }; }

let f1 = add_me(1);
f1(2);
f1(3);

add_me = x => (y => x+y);

let f2 = add_me(2);
f2(2);
f2(3);

// Things don't always work the way you expect them

let w = 1;
let add_w = function (y) { return w + y; };
add_w(1);
w = 2;
add_w(1);

/*ARRAYS */

// More like lists, really.

let xs = [1, 2, 3, 4];
xs;
xs.length;

xs[0];
xs[1];
xs[1] = "hi";
xs;
xs[5];

xs[6] = 6;
xs;

// Lists as stacks

xs.push(5);
xs;
let popped = xs.pop();
popped;
xs;

// Running a function over the entire list.

xs = [1, 2, 3, 4];
let ys = xs.map(x => x * 2);
xs;
ys;

// Computing the sum of the array (imperatively, for loop)

let sum = 0;

for (let i = 0; i < xs.length; i++) {
  sum = sum + xs[i];
}
sum;

// Computing the sum of the array (imperatively, for/of loop)

sum = 0;
for (const x of xs) { // try in and find out
  sum = sum + x;
}

// Computing the sum of the array (imperatively, forEach)

sum = 0;
xs.forEach(x => sum  += x);
sum ;

// Computing the sum of the array (imperatively, destructively)

sum = 0;
while (xs.length != 0) {
  sum += xs.pop();
}
sum;

/* =========== OBJECTS =========== */

let lecturer = {
  first : "Alex",
  last : "Kavvos"
}

lecturer.first;
lecturer.last;

lecturer = {
  "first" : "Alex",
  "last" : "Kavvos"
}

lecturer.unit = "COMSM0085";
lecturer;

lecturer.hasOwnProperty("unit");
lecturer.hasOwnProperty("salary");

// iterating over keys
fields = [];
for (const field in lecturer) {
  fields.push(field);
}
fields;

// objects are passed by reference
let lecturer2 = lecturer;
lecturer2.first;
lecturer.first = "Aleks";
lecturer2.first;

/* ============= WARNING ========== */

// a lot of unpredictable nonsense can happen
"hello" + true;
"hello" + false;
0 + false;

false + false;
false + true;
true + true;

"hello" + 1;
"hello" - 1;

[1, 2, 3] + [4, 5, 6];