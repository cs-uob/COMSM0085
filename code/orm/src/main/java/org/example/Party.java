package org.example;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Party {
    @Id private int id;
    private String name;
    
    public Party() {}
    
    public int getId()      { return id; }
    public String getName() { return name; }

    public void setId(int id)         { this.id = id; }
    public void setName(String name)  { this.name = name; }
}

