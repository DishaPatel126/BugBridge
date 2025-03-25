package com.example.demo.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.Model.Comment;

@Repository
    public interface CommentRepository extends JpaRepository<Comment, Long> {
        List<Comment> findByBugId(Long bugId);
    }


