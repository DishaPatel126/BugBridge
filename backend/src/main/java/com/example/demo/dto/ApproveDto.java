package com.example.demo.dto;

import lombok.Data;

@Data
public
class ApproveDto {
    private Long approverId;

    public Long getApproverId() {
        return approverId;
    }
}