class Students {
  name;
constructor(name){
      this.name = name;
      
  }
  myname(){
      console.log(this.name);
  }
}
const joe = new Students("Joe Gardiner");
joe.myname();

