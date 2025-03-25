
import com.example.demo.Model.User;
import com.example.demo.Model.UserRepository;
import com.example.demo.Service.RegistrationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RegistrationService registrationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- Tests for registerUser ---

    @Test
    void testRegisterUserSuccess() {
        // Arrange
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        User result = registrationService.registerUser(user);

        // Assert
        assertNotNull(result);
        assertEquals("john_doe", result.getUsername());
        assertEquals("john.doe@example.com", result.getEmail());
        assertEquals("encodedPassword123", result.getPassword());
        verify(userRepository, times(1)).findByUsername("john_doe");
        verify(userRepository, times(1)).findByEmail("john.doe@example.com");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testRegisterUserUsernameTaken() {
        // Arrange
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(new User()));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            registrationService.registerUser(user);
        });
        assertEquals("Username already taken", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("john_doe");
        verify(userRepository, never()).findByEmail(anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUserEmailTaken() {
        // Arrange
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("password123");

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(new User()));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            registrationService.registerUser(user);
        });
        assertEquals("Email already taken", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("john_doe");
        verify(userRepository, times(1)).findByEmail("john.doe@example.com");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUserInvalidEmail() {
        // Arrange
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("invalid-email"); // Invalid email format
        user.setPassword("password123");

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("invalid-email")).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            registrationService.registerUser(user);
        });
        assertEquals("Invalid email format", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("john_doe");
        verify(userRepository, times(1)).findByEmail("invalid-email");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUserPasswordTooShort() {
        // Arrange
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("short"); // Less than 6 characters

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            registrationService.registerUser(user);
        });
        assertEquals("Password must be at least 6 characters long", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("john_doe");
        verify(userRepository, times(1)).findByEmail("john.doe@example.com");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    // --- Tests for isValidEmail ---

    @Test
    void testIsValidEmailValid() {
        // Arrange
        String validEmail = "user@example.com";

        // Act
        boolean result = registrationService.isValidEmail(validEmail);

        // Assert
        assertTrue(result);
    }

    @Test
    void testIsValidEmailInvalid() {
        // Arrange
        String invalidEmail = "invalid-email";

        // Act
        boolean result = registrationService.isValidEmail(invalidEmail);

        // Assert
        assertFalse(result);
    }

    @Test
    void testIsValidEmailWithSubdomain() {
        // Arrange
        String validEmail = "user@sub.domain.co.uk";

        // Act
        boolean result = registrationService.isValidEmail(validEmail);

        // Assert
        assertTrue(result);
    }

    @Test
    void testIsValidEmailWithSpecialCharacters() {
        // Arrange
        String validEmail = "user+label@example.com";

        // Act
        boolean result = registrationService.isValidEmail(validEmail);

        // Assert
        assertTrue(result);
    }
}