package uk.ac.bristol.cs.application;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NoSuchElementException extends RuntimeException {

    private final Class<?> cls;
    private final String id;
    
    public NoSuchElementException(Class<?> cls, String id) {
        super("Could not find an instance of " + cls.getName() + " for id " + id);
        this.cls = cls;
        this.id = id;
    }

    public Class<?> getCls() { return cls; }
    public String getId() { return id; }
}