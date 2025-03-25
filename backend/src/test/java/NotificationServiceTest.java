import com.example.demo.Model.Notification;
import com.example.demo.Repository.NotificationRepository;
import com.example.demo.Service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateNotification() {
        // Arrange
        Long userId = 1L;
        String message = "New bug assigned to you";

        Notification notification = new Notification(userId, message);

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        notificationService.createNotification(userId, message);

        // Assert
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testGetUserNotifications() {
        // Arrange
        Long userId = 1L;
        Notification notification1 = new Notification(userId, "Message 1");
        Notification notification2 = new Notification(userId, "Message 2");

        List<Notification> mockNotifications = Arrays.asList(notification1, notification2);
        when(notificationRepository.findByUserId(userId)).thenReturn(mockNotifications);

        // Act
        List<Notification> result = notificationService.getUserNotifications(userId);

        // Assert
        assertEquals(2, result.size());
        assertEquals("Message 1", result.get(0).getMessage());
        assertEquals("Message 2", result.get(1).getMessage());
        verify(notificationRepository, times(1)).findByUserId(userId);
    }

    @Test
    void testGetUnreadNotifications() {
        // Arrange
        Long userId = 1L;
        Notification notification1 = new Notification(userId, "Unread message 1");
        Notification notification2 = new Notification(userId, "Unread message 2");
        notification1.setRead(false);
        notification2.setRead(false);

        List<Notification> mockUnreadNotifications = Arrays.asList(notification1, notification2);
        when(notificationRepository.findByUserIdAndIsReadFalse(userId)).thenReturn(mockUnreadNotifications);

        // Act
        List<Notification> result = notificationService.getUnreadNotifications(userId);

        // Assert
        assertEquals(2, result.size());
        assertFalse(result.get(0).isRead());
        assertFalse(result.get(1).isRead());
        verify(notificationRepository, times(1)).findByUserIdAndIsReadFalse(userId);
    }

    @Test
    void testMarkAllAsRead() {
        // Arrange
        Long userId = 1L;
        Notification notification1 = new Notification(userId, "Unread message 1");
        Notification notification2 = new Notification(userId, "Unread message 2");
        notification1.setRead(false);
        notification2.setRead(false);

        List<Notification> mockUnreadNotifications = Arrays.asList(notification1, notification2);
        when(notificationRepository.findByUserIdAndIsReadFalse(userId)).thenReturn(mockUnreadNotifications);

        // Act
        notificationService.markAllAsRead(userId);

        // Assert
        assertTrue(notification1.isRead());
        assertTrue(notification2.isRead());
        verify(notificationRepository, times(1)).saveAll(mockUnreadNotifications);
    }

    @Test
    void testMarkNotificationAsRead_ValidCase() {
        // Arrange
        Long notificationId = 1L;
        Notification notification = new Notification(1L, "Some message");
        notification.setRead(false);

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        // Act
        String result = notificationService.markAsRead(notificationId);

        // Assert
        assertEquals("Notification marked as read", result);
        assertTrue(notification.isRead());
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    void testMarkNotificationAsRead_NotFound() {
        // Arrange
        Long notificationId = 99L;

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        // Act
        String result = notificationService.markAsRead(notificationId);

        // Assert
        assertEquals("Notification not found", result);
        verify(notificationRepository, never()).save(any(Notification.class));
    }
}
