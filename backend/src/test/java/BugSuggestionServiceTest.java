import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.demo.Model.Bug;
import com.example.demo.Service.BugSuggestionService;
import com.example.demo.dto.SuggestedSolution;

class BugSuggestionServiceTest {

    @Mock
    private BugSuggestionService bugSuggestionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetSuggestedSolutions_EmptyList() {
        // Arrange
        Bug bug = new Bug();
        bug.setTitle("Test Bug");
        when(bugSuggestionService.getSuggestedSolutions(bug)).thenReturn(Collections.emptyList());

        // Act
        List<SuggestedSolution> suggestions = bugSuggestionService.getSuggestedSolutions(bug);

        // Assert
        assertEquals(0, suggestions.size());
    }

    @Test
    void testGetSuggestedSolutions_SingleResult() {
        // Arrange
        Bug bug = new Bug();
        bug.setTitle("NullPointerException");

        SuggestedSolution solution = new SuggestedSolution("Title", "Link", "Body");
        when(bugSuggestionService.getSuggestedSolutions(bug)).thenReturn(Collections.singletonList(solution));

        // Act
        List<SuggestedSolution> suggestions = bugSuggestionService.getSuggestedSolutions(bug);

        // Assert
        assertEquals(1, suggestions.size());
        assertEquals("Title", suggestions.get(0).getTitle());
        assertEquals("Link", suggestions.get(0).getLink());
        assertEquals("Body", suggestions.get(0).getSummary());
    }

    @Test
    void testGetSuggestedSolutions_MultipleResults() {
        // Arrange
        Bug bug = new Bug();
        bug.setTitle("ArrayOutOfBoundsException");

        SuggestedSolution solution1 = new SuggestedSolution("Title 1", "Link 1", "Body 1");
        SuggestedSolution solution2 = new SuggestedSolution("Title 2", "Link 2", "Body 2");
        List<SuggestedSolution> mockSolutions = Arrays.asList(solution1, solution2);

        when(bugSuggestionService.getSuggestedSolutions(bug)).thenReturn(mockSolutions);

        // Act
        List<SuggestedSolution> suggestions = bugSuggestionService.getSuggestedSolutions(bug);

        // Assert
        assertEquals(2, suggestions.size());
        assertEquals("Title 1", suggestions.get(0).getTitle());
        assertEquals("Title 2", suggestions.get(1).getTitle());
    }

    @Test
    void testGetSuggestedSolutions_NullBugTitle() {
        // Arrange
        Bug bug = new Bug();
        bug.setTitle(null);

        when(bugSuggestionService.getSuggestedSolutions(bug)).thenReturn(Collections.emptyList());

        // Act
        List<SuggestedSolution> suggestions = bugSuggestionService.getSuggestedSolutions(bug);

        // Assert
        assertEquals(0, suggestions.size());
    }

    @Test
    void testGetSuggestedSolutions_ApiServiceThrowsException() {
        // Arrange
        Bug bug = new Bug();
        bug.setTitle("Some Title");

        when(bugSuggestionService.getSuggestedSolutions(bug)).thenThrow(new RuntimeException("API Service Failed"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> bugSuggestionService.getSuggestedSolutions(bug));
    }
}

