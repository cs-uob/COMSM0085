package org.example;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.JoinColumn;

@Entity
public class Candidate {
    @Id private int id;
    private String name;
  
    @ManyToOne 
    @JoinColumn(name = "party")
    private Party party;
  
    @ManyToOne
    @JoinColumn(name = "ward")
    private Ward ward;
  
    private int votes;
    
    public Candidate() {}
    
    public int getId()      { return id; }
    public String getName() { return name; }
    public Party getParty() { return party; }
    public Ward getWard()   { return ward; }
    public int getVotes()   { return votes; }

    public void setId(int id)         { this.id = id; }
    public void setName(String name)  { this.name = name; }
    public void setParty(Party party) { this.party = party; }
    public void setWard(Ward ward)    { this.ward = ward; }
    public void setVotes(int votes)   { this.votes = votes; }
}

