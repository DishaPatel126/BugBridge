package com.example.demo.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;


@Service
public class RunService {

    private static final int TIMEOUT_SECONDS = 5; // Limit execution to 5 seconds

    public String executeCode(String code, String language) throws Exception {
        ProcessBuilder processBuilder;
        File tempFile = null;
        File tempDir = null;

        try {
            switch (language.toLowerCase()) {
                case "javascript":
                    tempFile = File.createTempFile("script", ".js");
                    try (FileWriter writer = new FileWriter(tempFile)) {
                        writer.write(code);
                    }
                    processBuilder = new ProcessBuilder("node", tempFile.getAbsolutePath());
                    break;

                case "python":
                    tempFile = File.createTempFile("script", ".py");
                    try (FileWriter writer = new FileWriter(tempFile)) {
                        writer.write(code);
                    }
                    processBuilder = new ProcessBuilder("python3", tempFile.getAbsolutePath());
                    break;

                case "java":
                    tempDir = new File(System.getProperty("java.io.tmpdir"), "java_temp_" + System.nanoTime());
                    tempDir.mkdir();

                    File javaFile = new File(tempDir, "Main.java");
                    try (FileWriter writer = new FileWriter(javaFile)) {
                        writer.write(code);
                    }

                    String javacCommand = System.getProperty("os.name").toLowerCase().contains("win") ? "javac.exe" : "javac";
                    String javaCommand = System.getProperty("os.name").toLowerCase().contains("win") ? "java.exe" : "java";

                    processBuilder = new ProcessBuilder(javacCommand, javaFile.getAbsolutePath());
                    processBuilder.directory(tempDir);
                    Process compileProcess = processBuilder.start();
                    compileProcess.waitFor();

                    BufferedReader errorReader = new BufferedReader(new InputStreamReader(compileProcess.getErrorStream()));
                    StringBuilder errorOutput = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorOutput.append(errorLine).append("\n");
                    }

                    if (compileProcess.exitValue() != 0) {
                        return "Compilation Error:\n" + errorOutput.toString();
                    }

                    processBuilder = new ProcessBuilder(javaCommand, "-cp", tempDir.getAbsolutePath(), "Main");
                    break;

                default:
                    return "Error: Unsupported language";
            }

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;

            // **Execution with timeout**
            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                process.destroy(); // Kill process if it exceeds timeout
                return "Execution timed out (Limit: " + TIMEOUT_SECONDS + "s)";
            }

            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            return output.toString();

        } finally {
            // Cleanup temp files and directories AFTER execution
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
            if (tempDir != null && tempDir.exists()) {
                for (File file : tempDir.listFiles()) {
                    file.delete();
                }
                tempDir.delete();
            }
        }
    }
}