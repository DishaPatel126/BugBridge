package com.example.demo.dto;

public class SuggestedSolution {
    private final String title;
    private final String link;
    private final String summary;

    public SuggestedSolution(String title, String link, String summary) {
        this.title = title;
        this.link = link;
        this.summary = summary;
    }

    public String getTitle() {
        return title;
    }

    public String getLink() {
        return link;
    }

    public String getSummary() {
        return summary;
    }
}
