package com.example.demo.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.Bug;
import com.example.demo.Repository.BugRepository;
import com.example.demo.Service.BugSuggestionService;
import com.example.demo.dto.SuggestedSolution;

@RestController
@RequestMapping("/api/suggestions")
public class BugSuggestionController {

    @Autowired
    private BugSuggestionService bugSuggestionService;

    @Autowired
    private BugRepository bugRepository;

    @GetMapping("/bug/{bugId}")
    public ResponseEntity<SuggestionResponse> getBugSuggestions(@PathVariable Long bugId) {
        Optional<Bug> bugOptional = bugRepository.findById(bugId);
        if (bugOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Bug bug = bugOptional.get();
        List<SuggestedSolution> suggestions = bugSuggestionService.getSuggestedSolutions(bug);
        SuggestionResponse response = new SuggestionResponse(suggestions);
        return ResponseEntity.ok(response);
    }
}

class SuggestionResponse {
    private final List<SuggestedSolution> suggestions;

    public SuggestionResponse(List<SuggestedSolution> suggestions) {
        this.suggestions = suggestions;
    }

    public List<SuggestedSolution> getSuggestions() {
        return suggestions;
    }
}