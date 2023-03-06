function Students(name){
    this.name = name;
}

var joe = new Students("Joe Gardiner");
console.log(joe.name);
Students.prototype.city="Bristol";
console.log(joe.city);
var marvin = new Students("Marvin Kopo");
console.log(marvin.name);
console.log(marvin.city);
