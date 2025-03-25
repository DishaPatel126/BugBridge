package com.example.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Model.Submit;

@Repository
public interface SubmitRepository extends JpaRepository<Submit, Long> {
    List<Submit> findByApprovalStatus(String status);
    List<Submit> findByBugIdAndApprovalStatus(Long bugId, String status);
    List<Submit> findByUserIdAndBugId(Long userId, Long bugId);
    List<Submit> findByBugId(Long bugId);
    List<Submit> findByUserId(Long userId);

}
