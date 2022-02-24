package uk.ac.bristol.cs.censusexplorer.controller;

import java.util.List;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.thymeleaf.context.Context;
import uk.ac.bristol.cs.censusexplorer.Templates;

import uk.ac.bristol.cs.censusexplorer.repository.RegionRepository;
import uk.ac.bristol.cs.censusexplorer.model.Region;

@RestController
public class RegionController {

    @Autowired
    public RegionRepository repository;
    
    @Autowired
    public Templates templates;

    @GetMapping("/region/count")
    public String countRegions() {
        long count = repository.count();
        return "There are " + count + " regions in the database.";
    }
    
    @GetMapping("/region/all")
    public String displayCountries() {
        List<Region> regions = repository.findAll();
        Context c = new Context();
        c.setVariable("regions", regions);
        return templates.engine().process("region_list.html", c);
    }
    
    @GetMapping("/region/show/{id}")
    public String showRegion(@PathVariable String id) {
        Region c = repository.getOne(id);
        Context cx = new Context();
        cx.setVariable("region", c);
        return templates.engine().process("region_show.html", cx);
    }
    
}
