package com.example.demo.Controller;

import com.example.demo.Model.Notification;
import com.example.demo.Service.NotificationService;
import com.example.demo.dto.ResponseWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // Get unread notifications for a user
    @GetMapping("/unread/{userId}")
    public ResponseEntity<ResponseWrapper<List<Notification>>> getUnreadNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(new ResponseWrapper<>("success", "Unread notifications fetched", notifications));
    }

    // Mark all notifications as read
    @PostMapping("/read/{userId}")
    public ResponseEntity<ResponseWrapper<String>> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new ResponseWrapper<>("success", "All notifications marked as read", null));
    }

    //marking notifications as read
    @PutMapping("/read/{notificationId}")
    public ResponseEntity<ResponseWrapper<String>> markNotificationAsRead(@PathVariable Long notificationId) {
        String result = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(new ResponseWrapper<>("success", result, null));
    }
}

