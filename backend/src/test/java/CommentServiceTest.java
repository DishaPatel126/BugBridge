
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.demo.Model.Comment;
import com.example.demo.Repository.CommentRepository;
import com.example.demo.Service.CommentService;

class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- Tests for getCommentsByBugId ---

    @Test
    void testGetCommentsByBugIdSuccess() {
        // Arrange
        Long bugId = 1L;
        Comment comment1 = new Comment();
        comment1.setId(1L);
        comment1.setBugId(bugId);
        Comment comment2 = new Comment();
        comment2.setId(2L);
        comment2.setBugId(bugId);
        List<Comment> expectedComments = Arrays.asList(comment1, comment2);

        when(commentRepository.findByBugId(bugId)).thenReturn(expectedComments);

        // Act
        List<Comment> result = commentService.getCommentsByBugId(bugId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedComments, result);
        verify(commentRepository, times(1)).findByBugId(bugId);
    }

    @Test
    void testGetCommentsByBugIdNoResults() {
        // Arrange
        Long bugId = 1L;
        when(commentRepository.findByBugId(bugId)).thenReturn(Collections.emptyList());

        // Act
        List<Comment> result = commentService.getCommentsByBugId(bugId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(commentRepository, times(1)).findByBugId(bugId);
    }

    // --- Tests for createComment ---

    @Test
    void testCreateCommentSuccess() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(1L);
        comment.setBugId(1L);
        comment.setText("Test comment");

        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        // Act
        Comment result = commentService.createComment(comment);

        // Assert
        assertNotNull(result);
        assertEquals(comment, result);
        verify(commentRepository, times(1)).save(comment);
    }

    // --- Tests for deleteCommentById ---

    @Test
    void testDeleteCommentByIdSuccess() {
        // Arrange
        Long commentId = 1L;
        when(commentRepository.existsById(commentId)).thenReturn(true);
        doNothing().when(commentRepository).deleteById(commentId);

        // Act
        boolean result = commentService.deleteCommentById(commentId);

        // Assert
        assertTrue(result);
        verify(commentRepository, times(1)).existsById(commentId);
        verify(commentRepository, times(1)).deleteById(commentId);
    }

    @Test
    void testDeleteCommentByIdNotFound() {
        // Arrange
        Long commentId = 1L;
        when(commentRepository.existsById(commentId)).thenReturn(false);

        // Act
        boolean result = commentService.deleteCommentById(commentId);

        // Assert
        assertFalse(result);
        verify(commentRepository, times(1)).existsById(commentId);
        verify(commentRepository, never()).deleteById(commentId);
    }
}