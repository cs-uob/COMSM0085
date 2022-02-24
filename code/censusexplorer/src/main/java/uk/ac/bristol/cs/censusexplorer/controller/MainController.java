package uk.ac.bristol.cs.censusexplorer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.thymeleaf.context.Context;
import uk.ac.bristol.cs.censusexplorer.Templates;

@RestController
public class MainController {

    @Autowired
    private Templates templates;
    
    @GetMapping("/")
    public String mainPage() {
        Context c = new Context();
        return templates.engine().process("index.html", c);
    }

}
