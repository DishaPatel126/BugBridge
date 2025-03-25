package com.example.demo.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Model.Bug;
import com.example.demo.Model.Submit;
import com.example.demo.Model.User;
import com.example.demo.Model.UserRepository;
import com.example.demo.Repository.BugRepository;
import com.example.demo.Repository.SubmitRepository;

@Service
public class SubmitService {

    private final String storagePath = "uploads/";
    
    @Autowired
    private SubmitRepository submitRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BugRepository bugRepository;

    @Autowired
    private NotificationService notificationService;


    public Submit saveSubmission(Long userId, Long bugId, String username, String desc, String code) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Bug bug = bugRepository.findById(bugId)
            .orElseThrow(() -> new RuntimeException("Bug not found"));
        System.out.println(user);

        Submit submit = new Submit();
        submit.setUser(user);
        submit.setBug(bug);
        submit.setDescription(desc);
        if (bug.getCreator().getId().equals(userId)) {
            submit.setStatus("approved");
        } 
        Submit savedSubmit = submitRepository.save(submit);
        
        String extension = mapLanguageToExtension(bug.getLanguage());
        String filename = userId + "_" + bugId + "_" + savedSubmit.getId() + extension; // e.g., "302_4_10.java"
        Path directoryPath = Paths.get(storagePath, userId + "_" + username, "submissions");
        Path filePath = directoryPath.resolve(filename);
    
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, code.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        savedSubmit.setCodeFilePath(filePath.toString());
        notificationService.createNotification( userId, "Your submission for bug #" + bug.getId() + " has been submitted.");

            // Notify the bug creator
            Long bugCreatorId = bug.getCreator().getId();
            notificationService.createNotification(bugCreatorId, 
                "A new submission has been made for your bug #" + bug.getId() + " by " + user.getUsername() + ".");
        
        // Submit existingSubmission = submitRepository.findByUserIdAndBugId(userId, bugId);
        
        // if (existingSubmission != null) {
        //     if (!bug.getCreator().getId().equals(userId)) {
        //         existingSubmission.setApprovalStatus("unapproved");
        //     } 
        //     existingSubmission.setCodeFilePath(filePath.toString());
        //     return submitRepository.save(existingSubmission);
        // } else {
            return submitRepository.save(savedSubmit);
        // }
        

    }

    public String mapLanguageToExtension(String language) {
        if (language == null) return ".txt";
        switch (language.toLowerCase()) {
            case "java": return ".java";
            case "python": return ".py";
            case "javascript": return ".js";
            default: return ".txt";
        }
    }

    public List<Submit> findApprovedSubmissionsByBugId(Long bugId) {
        List<Submit> approvedSubmissions = submitRepository.findByBugIdAndApprovalStatus(bugId, "approved");
        if (!approvedSubmissions.isEmpty()) {
            Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new RuntimeException("Bug not found"));
            bug.setStatus("Resolved");
            bugRepository.save(bug);
        }
        
        // Group by userId and get the most recent submission for each user
        Map<Long, Submit> latestPerUser = new HashMap<>();
        for (Submit submit : approvedSubmissions) {
            Long userId = submit.getUser().getId();
            Submit existing = latestPerUser.get(userId);
            if (existing == null || submit.getSubmittedAt().isAfter(existing.getSubmittedAt())) {
                latestPerUser.put(userId, submit);
            }
        }
        
        return new ArrayList<>(latestPerUser.values());
    }
      
    public List<Submit> getSubmissionsForUserAndBug(Long userId, Long bugId) {
        return submitRepository.findByUserIdAndBugId(userId, bugId);
    }
    public Submit getSubmissionById(Long submissionId) {
        return submitRepository.findById(submissionId)
                .orElse(null); // Return null if not found
    }
    

    public String approveSubmission(Long submissionId, Long approverId) {
        if (submissionId == null || approverId == null) {
            throw new NullPointerException("Submission ID and Approver ID cannot be null");
        }

        Optional<Submit> submissionOptional = submitRepository.findById(submissionId);
        
        if (submissionOptional.isEmpty()) {
            return "Submission not found.";
        }

        Submit submission = submissionOptional.get();
        Bug bug = submission.getBug();

        if (!bug.getCreator().getId().equals(approverId)) {
            return "Only the bug creator can approve submissions.";
        }        

        submission.setApprovalStatus("approved");
        submitRepository.save(submission);

        notificationService.createNotification(submission.getUser().getId(), 
            "Your submission for bug #" + bug.getId() + " has been approved.");

        return "Submission approved successfully.";
    }

    public String rejectSubmission(Long submissionId, Long rejecterId) {
        if (submissionId == null || rejecterId == null) {
            throw new NullPointerException("Submission ID and Rejecter ID cannot be null");
        }

        Optional<Submit> submissionOptional = submitRepository.findById(submissionId);

        if (submissionOptional.isEmpty()) {
            return "Submission not found.";
        }

        Submit submission = submissionOptional.get();
        Bug bug = submission.getBug();

        if (!bug.getCreator().getId().equals(rejecterId)) {
            return "Only the bug creator can reject submissions.";
        }

        submission.setApprovalStatus("rejected");
        submitRepository.save(submission);

        notificationService.createNotification(submission.getUser().getId(),
                "Your submission for bug #" + bug.getId() + " has been rejected.");

        return "Submission rejected successfully.";
    }


    public List<Submit> getUnapprovedSubmissions() {
        return submitRepository.findByApprovalStatus("unapproved");
    }

    public List<Submit> getApprovedSubmissions() {
        return submitRepository.findByApprovalStatus("approved");
    }

    public List<Submit> getSubmissionsForCreatedBugs(Long creatorId) {
        List<Bug> createdBugs = bugRepository.findByCreatorId(creatorId);
        List<Submit> allSubmissions = new ArrayList<>();
        for (Bug bug : createdBugs) {
            allSubmissions.addAll(submitRepository.findByBugId(bug.getId()));
        }
        return allSubmissions;
    }
    
    
    public List<Submit> getAllSubmissionsForUser(Long userId) {
    // Step 1: Get all submissions by the user
        List<Submit> userSubmissions = submitRepository.findByUserId(userId);

        // Step 2: Get all bugs created by the user
        List<Bug> createdBugs = bugRepository.findByCreatorId(userId);
        Set<Long> createdBugIds = createdBugs.stream()
                .map(Bug::getId)
                .collect(Collectors.toSet());

        // Step 3: Filter out submissions for bugs the user created
        List<Submit> filteredSubmissions = userSubmissions.stream()
                .filter(submit -> !createdBugIds.contains(submit.getBug().getId()))
                .collect(Collectors.toList());

        return filteredSubmissions;
    }

}

