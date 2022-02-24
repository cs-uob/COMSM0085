package uk.ac.bristol.cs.censusexplorer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uk.ac.bristol.cs.censusexplorer.model.County;

@Repository
public interface CountyRepository extends JpaRepository<County, String>{

}
