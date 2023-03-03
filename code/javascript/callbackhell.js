setTimeout(function(){
    console.log("I will come after 5 seconds");
       setTimeout(function(){
          console.log("I will also come after 5 seconds second ");
            setTimeout(function(){
              console.log("I will also come after 5 seconds third");
            },5000)
       },5000)
},5000)