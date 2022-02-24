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
public class County extends ModelClass implements Serializable {
    private @Id String code;
    private String name;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="parent")
    @JsonView(County.class)
    private Region parent;
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "parent")
    @JsonView(County.class)
    private List<Ward> wards;
    
    public String getName() { return name; }
    public String getCode() { return code; }
    public Region getParent() { return parent; }
    public String getParentCode() { return parent.getCode(); }
    public List<Ward> getWards() { return wards; }

    public void setName(String name) { this.name = name; }
    public void setCode(String code) { this.code = code; }
    public void setParent(Region parent) { this.parent = parent; }
    public void setWards(List<Ward> wards) { this.wards = wards; }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 61 * hash + Objects.hashCode(this.code);
        hash = 61 * hash + Objects.hashCode(this.name);
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
        final County other = (County) obj;
        return Objects.equals(this.name, other.name);
    }
}
