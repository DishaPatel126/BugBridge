
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.Model.PasswordResetToken;
import com.example.demo.Model.PasswordResetTokenRepository;
import com.example.demo.Model.User;
import com.example.demo.Model.UserRepository;
import com.example.demo.Service.PasswordResetService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- Tests for createPasswordResetToken ---

    @Test
    void testCreatePasswordResetTokenSuccess() throws MessagingException {
        // Arrange
        String email = "user@example.com";
        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        String result = passwordResetService.createPasswordResetToken(email);

        // Assert
        assertEquals("Password reset email sent", result);
        verify(userRepository, times(1)).findByEmail(email);
        verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testCreatePasswordResetTokenUserNotFound() {
        // Arrange
        String email = "unknown@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        String result = passwordResetService.createPasswordResetToken(email);

        // Assert
        assertEquals("User not found", result);
        verify(userRepository, times(1)).findByEmail(email);
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
        verify(mailSender, never()).createMimeMessage();
    }

    // --- Tests for validateToken ---

    @Test
    void testValidateTokenValid() {
        // Arrange
        String token = "123456";
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30)); // Not expired

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

        // Act
        boolean result = passwordResetService.validateToken(token);

        // Assert
        assertTrue(result);
        verify(tokenRepository, times(1)).findByToken(token);
    }

    @Test
    void testValidateTokenExpired() {
        // Arrange
        String token = "123456";
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setExpiryDate(LocalDateTime.now().minusMinutes(1)); // Expired

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

        // Act
        boolean result = passwordResetService.validateToken(token);

        // Assert
        assertFalse(result);
        verify(tokenRepository, times(1)).findByToken(token);
    }

    @Test
    void testValidateTokenNotFound() {
        // Arrange
        String token = "123456";
        when(tokenRepository.findByToken(token)).thenReturn(Optional.empty());

        // Act
        boolean result = passwordResetService.validateToken(token);

        // Assert
        assertFalse(result);
        verify(tokenRepository, times(1)).findByToken(token);
    }

    // --- Tests for resetPassword ---

    @Test
    void testResetPasswordSuccess() {
        // Arrange
        String token = "123456";
        String newPassword = "newPass123";
        String encodedPassword = "encodedNewPass123";
        User user = new User();
        user.setEmail("user@example.com");

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30)); // Not expired

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        String result = passwordResetService.resetPassword(token, newPassword);

        // Assert
        assertEquals("Password reset successful", result);
        assertEquals(encodedPassword, user.getPassword());
        verify(tokenRepository, times(1)).findByToken(token);
        verify(passwordEncoder, times(1)).encode(newPassword);
        verify(userRepository, times(1)).save(user);
        verify(tokenRepository, times(1)).delete(resetToken);
    }

    @Test
    void testResetPasswordInvalidToken() {
        // Arrange
        String token = "123456";
        String newPassword = "newPass123";
        when(tokenRepository.findByToken(token)).thenReturn(Optional.empty());

        // Act
        String result = passwordResetService.resetPassword(token, newPassword);

        // Assert
        assertEquals("Invalid or expired token", result);
        verify(tokenRepository, times(1)).findByToken(token);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(tokenRepository, never()).delete(any(PasswordResetToken.class));
    }

    @Test
    void testResetPasswordExpiredToken() {
        // Arrange
        String token = "123456";
        String newPassword = "newPass123";
        User user = new User();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().minusMinutes(1)); // Expired

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

        // Act
        String result = passwordResetService.resetPassword(token, newPassword);

        // Assert
        assertEquals("Invalid or expired token", result);
        verify(tokenRepository, times(1)).findByToken(token);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(tokenRepository, never()).delete(any(PasswordResetToken.class));
    }
}