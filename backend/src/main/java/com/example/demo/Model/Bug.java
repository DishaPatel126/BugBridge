package com.example.demo.Model;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "bugs")
public class Bug {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String severity;
    private String status;
    private String language;
    private String description;     
    // private String creator;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false) // Link to User table
    private User creator;

    @Column(name = "code_file_path")
    private String codeFilePath;

    @Column(name = "created_at", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    
    // public Bug(Long id) {
    //     this.id = id;
    // }
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getLanguage(){
        return language;
    }
    public void setLanguage(String language){
        this.language = language;
    }

    public String getCodeFilePath() { 
        return codeFilePath; 
    }
    public void setCodeFilePath(String codeFilePath) { 
        this.codeFilePath = codeFilePath; 
    }

    public String getDescription() { 
        return description; 
    }
    public void setDescription(String description) { 
        this.description = description; 
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getSeverity() {
        return severity;
    }
    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    // public String getCreator() {
    //     return creator;
    // }
    // public void setCreator(String creator) {
    //     this.creator = creator;
    // }

    public User getCreator() { 
        return creator; 
    }
    public void setCreator(User creator) { 
        this.creator = creator; 
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
