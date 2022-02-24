package uk.ac.bristol.cs.censusexplorer;

import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

@Component("templates")
public class Templates {
    private final TemplateEngine engine;
    
    public Templates() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setPrefix("templates/");
        engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);
    }
    
    public TemplateEngine engine() {
        return this.engine;
    }
}
