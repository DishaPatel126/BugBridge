package com.example.demo.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class SubmitRequestDto {
    private Long userId;
    private Long bugId;
    private String desc;
    private String code;
}
