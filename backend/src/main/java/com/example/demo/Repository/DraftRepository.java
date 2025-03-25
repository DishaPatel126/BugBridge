package com.example.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Model.Draft;

@Repository
public interface DraftRepository extends JpaRepository<Draft, Long> {
    List<Draft> findByUserId(Long userId);
    Draft findByUserIdAndBugId(Long userId, Long bugId); // Add this method
}
