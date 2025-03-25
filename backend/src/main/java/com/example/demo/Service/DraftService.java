package com.example.demo.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Model.Bug;
import com.example.demo.Model.Draft;
import com.example.demo.Model.User;
import com.example.demo.Model.UserRepository;
import com.example.demo.Repository.BugRepository;
import com.example.demo.Repository.DraftRepository;

@Service
public class DraftService {

    private final String storagePath = "uploads/";
    @Autowired
    private DraftRepository draftRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BugRepository bugRepository;


    public Draft saveDraftFile(Long userId, Long bugId, String username, String code) throws IOException {
        // Retrieve user and bug
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Bug bug = bugRepository.findById(bugId)
            .orElseThrow(() -> new RuntimeException("Bug not found"));
    
        Path directoryPath = Paths.get(storagePath, userId + "_" + username, "drafts");
        String extension = mapLanguageToExtension(bug.getLanguage());
        String filename = userId + "_" + bugId + extension;
        Path filePath = directoryPath.resolve(filename);
    
        // Ensure directory exists
        Files.createDirectories(filePath.getParent());
    
        // Write code to file
        Files.write(filePath, code.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    
        // Check if a draft already exists for the user and bug
        Draft existingDraft = draftRepository.findByUserIdAndBugId(userId, bugId);
        
        if (existingDraft != null) {
            // Update existing draft
            existingDraft.setCodeFilePath(filePath.toString());
            return draftRepository.save(existingDraft);
        } else {
            // Create new draft
            Draft draft = new Draft();
            draft.setUser(user);
            draft.setBug(bug);
            draft.setCodeFilePath(filePath.toString());
            return draftRepository.save(draft);
        }
    }
    
    
    // Utility method for mapping languages to file extensions
    public String mapLanguageToExtension(String language) {
        if (language == null) return ".txt"; // Default extension
    
        switch (language.toLowerCase()) {
            case "java": return ".java";
            case "python": return ".py";
            case "javascript": return ".js";
            default: return ".txt"; // Default if unknown
        }
    }
    

    public List<Draft> getDraftsForUser(Long userId) {
        return draftRepository.findByUserId(userId); // Assuming this method exists in your DraftRepository
    }


}
