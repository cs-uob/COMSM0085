package uk.ac.bristol.cs.application.model;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.Serializable;
import java.util.List;
import java.util.Objects;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

@Entity
public class Region extends ModelClass implements Serializable {
    private @Id String code;
    private String name;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="parent")
    @JsonView(Region.class)
    private Country parent;
    
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "parent")
    @JsonView(Region.class)
    private List<County> counties;
    
    public String getName() { return name; }
    public String getCode() { return code; }
    public Country getParent() { return parent; }
    public String getParentCode() { return parent.getCode(); }
    public List<County> getCounties() { return counties; }
    
    public void setName(String name) { this.name = name; }
    public void setCode(String code) { this.code = code; }
    public void setParent(Country parent) { this.parent = parent; }
    public void setCounties(List<County> counties) { this.counties = counties; }
    
    @Override
    public int hashCode() {
        int hash = 7;
        hash = 53 * hash + Objects.hashCode(this.code);
        hash = 53 * hash + Objects.hashCode(this.name);
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
        final Region other = (Region) obj;
        return Objects.equals(this.code, other.code);
    }   
}
