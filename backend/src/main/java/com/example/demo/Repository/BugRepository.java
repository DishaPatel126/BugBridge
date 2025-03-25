package com.example.demo.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Model.Bug;
public interface BugRepository extends JpaRepository<Bug, Long> {
    List<Bug> findByCreatorId(Long creatorId);
}
