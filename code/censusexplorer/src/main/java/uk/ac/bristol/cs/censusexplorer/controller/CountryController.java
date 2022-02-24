package uk.ac.bristol.cs.censusexplorer.controller;

import java.util.List;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.thymeleaf.context.Context;
import uk.ac.bristol.cs.censusexplorer.Templates;

import uk.ac.bristol.cs.censusexplorer.repository.CountryRepository;
import uk.ac.bristol.cs.censusexplorer.model.Country;

@RestController
public class CountryController {

    @Autowired
    public CountryRepository repository;
    
    @Autowired
    public Templates templates;

    @GetMapping("/country/count")
    public String countCountries() {
        long count = repository.count();
        return "There are " + count + " countries in the database.";
    }
    
    @GetMapping("/country/all")
    public String displayCountries() {
        List<Country> countries = repository.findAll();
        Context c = new Context();
        c.setVariable("countries", countries);
        return templates.engine().process("country_list.html", c);
    }
    
    @GetMapping("/country/show/{id}")
    public String showCountry(@PathVariable String id) {
        Country c = repository.getOne(id);
        Context cx = new Context();
        cx.setVariable("country", c);
        return templates.engine().process("country_show.html", cx);
    }
    
}
