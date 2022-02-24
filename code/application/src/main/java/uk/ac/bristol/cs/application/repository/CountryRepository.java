package uk.ac.bristol.cs.application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import uk.ac.bristol.cs.application.model.Country;

public interface CountryRepository extends JpaRepository<Country, String> {

    @Query("SELECT c FROM Country c LEFT JOIN FETCH c.regions WHERE c.code = ?1")
    Country getWithChildren(String id);
}