package org.example;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Ward {
    @Id private int id;
    private String name;
    private int electorate;
    
    public Ward() {}
    
    public int getId()      { return id; }
    public String getName() { return name; }
    public int getElectorate() { return electorate; }

    public void setId(int id)         { this.id = id; }
    public void setName(String name)  { this.name = name; }
    public void setElectorate(int electorate) { this.electorate = electorate; }
}

