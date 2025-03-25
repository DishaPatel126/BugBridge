
package com.example.demo.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.demo.Model.Bug;
import com.example.demo.dto.SuggestedSolution;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BugSuggestionService {
    private static final String STACK_OVERFLOW_API_URL = "https://api.stackexchange.com/2.3/search";
    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public List<SuggestedSolution> getSuggestedSolutions(Bug bug) {
        try {
            String title = bug.getTitle() != null ? bug.getTitle() : "";
            String description = bug.getDescription() !=null? bug.getDescription():"";
            String url = UriComponentsBuilder.fromHttpUrl(STACK_OVERFLOW_API_URL)
                    .queryParam("intitle", title)
                    .queryParam("q", description)
                    .queryParam("site", "stackoverflow")
                    .queryParam("filter", "withbody")
                    .toUriString();

            // Execute cURL command
            String jsonResponse = executeCurlCommand(url);
            System.out.println("Raw JSON Response: " + jsonResponse);

            // Parse JSON response
            StackOverflowResponse response = mapper.readValue(jsonResponse, StackOverflowResponse.class);
            System.out.println("Parsed Response: " + response);

            return processItems(response);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    private String executeCurlCommand(String url) throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder(
                "curl",
                "-H", "User-Agent: Mozilla/5.0",
                "-s",  // Silent mode
                "-L",  // Follow redirects
                url
        );

        Process process = processBuilder.start();
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String errors = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("cURL failed: " + errors);
        }

        return output;
    }

    private List<SuggestedSolution> processItems(StackOverflowResponse response) {
        return Arrays.stream(response.getItems())
                .map(item -> new SuggestedSolution(
                        item.getTitle(),
                        "https://stackoverflow.com/questions/" + item.getQuestionId(),
                        item.getBody().substring(0, Math.min(item.getBody().length(), 200)) + "..."))
                .collect(Collectors.toList());
    }

    // Static nested classes
    public static class StackOverflowResponse {
        private Item[] items;
        private boolean has_more;
        private int backoff;

        // Default constructor
        public StackOverflowResponse() {}

        public Item[] getItems() {
            return items != null ? items : new Item[0];
        }

        public void setItems(Item[] items) {
            this.items = items;
        }

        public boolean isHas_more() {
            return has_more;
        }

        public void setHas_more(boolean has_more) {
            this.has_more = has_more;
        }

        public int getBackoff() {
            return backoff;
        }

        public void setBackoff(int backoff) {
            this.backoff = backoff;
        }

        @Override
        public String toString() {
            return "StackOverflowResponse{" +
                    "items=" + Arrays.toString(items) +
                    ", has_more=" + has_more +
                    ", backoff=" + backoff +
                    '}';
        }
    }

    public static class Item {
        private String title;
        @JsonProperty("question_id")
        private Long questionId;
        private String body;

        // Default constructor
        public Item() {}

        public String getTitle() {
            return title != null ? title : "";
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Long getQuestionId() {
            return questionId != null ? questionId : 0L;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public String getBody() {
            return body != null ? body : "";
        }

        public void setBody(String body) {
            this.body = body;
        }

        @Override
        public String toString() {
            return "Item{" +
                    "title='" + title + '\'' +
                    ", questionId=" + questionId +
                    ", body='" + body + '\'' +
                    '}';
        }
    }
}
