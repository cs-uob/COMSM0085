package uk.ac.bristol.cs.application;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.hibernate5.Hibernate5Module;

import java.util.List;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class ApplicationWebConfig implements WebMvcConfigurer {

    /**
    * The purpose of this method is to make Jackson (that converts entities
    * to JSON) aware of Hibernate eager/lazy loading so you get neither a
    * N+1 problem nor a lazy loading exception.
    */
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        for (HttpMessageConverter converter : converters) {
            if (converter instanceof MappingJackson2HttpMessageConverter) {
                ObjectMapper mapper = ((MappingJackson2HttpMessageConverter) converter).getObjectMapper();
                mapper.registerModule(new Hibernate5Module());
            }
        }
    }
    
    @Override
    public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**");
    }
}