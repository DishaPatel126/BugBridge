import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.demo.Model.Bug;
import com.example.demo.Model.Submit;
import com.example.demo.Model.User;
import com.example.demo.Repository.BugRepository;
import com.example.demo.Repository.SubmitRepository;
import com.example.demo.Model.UserRepository;
import com.example.demo.Service.NotificationService;
import com.example.demo.Service.SubmitService;

class SubmitServiceTest {

    @Mock
    private SubmitRepository submitRepository;

    @Mock
    private BugRepository bugRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SubmitService submitService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Test
    void testSaveSubmissionSuccess() throws IOException {
        // Arrange
        Long userId = 1L;
        Long bugId = 1L;
        String username = "john_doe";
        String desc = "Fixing bug in the login system";
        String code = "public class Main {}";

        User user = new User();
        user.setId(userId);
        user.setUsername(username);

        User creator = new User();
        creator.setId(2L);
        Bug bug = new Bug();
        bug.setId(bugId);
        bug.setCreator(creator);
        bug.setLanguage("java");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bugRepository.findById(bugId)).thenReturn(Optional.of(bug));

        Submit mockSubmit = new Submit();
        mockSubmit.setUser(user);
        mockSubmit.setBug(bug);
        mockSubmit.setDescription(desc);
        mockSubmit.setCodeFilePath("/path/to/1_john_doe/submissions/1_1_1.java");
        when(submitRepository.save(any(Submit.class))).thenReturn(mockSubmit);

        // Act
        Submit submit = submitService.saveSubmission(userId, bugId, username, desc, code);

        // Assert
        assertNotNull(submit);
        assertEquals(user, submit.getUser());
        assertEquals(bug, submit.getBug());
        assertEquals(desc, submit.getDescription());
        assertTrue(submit.getCodeFilePath().endsWith(".java"));

        // Verify that save was called TWICE
        verify(submitRepository, times(2)).save(any(Submit.class));
    }

    @Test
    void testSaveSubmissionUserNotFound() {
        // Arrange
        Long userId = 1L;
        Long bugId = 1L;
        String username = "john_doe";
        String desc = "Fixing bug in the login system";
        String code = "public class Main {}";

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.empty()); // Simulate user not found

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            submitService.saveSubmission(userId, bugId, username, desc, code);
        });
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testSaveSubmissionBugNotFound() {
        // Arrange
        Long userId = 1L;
        Long bugId = 1L;
        String username = "john_doe";
        String desc = "Fixing bug in the login system";
        String code = "public class Main {}";

        User user = new User();  // Assume user object exists
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(user));
        when(bugRepository.findById(bugId)).thenReturn(java.util.Optional.empty()); // Simulate bug not found

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            submitService.saveSubmission(userId, bugId, username, desc, code);
        });
        assertEquals("Bug not found", exception.getMessage());
    }

    @Test
    void testMapLanguageToExtension() {
        // Act & Assert
        assertEquals(".java", submitService.mapLanguageToExtension("java"));
        assertEquals(".py", submitService.mapLanguageToExtension("python"));
        assertEquals(".js", submitService.mapLanguageToExtension("javascript"));
        assertEquals(".txt", submitService.mapLanguageToExtension("other"));
        assertEquals(".txt", submitService.mapLanguageToExtension(null));
    }

    @Test
    void testGetSubmissionsForUserAndBugSuccess() {
        // Arrange
        Long userId = 1L;
        Long bugId = 2L;

        Submit submit1 = new Submit();
        submit1.setId(1L);
        Submit submit2 = new Submit();
        submit2.setId(2L);

        List<Submit> expectedSubmissions = Arrays.asList(submit1, submit2);
        when(submitRepository.findByUserIdAndBugId(userId, bugId)).thenReturn(expectedSubmissions);

        // Act
        List<Submit> result = submitService.getSubmissionsForUserAndBug(userId, bugId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedSubmissions, result);
        verify(submitRepository, times(1)).findByUserIdAndBugId(userId, bugId);
    }

    @Test
    void testRejectSubmission_NullSubmissionId() {
        // Act & Assert
        assertThrows(NullPointerException.class, () -> submitService.rejectSubmission(null, 102L));
    }

    @Test
    void testRejectSubmission_NullRejecterId() {
        // Act & Assert
        assertThrows(NullPointerException.class, () -> submitService.rejectSubmission(1L, null));
    }

    @Test
    void testGetSubmissionsForUserAndBugNoResults() {
        // Arrange
        Long userId = 1L;
        Long bugId = 2L;

        when(submitRepository.findByUserIdAndBugId(userId, bugId)).thenReturn(Collections.emptyList());

        // Act
        List<Submit> result = submitService.getSubmissionsForUserAndBug(userId, bugId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(submitRepository, times(1)).findByUserIdAndBugId(userId, bugId);
    }

    // --- Tests for findApprovedSubmissionsByBugId ---

   @Test
    void testFindApprovedSubmissionsByBugIdMultipleFromSameUser() {
        // Arrange
        Long bugId = 1L;
        User user1 = new User();
        user1.setId(1L);

        Bug bug = new Bug();
        bug.setId(bugId);
        bug.setStatus("open"); // Initial status

        Submit submit1 = new Submit();
        submit1.setUser(user1);
        submit1.setBug(bug); // Associate with the same bugId
        submit1.setSubmittedAt(LocalDateTime.ofInstant(Instant.ofEpochMilli(1000L), ZoneId.systemDefault()));
        submit1.setApprovalStatus("approved"); // Ensure approval status is set

        Submit submit2 = new Submit();
        submit2.setUser(user1);
        submit2.setBug(bug); // Associate with the same bugId
        submit2.setSubmittedAt(LocalDateTime.ofInstant(Instant.ofEpochMilli(2000L), ZoneId.systemDefault()));
        submit2.setApprovalStatus("approved"); // Ensure approval status is set

        List<Submit> approvedSubmissions = Arrays.asList(submit1, submit2); // Include both submissions
        when(submitRepository.findByBugIdAndApprovalStatus(bugId, "approved")).thenReturn(approvedSubmissions);
        when(bugRepository.findById(bugId)).thenReturn(Optional.of(bug)); // Mock Bug lookup
        when(bugRepository.save(any(Bug.class))).thenAnswer(invocation -> invocation.getArgument(0)); // Mock save

        // Act
        List<Submit> result = submitService.findApprovedSubmissionsByBugId(bugId);

        // Assert
        assertEquals(1, result.size());
        assertEquals(submit2, result.get(0)); // Should return the most recent submission
        assertEquals("Resolved", bug.getStatus()); // Verify bug status is updated
        verify(submitRepository).findByBugIdAndApprovalStatus(bugId, "approved");
        verify(bugRepository).findById(bugId);
        verify(bugRepository).save(bug);
    }

    @Test
    void testFindApprovedSubmissionsByBugIdDifferentUsers() {
        // Arrange
        Long bugId = 1L;
        User user1 = new User();
        user1.setId(1L);
        User user2 = new User();
        user2.setId(2L);

        Bug bug = new Bug();
        bug.setId(bugId);
        bug.setStatus("open"); // Initial status

        Submit submit1 = new Submit();
        submit1.setUser(user1);
        submit1.setBug(bug);
        submit1.setSubmittedAt(LocalDateTime.ofInstant(Instant.ofEpochMilli(1000L), ZoneId.systemDefault()));
        submit1.setApprovalStatus("approved"); // Ensure approval status is set

        Submit submit2 = new Submit();
        submit2.setUser(user2);
        submit2.setBug(bug);
        submit2.setSubmittedAt(LocalDateTime.ofInstant(Instant.ofEpochMilli(2000L), ZoneId.systemDefault()));
        submit2.setApprovalStatus("approved"); // Ensure approval status is set

        List<Submit> approvedSubmissions = Arrays.asList(submit1, submit2);
        when(submitRepository.findByBugIdAndApprovalStatus(bugId, "approved")).thenReturn(approvedSubmissions);
        when(bugRepository.findById(bugId)).thenReturn(Optional.of(bug));
        when(bugRepository.save(any(Bug.class))).thenAnswer(invocation -> invocation.getArgument(0)); // Mock save to return the modified Bug

        // Act
        List<Submit> result = submitService.findApprovedSubmissionsByBugId(bugId);

        // Assert
        assertEquals(2, result.size());
        assertTrue(result.contains(submit1));
        assertTrue(result.contains(submit2));
        assertEquals("Resolved", bug.getStatus()); // Verify bug status is updated
        verify(submitRepository).findByBugIdAndApprovalStatus(bugId, "approved");
        verify(bugRepository).findById(bugId);
        verify(bugRepository).save(bug);
    }

    @Test
    void testFindApprovedSubmissionsByBugIdNoResults() {
        // Arrange
        Long bugId = 1L;
        when(submitRepository.findByBugIdAndApprovalStatus(bugId, "approved")).thenReturn(Collections.emptyList());

        // Act
        List<Submit> result = submitService.findApprovedSubmissionsByBugId(bugId);

        // Assert
        assertTrue(result.isEmpty());
    }

    // --- Tests for getSubmissionById ---

    @Test
    void testGetSubmissionByIdFound() {
        // Arrange
        Long submissionId = 1L;
        Long rejecterId = 102L;

        when(submitRepository.findById(submissionId)).thenReturn(Optional.empty());

        // Act
        String result = submitService.rejectSubmission(submissionId, rejecterId);

        // Assert
        assertEquals("Submission not found.", result);
        verify(submitRepository, never()).save(any(Submit.class));
        verify(notificationService, never()).createNotification(anyLong(), anyString());
    }

    @Test
    void testRejectSubmission_UserNotBugCreator() {
        // Arrange
        Long submissionId = 1L;
        Long rejecterId = 302L;

        User creator = new User();
        creator.setId(102L);

        Bug bug = new Bug();
        bug.setId(1L);
        bug.setCreator(creator);

        Submit submission = new Submit();
        submission.setId(submissionId);
        submission.setBug(bug);

        when(submitRepository.findById(submissionId)).thenReturn(Optional.of(submission));

        // Act
        String result = submitService.rejectSubmission(submissionId, rejecterId);

        // Assert
        assertEquals("Only the bug creator can reject submissions.", result);
        verify(submitRepository, never()).save(any(Submit.class));
        verify(notificationService, never()).createNotification(anyLong(), anyString());
    }
}
