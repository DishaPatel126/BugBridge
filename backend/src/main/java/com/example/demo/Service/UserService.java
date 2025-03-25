package com.example.demo.Service;

import java.io.UnsupportedEncodingException;
import java.nio.CharBuffer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.Model.PasswordResetToken;
import com.example.demo.Model.PasswordResetTokenRepository;
import com.example.demo.Model.User;
import com.example.demo.Model.UserRepository;
import com.example.demo.dto.CredentialsDto;
import com.example.demo.dto.ResponseWrapper;
import com.example.demo.dto.SignUpDto;
import com.example.demo.dto.UserDto;
import com.example.demo.exceptions.AppException;
import com.example.demo.mappers.UserMapper;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserMapper userMapper;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    // @Autowired
    // private PasswordResetService passwordResetService;

    public UserDto login(CredentialsDto credentialsDto) {
        User user = userRepository.findByEmail(credentialsDto.getEmail())
                .orElseThrow(() -> new AppException("Unknown user", HttpStatus.NOT_FOUND));

        if (passwordEncoder.matches(CharBuffer.wrap(credentialsDto.getPassword()), user.getPassword())) {
            return userMapper.toUserDto(user);
        }
        throw new AppException("Invalid password", HttpStatus.BAD_REQUEST);
    }

    public UserDto register(SignUpDto userDto) {
        if (userDto == null) {
            throw new AppException("User data cannot be null", HttpStatus.BAD_REQUEST);
        }

        if (userDto.getEmail() == null || userDto.getEmail().trim().isEmpty()) {
            throw new AppException("Email is required", HttpStatus.BAD_REQUEST);
        }

        if (userDto.getUsername() == null || userDto.getUsername().trim().isEmpty()) {
            throw new AppException("Username is required", HttpStatus.BAD_REQUEST);
        }

        if (userDto.getPassword() == null || userDto.getPassword().length == 0) {
            throw new AppException("Password cannot be empty", HttpStatus.BAD_REQUEST);
        }
        Optional<User> optionalUser = userRepository.findByEmail(userDto.getEmail());

        if (optionalUser.isPresent()) {
            throw new AppException("Login already exists", HttpStatus.BAD_REQUEST);
        }

        User user = userMapper.signUpToUser(userDto);
        user.setPassword(passwordEncoder.encode(CharBuffer.wrap(userDto.getPassword())));

        User savedUser = userRepository.save(user);

        return userMapper.toUserDto(savedUser);
    }

    public UserDto findByLogin(String login) {
        User user = userRepository.findByEmail(login)
                .orElseThrow(() -> new AppException("Unknown user", HttpStatus.NOT_FOUND));
        return userMapper.toUserDto(user);
    }

    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new EntityNotFoundException("User with ID " + id + " not found");
        }
        return user.get();
    }

    public List<User> getUsersWithBugs() {
        return userRepository.findUsersWithBugs();
    }

    public UserDto getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), null); //No password returned
    }

    public ResponseWrapper<String> updateUserAccount(Long userId, UserDto updatedUserDto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    
        System.out.println("Updating User: " + user.getId());
        boolean updated = false;
        boolean emailUpdated = false; // Track if email was updated
    
        // ✅ 1. Move `pendingEmail` to `email` if it exists
        if (user.getPendingEmail() != null) {
            System.out.println("Applying pending email: " + user.getPendingEmail());
            user.setEmail(user.getPendingEmail()); // ✅ Move verified email to `email`
            user.setPendingEmail(null); // ✅ Clear `pendingEmail`
            updated = true;
            emailUpdated = true; // ✅ Email was updated
        }
    
        // ✅ 2. Update username if provided
        if (updatedUserDto.getUsername() != null && !updatedUserDto.getUsername().isEmpty()) {
            user.setUsername(updatedUserDto.getUsername());
            updated = true;
        }
    
        // ✅ 3. If email is changed & no OTP is pending, store in `pendingEmail` & send OTP
        if (updatedUserDto.getEmail() != null && !updatedUserDto.getEmail().isEmpty() &&
            !updatedUserDto.getEmail().equals(user.getEmail()) && user.getPendingEmail() == null) {
    
            System.out.println("Storing pending email: " + updatedUserDto.getEmail());
            user.setPendingEmail(updatedUserDto.getEmail()); // ✅ Store new email in `pendingEmail`
            userRepository.save(user); // ✅ Save before sending OTP
            createEmailVerificationToken(userId, updatedUserDto.getEmail());
    
            return new ResponseWrapper<>("success", "Email verification OTP Sent. Click 'Save Changes' after verification.", null);
        }
    
        // ✅ 4. Update password if provided
        if (updatedUserDto.getPassword() != null && !updatedUserDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUserDto.getPassword()));
            updated = true;
        }
    
        if (!updated) {
            throw new AppException("No valid fields to update", HttpStatus.BAD_REQUEST);
        }
    
        // ✅ 5. Save user before returning response
        userRepository.save(user);
    
        // ✅ 6. Force logout if email was updated
        if (emailUpdated) {
            return new ResponseWrapper<>("logout", "Email updated successfully. Please log in again.", null);
        }
    
        return new ResponseWrapper<>("success", "User updated successfully", null);
    }
    
    
    // Send OTP for email verification
    public String createEmailVerificationToken(Long userId, String newEmail) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return "User not found";
        }
    
        User user = userOpt.get();

        // Delete any existing token before creating a new one
        Optional<PasswordResetToken> existingTokenOpt = tokenRepository.findByUser(user);
        existingTokenOpt.ifPresent(tokenRepository::delete);



        Random random = new Random();
        String otp = String.valueOf(100000 + random.nextInt(900000));
    
        // Save the OTP as a token for verification
        PasswordResetToken verificationToken = new PasswordResetToken(otp, user, LocalDateTime.now().plusHours(1));
        verificationToken.setNewEmail(newEmail);
        tokenRepository.save(verificationToken); 
    
        sendVerificationEmail(newEmail, otp);
        return "Verification email sent";
    }
    
    // Send email verification OTP
    private void sendVerificationEmail(String email, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
    
            String emailContent = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;'>"
                    + "<h2 style='color: #333;'>Email Verification</h2>"
                    + "<p style='font-size: 16px;'>Hello,</p>"
                    + "<p style='font-size: 16px;'>We received a request to update your email. Use the OTP below to verify your new email address:</p>"
                    + "<div style='text-align: center; margin: 20px 0; padding: 10px; background-color: #eee; border-radius: 5px; font-size: 18px; font-weight: bold; letter-spacing: 1px;'>"
                    + otp + "</div>"
                    + "<p style='font-size: 14px; color: #777;'>Copy this OTP and enter it in the verification form.</p>"
                    + "<p style='font-size: 14px; color: #777;'>This OTP will expire in 1 hour.</p>"
                    + "<p style='font-size: 14px; color: #777;'>If you did not request this, please ignore this email.</p>"
                    + "<p style='font-size: 14px; color: #777;'>Thank you,<br>The Support Team</p>"
                    + "</div>";
    
            helper.setTo(email);
            helper.setSubject("BugBoard Email Verification OTP");
            helper.setText(emailContent, true);
            helper.setFrom("support@bugboard.com", "BugBoard Support Team");
    
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }
    
    // Verify OTP and update email
    public boolean verifyEmail(String otp, Long userId) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(otp);
    
        if (!tokenOpt.isPresent()) {
            return false;
        }
    
        PasswordResetToken token = tokenOpt.get();
        if (token.getExpiryDate().isBefore(LocalDateTime.now()) || !token.getUser().getId().equals(userId)) {
            return false;
        }
    
        User user = token.getUser();
        if (token.getNewEmail() != null) {
            user.setPendingEmail(token.getNewEmail());
        } else {
            return false; 
        }
        userRepository.save(user);
        tokenRepository.delete(token);
        return true;
    }
}