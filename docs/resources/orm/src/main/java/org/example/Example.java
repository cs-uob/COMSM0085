package org.example;

import java.util.List;

import org.hibernate.SessionFactory;
import org.hibernate.Session;
import org.hibernate.cfg.Configuration;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;

public class Example implements AutoCloseable {

  SessionFactory sessionFactory;
  
  public Example() {
    sessionFactory = new Configuration().configure().buildSessionFactory();
  }
  
  public void close() {
    sessionFactory.close();
  }
  
  public void run() {
    // This try-with-resources block creates a session.
    try (Session session = sessionFactory.openSession()) {
      
      // Load an entity by ID.
      Party p1 = session.get(Party.class, 1);
      System.out.println("    The party with id=1 is: " + p1.getName());
      
      // Load all entities of a class.
      // The string is HQL = Hibernate Query Language, based on SQL.
      TypedQuery<Ward> query = session.createQuery("FROM Ward", Ward.class);
      List<Ward> wards = query.getResultList();
      System.out.println("  Wards:");
      for (Ward ward : wards) {
        System.out.println("    " + ward.getName());
      }
      
      // This example shows how joins are automatically added by
      // Hibernate when necessary. It also shows how to do prepared
      // queries in HQL.
      TypedQuery<Candidate> q = session.createQuery("FROM Candidate c WHERE c.party.name = :name", Candidate.class);
      q.setParameter("name", "Labour");
      List<Candidate> candidates = q.getResultList();
      System.out.println("  Labour Candidates:");
      for (Candidate c : candidates) {
        System.out.println("    " + c.getName() + " (" + c.getWard().getName() + ")");
      }
      
    }
  }
  
  public static void main(String[] args) {
	try (Example example = new Example()) {
		example.run();
	}
    System.out.println("Done.");
    System.exit(0);
  }
  
}

