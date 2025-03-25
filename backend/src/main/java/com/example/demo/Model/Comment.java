package com.example.demo.Model;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {



        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // The bug this comment belongs to
        private Long bugId;

        // Reference to the user who made the comment
        @ManyToOne
        @JoinColumn(name = "user_id")
        private User user;

        // The comment text
        @Column(columnDefinition = "TEXT")
        private String text;

        // When the comment was created
        private LocalDateTime timestamp;

        // Constructors
        public Comment() {}

        // Getters and Setters
        public Long getId() {
            return id;
        }
        public void setId(Long id) {
            this.id = id;
        }
        public Long getBugId() {
            return bugId;
        }
        public void setBugId(Long bugId) {
            this.bugId = bugId;
        }
        public User getUser() {
            return user;
        }
        public void setUser(User user) {
            this.user = user;
        }
        public String getText() {
            return text;
        }
        public void setText(String text) {
            this.text = text;
        }
        public LocalDateTime getTimestamp() {
            return timestamp;
        }
        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }


