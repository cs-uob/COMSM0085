setTimeout(function(){

    console.log("I will come after 5 seconds");
},5000)
function goFirst(callback){
    console.log("Hello World \n");
    callback();
}
function goSecond(){
    console.log("goFirst is calling me when it wants"); 
}
goFirst(goSecond);

