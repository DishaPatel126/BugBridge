package com.example.demo.dto;
import lombok.Data;

@Data
public class DraftRequestDto {
    private Long userId;
    private Long bugId;
    private String code;
}
