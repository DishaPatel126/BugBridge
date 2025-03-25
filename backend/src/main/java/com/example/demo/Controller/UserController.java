package com.example.demo.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.User;
import com.example.demo.Model.UserRepository;
import com.example.demo.Service.UserService;
import com.example.demo.dto.ResponseWrapper;
import com.example.demo.dto.UserDto;
import com.example.demo.exceptions.AppException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;

    @Autowired
    private UserRepository userRepository;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getUsersWithBugs() {
        List<User> users = userService.getUsersWithBugs();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserDetails(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Convert User entity to UserDto and return
        UserDto userDto = new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getPassword());
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseWrapper<String>> updateUser(@RequestParam Long userId, @RequestBody UserDto userDto) {
        if (userDto == null || (userDto.getUsername() == null && userDto.getEmail() == null && userDto.getPassword() == null)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseWrapper<>("error", "No valid fields to update", null));
        }
        ResponseWrapper<String> response = userService.updateUserAccount(userId, userDto);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/send-verification-mail")
    public ResponseEntity<ResponseWrapper<String>> sendVerificationMail(@RequestParam Long userId, @RequestParam String email) {
        String result = userService.createEmailVerificationToken(userId, email);
        return ResponseEntity.ok(new ResponseWrapper<>("success", result, null));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ResponseWrapper<String>> verifyEmail(@RequestParam Long userId, @RequestParam String otp) {
        boolean isVerified = userService.verifyEmail(otp, userId);
        
        if (isVerified) {
            return ResponseEntity.ok(new ResponseWrapper<>("success", "OTP verified! Email updated.", null));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseWrapper<>("error", "Invalid or expired OTP.", null));
        }
    }

    @PostMapping("/update-email")
    public ResponseEntity<ResponseWrapper<String>> updateEmail(@RequestParam Long userId, @RequestParam String newEmail) {
        String result = userService.createEmailVerificationToken(userId, newEmail);
        return ResponseEntity.ok(new ResponseWrapper<>("success", result, null));
    }

}
