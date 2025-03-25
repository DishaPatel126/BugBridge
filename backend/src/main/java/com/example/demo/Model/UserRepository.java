package com.example.demo.Model;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT DISTINCT b.creator FROM Bug b") // Fetch only users who have created bugs
    List<User> findUsersWithBugs();
    

}
