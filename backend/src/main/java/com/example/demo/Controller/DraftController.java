package com.example.demo.Controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import com.example.demo.dto.DraftFileRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Model.Draft;
import com.example.demo.Model.User;
import com.example.demo.Service.DraftService;
import com.example.demo.Service.UserService;

import jakarta.persistence.EntityNotFoundException;
import com.example.demo.dto.DraftRequestDto;
import com.example.demo.dto.ResponseWrapper;

@RestController
@RequestMapping("/drafts")
public class DraftController {
    
    @Autowired
    private UserService userService;
    @Autowired
    private DraftService draftService;

    @PostMapping("/save")
    public ResponseWrapper<Draft> saveDraft(@RequestBody DraftRequestDto request) throws IOException {
    try {
        User user = userService.getUserById(request.getUserId());
        
        // Pass username along with other parameters to saveDraftFile
        Draft savedDraft = draftService.saveDraftFile(request.getUserId(), request.getBugId(), user.getUsername(), request.getCode());
        
        return new ResponseWrapper<>("success", "Draft saved successfully", savedDraft);
    } catch (EntityNotFoundException e) {
        return new ResponseWrapper<>("error", "User not found", null);
    } catch (IOException e) {
        return new ResponseWrapper<>("error", "Failed to save draft", null);
    }
}


    @GetMapping("/user/{userId}")
    public ResponseWrapper<List<Draft>> getUserDrafts(@PathVariable Long userId) {
        try {
            List<Draft> drafts = draftService.getDraftsForUser(userId);
            return new ResponseWrapper<>("success", "Fetched drafts successfully", drafts);
        } catch (Exception e) {
            return new ResponseWrapper<>("error", "Failed to fetch drafts", null);
        }
    }

    @GetMapping("/file/{userId}/{username}/{language}/{filename}")
    public ResponseEntity<String> getFileContent(
            @PathVariable Long userId,
            @PathVariable String username,
            @PathVariable String language,
            @PathVariable String filename) throws IOException {

        // Construct the full path: uploads/userId_username/language/filename
        Path filePath = Paths.get("uploads", userId + "_" + username,"drafts",userId+"_"+language+"."+getExtension(filename));
        System.out.println(filePath);

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        String content = Files.readString(filePath, StandardCharsets.UTF_8);
        return ResponseEntity.ok(content);
    }

    public static String getExtension(String filename) {
        if (filename == null) {
            return null;
        }
        int dotIndex = filename.lastIndexOf('.');
        // Check if a dot exists and isn't the last character
        if (dotIndex == -1 || dotIndex == filename.length() - 1) {
            return "";  // Return empty string if no extension found
        }
        return filename.substring(dotIndex + 1);
    }
}
