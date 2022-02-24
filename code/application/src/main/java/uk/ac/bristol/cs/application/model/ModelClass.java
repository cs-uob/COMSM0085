package uk.ac.bristol.cs.application.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import uk.ac.bristol.cs.application.NoSuchElementException;

/**
 * This class is an abstract base class of our model classes so that
 * we can get extents on views correct.
 */
public abstract class ModelClass {
    public static <T> String renderJSON(T element, Class<T> cls, String id) {
        if (element == null) {
            throw new NoSuchElementException(cls, id);
        }
        try {
            return new ObjectMapper()
                .writerWithView(cls)
                .writeValueAsString(element);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
