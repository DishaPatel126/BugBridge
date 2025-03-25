package com.example.demo.Controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.Submit;
import com.example.demo.Model.User;
import com.example.demo.Service.SubmitService;
import com.example.demo.Service.UserService;
import com.example.demo.dto.ResponseWrapper;
import com.example.demo.dto.SubmitRequestDto;
import com.example.demo.dto.ApproveDto;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/submissions")
public class SubmitController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SubmitService submitService;

    @PostMapping("/save")
    public ResponseWrapper<Submit> saveSubmission(@RequestBody SubmitRequestDto request) {
        try {
            User user = userService.getUserById(request.getUserId());
            
            // Pass username along with other parameters to saveSubmission
            Submit savedSubmit = submitService.saveSubmission(request.getUserId(), request.getBugId(), user.getUsername(), request.getDesc(), request.getCode());
            
            return new ResponseWrapper<>("success", "Submission saved successfully", savedSubmit);
        } catch (EntityNotFoundException e) {
            return new ResponseWrapper<>("error", "User not found", null);
        } catch (IOException e) {
            return new ResponseWrapper<>("error", "Failed to save submission", null);
        }
    }

    @GetMapping("/user/{userId}/bug/{bugId}")
    public ResponseWrapper<List<Submit>> getUserSubmissionsByBug(@PathVariable Long userId, @PathVariable Long bugId) {
        try {
            List<Submit> submissions = submitService.getSubmissionsForUserAndBug(userId, bugId);
            return new ResponseWrapper<>("success", "Fetched submissions successfully", submissions);
        } catch (Exception e) {
            return new ResponseWrapper<>("error", "Failed to fetch submissions", null);
        }
    }
    @GetMapping("/{submissionId}")
public ResponseWrapper<Submit> getSubmissionById(@PathVariable Long submissionId) {
    try {
        Submit submission = submitService.getSubmissionById(submissionId);
        if (submission != null) {
            return new ResponseWrapper<>("success", "Fetched submission successfully", submission);
        } else {
            return new ResponseWrapper<>("error", "Submission not found", null);
        }
    } catch (Exception e) {
        return new ResponseWrapper<>("error", "Failed to fetch submission", null);
    }
    
}

@GetMapping("/approved/bug/{bugId}")
public ResponseWrapper<List<Submit>> getApprovedSubmissionsForBug(@PathVariable Long bugId) {
    try {
        List<Submit> approvedSubmissions = submitService.findApprovedSubmissionsByBugId(bugId);
        return new ResponseWrapper<>("success", "Fetched approved submissions for bug successfully", approvedSubmissions);
    } catch (Exception e) {
        return new ResponseWrapper<>("error", "Failed to fetch approved submissions", null);
    }
}


    @GetMapping("/file/{userId}/{username}/{bugId}/{subId}/{language}")
public ResponseEntity<String> getFileContent(
        @PathVariable Long userId, 
        @PathVariable String username,
        @PathVariable String language,
        @PathVariable Long subId,
        @PathVariable Long bugId) throws IOException {


    // Determine the file extension based on bug.language
    String extension = switch (language) {
        case "python" -> ".py";
        case "javascript" -> ".js";
        case "java" -> ".java";
        default -> ""; // Handle unknown languages
    };

    // Construct the file path: uploads/userId_username/submissions/userId_bugId.extension
    Path filePath = Paths.get("uploads", userId + "_" + username, "submissions", userId + "_" + bugId + "_" + subId+ extension);
    System.out.println("Attempting to read file: " + filePath);

    if (!Files.exists(filePath)) {
        return ResponseEntity.notFound().build();
    }

    // Read and return file content
    String content = Files.readString(filePath, StandardCharsets.UTF_8);
    return ResponseEntity.ok(content);
}

    @PutMapping("/approve/{submissionId}")
    public ResponseEntity<ResponseWrapper<String>> approveSubmission(@PathVariable Long submissionId, @RequestBody ApproveDto request) {
        String result = submitService.approveSubmission(submissionId, request.getApproverId());
        return ResponseEntity.ok(new ResponseWrapper<>("success", result, null));
    }

    @PutMapping("/reject/{submissionId}")
    public ResponseEntity<ResponseWrapper<String>> rejectSubmission(@PathVariable Long submissionId, @RequestBody ApproveDto request) {
        String result = submitService.rejectSubmission(submissionId, request.getApproverId());
        return ResponseEntity.ok(new ResponseWrapper<>("success", result, null));
    }

    @GetMapping("/unapproved")
    public ResponseEntity<List<Submit>> getUnapprovedSubmissions() {
        List<Submit> submissions = submitService.getUnapprovedSubmissions();
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Submit>> getApprovedSubmissions() {
        List<Submit> submissions = submitService.getApprovedSubmissions();
        return ResponseEntity.ok(submissions);
    }
    @GetMapping("/creator/{creatorId}")
    public ResponseWrapper<List<Submit>> getSubmissionsForCreatedBugs(@PathVariable Long creatorId) {
        try {
            List<Submit> submissions = submitService.getSubmissionsForCreatedBugs(creatorId);
            return new ResponseWrapper<>("success", "Fetched submissions for created bugs successfully", submissions);
        } catch (Exception e) {
            return new ResponseWrapper<>("error", "Failed to fetch submissions", null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseWrapper<List<Submit>> getAllSubmissionsByUser(@PathVariable Long userId) {
        try {
            List<Submit> submissions = submitService.getAllSubmissionsForUser(userId);
            return new ResponseWrapper<>("success", "Fetched all submissions for user successfully", submissions);
        } catch (Exception e) {
            return new ResponseWrapper<>("error", "Failed to fetch submissions for user", null);
        }
    }

}
