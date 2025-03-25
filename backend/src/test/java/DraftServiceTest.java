import com.example.demo.Model.Bug;
import com.example.demo.Model.Draft;
import com.example.demo.Model.User;
import com.example.demo.Repository.BugRepository;
import com.example.demo.Repository.DraftRepository;
import com.example.demo.Service.DraftService;
import com.example.demo.Model.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DraftServiceTest {

    @Mock
    private DraftRepository draftRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BugRepository bugRepository;

    @InjectMocks
    private DraftService draftService;

    @TempDir
    Path tempDir;

    private Path mockStoragePath;

    @BeforeEach
    void setUp() throws IOException {
        MockitoAnnotations.openMocks(this);
        // Use reflection or a setter to override the storagePath to point to tempDir
        mockStoragePath = tempDir.resolve("uploads");
        Files.createDirectories(mockStoragePath);
        // If DraftService allows setting storagePath via constructor or setter, use that instead
    }

    // --- Tests for saveDraftFile ---

    @Test
    void testSaveDraftFileNewDraftSuccess() throws IOException {
        // Arrange
        Long userId = 1L;
        Long bugId = 1L;
        String username = "john_doe";
        String code = "public class Main {}";

        User user = new User();
        user.setId(userId);
        Bug bug = new Bug();
        bug.setId(bugId);
        bug.setLanguage("java");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bugRepository.findById(bugId)).thenReturn(Optional.of(bug));
        when(draftRepository.findByUserIdAndBugId(userId, bugId)).thenReturn(null); // No existing draft

        Draft savedDraft = new Draft();
        savedDraft.setUser(user);
        savedDraft.setBug(bug);
        savedDraft.setCodeFilePath(mockStoragePath.resolve(userId + "_" + username).resolve("drafts").resolve(userId + "_" + bugId + ".java").toString());
        when(draftRepository.save(any(Draft.class))).thenReturn(savedDraft);

        // Act
        Draft result = draftService.saveDraftFile(userId, bugId, username, code);

        // Assert
        assertNotNull(result);
        assertEquals(user, result.getUser());
        assertEquals(bug, result.getBug());
        assertTrue(result.getCodeFilePath().endsWith(".java"));
        verify(draftRepository, times(1)).save(any(Draft.class));
        verify(userRepository, times(1)).findById(userId);
        verify(bugRepository, times(1)).findById(bugId);
    }

    @Test
    void testSaveDraftFileUpdateExistingDraftSuccess() throws IOException {
        // Arrange
        Long userId = 1L;
        Long bugId = 1L;
        String username = "john_doe";
        String code = "public class Main {}";

        User user = new User();
        user.setId(userId);
        Bug bug = new Bug();
        bug.setId(bugId);
        bug.setLanguage("java");

        Draft existingDraft = new Draft();
        existingDraft.setUser(user);
        existingDraft.setBug(bug);
        existingDraft.setCodeFilePath("old/path/to/draft.java");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bugRepository.findById(bugId)).thenReturn(Optional.of(bug));
        when(draftRepository.findByUserIdAndBugId(userId, bugId)).thenReturn(existingDraft);

        Draft updatedDraft = new Draft();
        updatedDraft.setUser(user);
        updatedDraft.setBug(bug);
        updatedDraft.setCodeFilePath(mockStoragePath.resolve(userId + "_" + username).resolve("drafts").resolve(userId + "_" + bugId + ".java").toString());
        when(draftRepository.save(any(Draft.class))).thenReturn(updatedDraft);

        // Act
        Draft result = draftService.saveDraftFile(userId, bugId, username, code);

        // Assert
        assertNotNull(result);
        assertEquals(user, result.getUser());
        assertEquals(bug, result.getBug());
        assertTrue(result.getCodeFilePath().endsWith(".java"));
        verify(draftRepository, times(1)).save(existingDraft);
    }

    @Test
    void testSaveDraftFileUserNotFound() {
        // Arrange
        Long userId = 1L;
        Long bugId = 1L;
        String username = "john_doe";
        String code = "public class Main {}";

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            draftService.saveDraftFile(userId, bugId, username, code);
        });
        assertEquals("User not found", exception.getMessage());
        verify(userRepository, times(1)).findById(userId);
        verify(bugRepository, never()).findById(anyLong());
        verify(draftRepository, never()).save(any(Draft.class));
    }

    @Test
    void testSaveDraftFileBugNotFound() {
        // Arrange
        Long userId = 1L;
        Long bugId = 1L;
        String username = "john_doe";
        String code = "public class Main {}";

        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bugRepository.findById(bugId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            draftService.saveDraftFile(userId, bugId, username, code);
        });
        assertEquals("Bug not found", exception.getMessage());
        verify(userRepository, times(1)).findById(userId);
        verify(bugRepository, times(1)).findById(bugId);
        verify(draftRepository, never()).save(any(Draft.class));
    }

    // --- Tests for mapLanguageToExtension ---

    @Test
    void testMapLanguageToExtension() {
        // Act & Assert
        assertEquals(".java", draftService.mapLanguageToExtension("java"));
        assertEquals(".py", draftService.mapLanguageToExtension("python"));
        assertEquals(".js", draftService.mapLanguageToExtension("javascript"));
        assertEquals(".txt", draftService.mapLanguageToExtension("other"));
        assertEquals(".txt", draftService.mapLanguageToExtension(null));
    }

    // --- Tests for getDraftsForUser ---

    @Test
    void testGetDraftsForUserSuccess() {
        // Arrange
        Long userId = 1L;
        Draft draft1 = new Draft();
        draft1.setId(1L);
        Draft draft2 = new Draft();
        draft2.setId(2L);
        List<Draft> expectedDrafts = Arrays.asList(draft1, draft2);

        when(draftRepository.findByUserId(userId)).thenReturn(expectedDrafts);

        // Act
        List<Draft> result = draftService.getDraftsForUser(userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedDrafts, result);
        verify(draftRepository, times(1)).findByUserId(userId);
    }

    @Test
    void testGetDraftsForUserNoResults() {
        // Arrange
        Long userId = 1L;
        when(draftRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        // Act
        List<Draft> result = draftService.getDraftsForUser(userId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(draftRepository, times(1)).findByUserId(userId);
    }
}