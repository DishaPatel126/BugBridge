package com.example.demo.dto;

import com.example.demo.Model.Bug;
import java.time.LocalDateTime;

public record BugDto(Long id, String title, String severity, String status, String language, String description, Long userId, String codeFilePath, LocalDateTime createdAt) {
    public static BugDto from(Bug bug) {
        return new BugDto(
            bug.getId(),
            bug.getTitle(),
            bug.getSeverity(),
            bug.getStatus(),
            bug.getLanguage(),
            bug.getDescription(),
            bug.getCreator().getId(), // Get only userId
            bug.getCodeFilePath(),
            bug.getCreatedAt()
        );
    }
}
