package com.tools.ratelimiter.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClientStatResponseDTO {
    private String clientId;
    private double tokens;
    private long capacity;
    private long allowed;
    private long rejected;

}
