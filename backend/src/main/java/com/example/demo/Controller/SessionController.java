package com.example.demo.Controller;

import com.example.demo.Model.Session;
import com.example.demo.Model.User;
import com.example.demo.Service.BugService;
import com.example.demo.Service.SessionService;
import com.example.demo.Service.UserService;
import com.example.demo.dto.ResponseWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/session")
public class SessionController {

    @Autowired
    private SessionService sessionService;
    @Autowired
    private UserService userService; // Fetch User entity
    @PostMapping("/create")
    public ResponseWrapper<Session> createSession(@RequestParam Long ownerId, @RequestParam Long bugId) {
        User creator = userService.getUserById(ownerId);
        if (creator == null) {
            return new ResponseWrapper<>("error", "Invalid creator ID", null);
        }

        String sessionId = userService.getUserById(ownerId).getUsername()+"'s session"+bugId;
        Session session = new Session();
        session.setSessionId(sessionId);
        session.setOwnerId(ownerId);
        session.setBugId(bugId);
        session.getParticipants().add(ownerId); // Owner is the first participant
        Session createdSession = sessionService.createSession(session);
        return new ResponseWrapper<>("success", "Session created successfully", createdSession);
    }

    @GetMapping("/getByBug")
    public ResponseWrapper<Optional<Session>> getSessionsByBug(@RequestParam Long bugId) {
        Optional<Session> sessions = sessionService.getSessionByBugId(bugId);
        return new ResponseWrapper<>("success", "Sessions retrieved successfully", sessions);
    }
    // Optionally, add endpoints to list sessions or get session details.
}
