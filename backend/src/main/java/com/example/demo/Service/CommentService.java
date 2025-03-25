package com.example.demo.Service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.Model.Comment;
import com.example.demo.Repository.CommentRepository;

    @Service
    public class CommentService {

        @Autowired
        private CommentRepository commentRepository;

        public List<Comment> getCommentsByBugId(Long bugId) {
            return commentRepository.findByBugId(bugId);
        }

        public Comment createComment(Comment comment) {
            return commentRepository.save(comment);
        }

        public boolean deleteCommentById(Long commentId) {
            if (commentRepository.existsById(commentId)) {
                commentRepository.deleteById(commentId);
                return true;
            } else {
                return false;
            }
        }
    }


