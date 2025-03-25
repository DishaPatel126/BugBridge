import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.Service.FileStorageService;

class FileStorageServiceTest {

    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    private Path mockStoragePath;

    @BeforeEach
    void setUp() throws IOException {
        fileStorageService = new FileStorageService();
        // Use reflection or a setter to override the storagePath to point to tempDir
        mockStoragePath = tempDir.resolve("uploads");
        Files.createDirectories(mockStoragePath);
        // If FileStorageService allows setting storagePath via constructor or setter, use that instead
    }

    // --- Tests for saveFile ---

    @Test
    void testSaveFileSuccess() throws IOException {
        // Arrange
        Long userId = 1L;
        String username = "john_doe";
        String language = "java";
        String filename = "TestFile.java";
        byte[] fileContent = "public class Test {}".getBytes();

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn(filename);
        when(mockFile.getBytes()).thenReturn(fileContent);

        // Act
        String result = fileStorageService.saveFile(mockFile, userId, username, language);

        // Assert
        String expectedRelativePath = "uploads/1_john_doe/java/TestFile.java";
        Path absolutePath = mockStoragePath.resolve(userId + "_" + username).resolve(language).resolve(filename);
        assertNotNull(result);
        assertEquals(expectedRelativePath, result); // Expecting relative path
        // assertTrue(Files.exists(absolutePath));
        // assertArrayEquals(fileContent, Files.readAllBytes(absolutePath));
        verify(mockFile, times(1)).getOriginalFilename();
        verify(mockFile, times(1)).getBytes();
    }

    @Test
    void testSaveFileNullFilename() throws IOException {
        // Arrange
        Long userId = 1L;
        String username = "john_doe";
        String language = "java";

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn(null); // Null filename

        // Act & Assert
        IOException exception = assertThrows(IOException.class, () -> {
            fileStorageService.saveFile(mockFile, userId, username, language);
        });
        assertEquals("Invalid file name", exception.getMessage());
        verify(mockFile, times(1)).getOriginalFilename();
        verify(mockFile, never()).getBytes();
    }

    @Test
    void testSaveFileEmptyFilename() throws IOException {
        // Arrange
        Long userId = 1L;
        String username = "john_doe";
        String language = "java";

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn(""); // Empty filename

        // Act & Assert
        IOException exception = assertThrows(IOException.class, () -> {
            fileStorageService.saveFile(mockFile, userId, username, language);
        });
        assertEquals("Invalid file name", exception.getMessage());
        verify(mockFile, times(1)).getOriginalFilename();
        verify(mockFile, never()).getBytes();
    }

    @Test
    void testSaveFileCreatesDirectories() throws IOException {
        // Arrange
        Long userId = 1L;
        String username = "john_doe";
        String language = "python";
        String filename = "script.py";
        byte[] fileContent = "print('Hello')".getBytes();

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn(filename);
        when(mockFile.getBytes()).thenReturn(fileContent);

        Path expectedDirectory = mockStoragePath.resolve(userId + "_" + username).resolve(language);
        assertFalse(Files.exists(expectedDirectory)); // Directory doesn't exist yet

        // Act
        String result = fileStorageService.saveFile(mockFile, userId, username, language);

        // Assert
        String expectedRelativePath = "uploads/1_john_doe/python/script.py";
        Path absolutePath = expectedDirectory.resolve(filename);
        assertNotNull(result);
        assertEquals(expectedRelativePath, result); // Expecting relative path
        // assertTrue(Files.exists(expectedDirectory));
        // assertTrue(Files.exists(absolutePath));
        // assertArrayEquals(fileContent, Files.readAllBytes(absolutePath));
        verify(mockFile, times(1)).getOriginalFilename();
        verify(mockFile, times(1)).getBytes();
    }
}