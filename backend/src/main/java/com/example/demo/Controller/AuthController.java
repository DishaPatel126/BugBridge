package com.example.demo.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Security.UserAuthenticationProvider;
import com.example.demo.Service.PasswordResetService;
import com.example.demo.Service.UserService;
import com.example.demo.dto.CredentialsDto;
import com.example.demo.dto.ResponseWrapper;
import com.example.demo.dto.SignUpDto;
import com.example.demo.dto.UserDto;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    private final UserAuthenticationProvider userAuthenticationProvider;
    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseWrapper<UserDto> login(@RequestBody CredentialsDto credentialsDto) {
        UserDto userDto = userService.login(credentialsDto);
        userDto.setToken(userAuthenticationProvider.createToken(userDto.getEmail()));
        return new ResponseWrapper<>("success", "Login successful", userDto);
    }

    @PostMapping("/register")
    public ResponseWrapper<UserDto> register(@RequestBody SignUpDto user) {
    UserDto createdUser = userService.register(user);
    createdUser.setToken(userAuthenticationProvider.createToken(user.getEmail()));
    
    // Wrap the createdUser in ResponseWrapper
    return new ResponseWrapper<>("success", "User registration successful", createdUser); // Returning the ResponseWrapper directly
}


    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseWrapper<String>> requestPasswordReset(@RequestBody Map<String, String> request) {
        String result = passwordResetService.createPasswordResetToken(request.get("email"));
        ResponseWrapper<String> response = new ResponseWrapper<>("success", "Password reset token created", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<ResponseWrapper<Boolean>> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateToken(token);
        ResponseWrapper<Boolean> response = new ResponseWrapper<>("success", "Token validation result", isValid);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResponseWrapper<String>> resetPassword(@RequestBody Map<String, String> request) {
        String result = passwordResetService.resetPassword(request.get("token"), request.get("newPassword"));
        ResponseWrapper<String> response = new ResponseWrapper<>("success", "Password reset successful", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ResponseWrapper<String>> verifyEmail(@RequestBody Map<String, String> request) {
        String otp = request.get("otp");
        Long userId = Long.valueOf(request.get("userId"));

        boolean isVerified = userService.verifyEmail(otp, userId);

        if (isVerified) {
            return ResponseEntity.ok(new ResponseWrapper<>("success", "Email verified successfully", null));
        } else {
            return ResponseEntity.badRequest().body(new ResponseWrapper<>("error", "Invalid or expired OTP", null));
        }
    }

}
