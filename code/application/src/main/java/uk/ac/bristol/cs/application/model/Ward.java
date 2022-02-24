package uk.ac.bristol.cs.application.model;

import com.fasterxml.jackson.annotation.JsonView;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.JoinColumn;
import javax.persistence.FetchType;

import java.io.Serializable;
import java.util.Objects;

@Entity
public class Ward extends ModelClass implements Serializable {
    @Id private String code;
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="parent")
    @JsonView(Ward.class)
    private County parent;

    public String getName() { return name; }
    public String getCode() { return code; }
    public County getParent() { return parent; }
    public String getParentCode() { 
        if (parent == null) {
            return null;
        } else {
            return parent.getCode(); 
        }
    }
    
    public void setName(String name) { this.name = name; }
    public void setCode(String code) { this.code = code; }
    public void setParent(County parent) { this.parent = parent; }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 37 * hash + Objects.hashCode(this.code);
        hash = 37 * hash + Objects.hashCode(this.name);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Ward other = (Ward) obj;
        return Objects.equals(this.code, other.code);
    }
}
