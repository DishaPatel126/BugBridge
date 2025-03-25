package com.example.demo.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Submit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // User submitting the solution

    @ManyToOne
    @JoinColumn(name = "bug_id", nullable = false)
    private Bug bug;  // Bug being solved

    @Column(nullable = false)
    private String description;

    private String codeFilePath; // Optional file attachment

    @Column(nullable = false)
    private String approvalStatus = "unapproved"; // Default to unapproved

    private LocalDateTime submittedAt = LocalDateTime.now(); // Auto set timestamp
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Bug getBug() {
        return bug;
    }

    public void setBug(Bug bug) {
        this.bug = bug;
    }
    public void setStatus(String status) {
        this.approvalStatus = status;
    }

    public String getCodeFilePath() {
        return codeFilePath;
    }
    public void setCodeFilePath(String codeFilePath) {
        this.codeFilePath = codeFilePath;
    }
}
