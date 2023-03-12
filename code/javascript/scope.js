function first(){
    second();
     function second(){
        console.log(a);
     }
}
var a = 10;
first();