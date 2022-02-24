package uk.ac.bristol.cs.censusexplorer.controller;

import java.util.List;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.thymeleaf.context.Context;
import uk.ac.bristol.cs.censusexplorer.Templates;

import uk.ac.bristol.cs.censusexplorer.repository.CountyRepository;
import uk.ac.bristol.cs.censusexplorer.model.County;

@RestController
public class CountyController {

    @Autowired
    public CountyRepository repository;
    
    @Autowired
    public Templates templates;

    @GetMapping("/county/count")
    public String countCounties() {
        long count = repository.count();
        return "There are " + count + " counties in the database.";
    }
    
    @GetMapping("/county/show/{id}")
    public String showCounty(@PathVariable String id) {
        County c = repository.getOne(id);
        Context cx = new Context();
        cx.setVariable("county", c);
        return templates.engine().process("county_show.html", cx);
    }
    
}
