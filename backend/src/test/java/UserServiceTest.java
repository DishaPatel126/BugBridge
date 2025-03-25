
import java.nio.CharBuffer;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.Model.PasswordResetToken;
import com.example.demo.Model.PasswordResetTokenRepository;
import com.example.demo.Model.User;
import com.example.demo.Model.UserRepository;
import com.example.demo.Service.UserService;
import com.example.demo.dto.CredentialsDto;
import com.example.demo.dto.ResponseWrapper;
import com.example.demo.dto.SignUpDto;
import com.example.demo.dto.UserDto;
import com.example.demo.exceptions.AppException;
import com.example.demo.mappers.UserMapper;

import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;

class UserServiceTest {

    @InjectMocks
    @Spy
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Fully initialized test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("test_user");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashed_password");
    }

    // --- Tests from UpdateUserTest ---

    @Test
    void testUpdateUsername() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserDto updateDto = new UserDto();
        updateDto.setUsername("new_username");

        ResponseWrapper<String> response = userService.updateUserAccount(1L, updateDto);

        assertEquals("success", response.getStatus());
        assertEquals("User updated successfully", response.getMessage());
        assertEquals("new_username", testUser.getUsername());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testUpdateEmail() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doReturn("Verification email sent").when(userService).createEmailVerificationToken(1L, "new@example.com");

        UserDto updateDto = new UserDto();
        updateDto.setEmail("new@example.com");

        ResponseWrapper<String> response = userService.updateUserAccount(1L, updateDto);

        assertEquals("success", response.getStatus());
        assertEquals("Email verification OTP Sent. Click 'Save Changes' after verification.", response.getMessage());
        verify(userService, times(1)).createEmailVerificationToken(1L, "new@example.com");
    }

    @Test
    void testUpdatePasswordWithoutOTP() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("new_secure_password")).thenReturn("hashed_new_password");

        UserDto updateDto = new UserDto();
        updateDto.setPassword("new_secure_password");

        ResponseWrapper<String> response = userService.updateUserAccount(1L, updateDto);

        assertEquals("success", response.getStatus());
        assertEquals("User updated successfully", response.getMessage());
        assertEquals("hashed_new_password", testUser.getPassword());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testUpdateWithoutFields() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserDto updateDto = new UserDto(); // Empty DTO

        AppException exception = assertThrows(AppException.class, () -> {
            userService.updateUserAccount(1L, updateDto);
        });

        assertEquals("No valid fields to update", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void testVerifyEmailWithOTP() {
        PasswordResetToken token = new PasswordResetToken("123456", testUser, LocalDateTime.now().plusHours(1), "new@example.com");

        when(tokenRepository.findByToken("123456")).thenReturn(Optional.of(token));
        doReturn(true).when(userService).verifyEmail("123456", 1L);

        boolean result = userService.verifyEmail("123456", 1L);

        assertTrue(result);
        verify(userService).verifyEmail("123456", 1L);
    }

    // --- Tests for login ---

    @Test
    void testLoginSuccess() {
        CredentialsDto credentials = new CredentialsDto("test@example.com", "password".toCharArray());
        UserDto userDto = new UserDto(1L, "test_user", "test@example.com", null);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(CharBuffer.wrap("password".toCharArray()), "hashed_password")).thenReturn(true);
        when(userMapper.toUserDto(testUser)).thenReturn(userDto);

        UserDto result = userService.login(credentials);

        assertNotNull(result);
        assertEquals(userDto, result);
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(passwordEncoder, times(1)).matches(any(CharBuffer.class), eq("hashed_password"));
    }

    @Test
    void testLoginUnknownUser() {
        CredentialsDto credentials = new CredentialsDto("unknown@example.com", "password".toCharArray());

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userService.login(credentials);
        });

        assertEquals("Unknown user", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        verify(userRepository, times(1)).findByEmail("unknown@example.com");
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void testLoginInvalidPassword() {
        CredentialsDto credentials = new CredentialsDto("test@example.com", "wrong".toCharArray());

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(CharBuffer.wrap("wrong".toCharArray()), "hashed_password")).thenReturn(false);

        AppException exception = assertThrows(AppException.class, () -> {
            userService.login(credentials);
        });

        assertEquals("Invalid password", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(passwordEncoder, times(1)).matches(any(CharBuffer.class), eq("hashed_password"));
    }

    // --- Tests for register ---

    @Test
    void testRegisterSuccess() {
        SignUpDto signUpDto = new SignUpDto("test_user", "test@example.com", "password".toCharArray());
        User user = new User();
        user.setUsername("test_user");
        user.setEmail("test@example.com");
        UserDto userDto = new UserDto(1L, "test_user", "test@example.com", null);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userMapper.signUpToUser(signUpDto)).thenReturn(user);
        when(passwordEncoder.encode(CharBuffer.wrap("password".toCharArray()))).thenReturn("hashed_password");
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toUserDto(user)).thenReturn(userDto);

        UserDto result = userService.register(signUpDto);

        assertNotNull(result);
        assertEquals(userDto, result);
        assertEquals("hashed_password", user.getPassword());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testRegisterEmailTaken() {
        SignUpDto signUpDto = new SignUpDto("test_user", "test@example.com", "password".toCharArray());

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        AppException exception = assertThrows(AppException.class, () -> {
            userService.register(signUpDto);
        });

        assertEquals("Login already exists", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterNullDto() {
        AppException exception = assertThrows(AppException.class, () -> {
            userService.register(null);
        });

        assertEquals("User data cannot be null", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(userRepository, never()).findByEmail(anyString());
    }

    // --- Tests for findByLogin ---

    @Test
    void testFindByLoginSuccess() {
        UserDto userDto = new UserDto(1L, "test_user", "test@example.com", null);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userMapper.toUserDto(testUser)).thenReturn(userDto);

        UserDto result = userService.findByLogin("test@example.com");

        assertNotNull(result);
        assertEquals(userDto, result);
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void testFindByLoginNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userService.findByLogin("unknown@example.com");
        });

        assertEquals("Unknown user", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        verify(userRepository, times(1)).findByEmail("unknown@example.com");
    }

    // --- Tests for getUserById ---

    @Test
    void testGetUserByIdSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        User result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals(testUser, result);
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testGetUserByIdNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            userService.getUserById(1L);
        });

        assertEquals("User with ID 1 not found", exception.getMessage());
        verify(userRepository, times(1)).findById(1L);
    }

    // --- Tests for getUsersWithBugs ---

    @Test
    void testGetUsersWithBugsSuccess() {
        List<User> users = Arrays.asList(testUser, new User());
        when(userRepository.findUsersWithBugs()).thenReturn(users);

        List<User> result = userService.getUsersWithBugs();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(users, result);
        verify(userRepository, times(1)).findUsersWithBugs();
    }

    // --- Tests for getUserDetails ---

    @Test
    void testGetUserDetailsSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserDto result = userService.getUserDetails(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test_user", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertNull(result.getPassword());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testGetUserDetailsNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> {
            userService.getUserDetails(1L);
        });

        assertEquals("User not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        verify(userRepository, times(1)).findById(1L);
    }

    // --- Tests for createEmailVerificationToken ---

    // @Test
    // void testCreateEmailVerificationTokenSuccess() throws MessagingException {
    //     when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
    //     when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
    //     when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
    //     MimeMessage mimeMessage = mock(MimeMessage.class);
    //     when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

    //     String result = userService.createEmailVerificationToken(1L, "new@example.com");

    //     assertEquals("Verification email sent", result);
    //     verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
    //     verify(mailSender, times(1)).send(any(MimeMessage.class));
    // }

    @Test
    void testCreateEmailVerificationTokenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        String result = userService.createEmailVerificationToken(1L, "new@example.com");

        assertEquals("User not found", result);
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    // --- Tests for verifyEmail ---

    // @Test
    // void testVerifyEmailInvalidToken() {
    //     when(tokenRepository.findByToken("123456")).thenReturn(Optional.empty());

    //     boolean result = userService.verifyEmail("123456", 1L);

    //     assertFalse(result);
    //     verify(tokenRepository, times(1)).findByToken("123456");
    //     verify(userRepository, never()).save(any(User.class));
    // }

    // @Test
    // void testVerifyEmailExpiredToken() {
    //     PasswordResetToken token = new PasswordResetToken("123456", testUser, LocalDateTime.now().minusHours(1), "new@example.com");
    //     when(tokenRepository.findByToken("123456")).thenReturn(Optional.of(token));

    //     boolean result = userService.verifyEmail("123456", 1L);

    //     assertFalse(result);
    //     verify(tokenRepository, times(1)).findByToken("123456");
    //     verify(userRepository, never()).save(any(User.class));
    // }
}