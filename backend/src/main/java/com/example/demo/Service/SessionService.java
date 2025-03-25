package com.example.demo.Service;

import com.example.demo.Model.Session;
import com.example.demo.Repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    public List<Session> getAllSession() {
        return sessionRepository.findAll();

    }

    public Optional<Session> getSessionByBugId(Long bugId) {
        return Optional.ofNullable(sessionRepository.findByBugId(bugId));
    }

    public Optional<Session> getSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId);
    }

    public Session createSession(Session session) {
        if(sessionRepository.existsByOwnerIdAndBugId(session.getOwnerId(), session.getBugId())) {
            return sessionRepository.findByOwnerIdAndBugId(session.getOwnerId(),session.getBugId());
        }
        
        return sessionRepository.save(session);
    }


}
