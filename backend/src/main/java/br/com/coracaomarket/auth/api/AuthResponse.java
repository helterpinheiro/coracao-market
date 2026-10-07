package br.com.coracaomarket.auth.api;

import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String name,
        String email,
        String token
) {}