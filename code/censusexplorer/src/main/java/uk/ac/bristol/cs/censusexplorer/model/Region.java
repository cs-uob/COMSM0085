package uk.ac.bristol.cs.censusexplorer.model;

import java.util.List;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

@Entity
@Table(name="Region")
public class Region {
    @Id private String code;
    private String name;
    @ManyToOne @JoinColumn(name = "parent") private Country parent;
    @OneToMany(mappedBy = "parent") private List<County> counties;
    
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Country getParent() {
        return parent;
    }

    public void setParent(Country parent) {
        this.parent = parent;
    }

    public List<County> getCounties() {
        return counties;
    }

    public void setCounties(List<County> counties) {
        this.counties = counties;
    }
}
