package com.cloudcomputing.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.stereotype.Service;

// Use the same secure token format and hashing for invitations and device credentials.
@Service
public class TokenService {
    private final SecureRandom random = new SecureRandom();

    // Generate 256-bit secrets so tokens cannot feasibly be guessed.
    public String generateToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // Store hashes instead of usable bearer tokens in database records.
    public String hashToken(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is required for token hashing.", exception);
        }
    }
}
