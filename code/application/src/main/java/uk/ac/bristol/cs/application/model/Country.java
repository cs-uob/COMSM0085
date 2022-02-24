package uk.ac.bristol.cs.application.model;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.Serializable;
import java.util.List;
import java.util.Objects;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

@Entity
public class Country extends ModelClass implements Serializable {
    private @Id String code;
    private String name;
    
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "parent")
    @JsonView(Country.class)
    private List<Region> regions;
    
    public String getName() { return name; }
    public String getCode() { return code; }
    public List<Region> getRegions() { return regions; }

    public void setName(String name) { this.name = name; }
    public void setCode(String code) { this.code = code; }
    public void setRegions(List<Region> regions) { this.regions = regions; }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 83 * hash + Objects.hashCode(this.code);
        hash = 83 * hash + Objects.hashCode(this.name);
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
        final Country other = (Country) obj;
        return Objects.equals(this.name, other.name);
    }
}
