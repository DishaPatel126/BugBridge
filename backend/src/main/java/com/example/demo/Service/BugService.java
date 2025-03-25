package com.example.demo.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Repository.BugRepository;
import com.example.demo.Model.Bug;

import java.util.List;
import java.util.Optional;

@Service
public class BugService {
    @Autowired
    private BugRepository bugRepository;

    public List<Bug> getBugs(String severity, String status, Long creator, String sortBy, String order) {
        return bugRepository.findAll(); 
        
    }

    public Bug getBugById(Long id) {
        return bugRepository.findById(id).orElse(null);
    }

    public Bug createBug(Bug bug) {
        return bugRepository.save(bug);
    }
    
    public Bug updateBug(Bug updatedBug) {
        Optional<Bug> existingBugOptional = bugRepository.findById(updatedBug.getId());
        if (existingBugOptional.isPresent()) {
            return bugRepository.save(updatedBug);
        }
        return null; // Return null if the bug doesn't exist
    }

    public boolean deleteBug(Long id) {
        Optional<Bug> existingBugOptional = bugRepository.findById(id);
        if (existingBugOptional.isPresent()) {
            bugRepository.deleteById(id);
            return true; // Successfully deleted
        }
        return false; // Bug not found
    }
}
