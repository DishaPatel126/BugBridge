package com.example.demo.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;  // ID of the user receiving the notification

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;  // Default: unread notification

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // Timestamp of creation

    public Notification(Long userId, String message) {
        this.userId = userId;
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }
}
