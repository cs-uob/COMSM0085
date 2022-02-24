package uk.ac.bristol.cs.application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.thymeleaf.context.Context;

import uk.ac.bristol.cs.application.NoSuchElementException;
import uk.ac.bristol.cs.application.Templates;

@ControllerAdvice
public class ErrorHandler {

    @Autowired
    Templates templates;
    
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handle404(NoSuchElementException e) {
        Context c = new Context();
        c.setVariable("cls", e.getCls());
        c.setVariable("id", e.getId());
        return ResponseEntity
            .status(404)
            .header(HttpHeaders.CONTENT_TYPE, "text/html")
            .body(templates.render("404.html", c));
    }
}
