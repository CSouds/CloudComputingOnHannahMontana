package com.cloudcomputing.backend.invitations;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import com.cloudcomputing.backend.groups.GroupRepository;
import com.cloudcomputing.backend.errors.exceptions.InvalidInvitationException;
import com.cloudcomputing.backend.security.TokenService;
import org.springframework.stereotype.Service;

@Service
public class InvitationService {
    private final GroupRepository groups;
    private final InvitationRepository invitations;
    private final Clock clock;
    private final TokenService tokens;

    // Use existing groups and shared time handling when issuing enrollment permission.
    public InvitationService(GroupRepository groups, InvitationRepository invitations, Clock clock, TokenService tokens) {
        this.groups = groups;
        this.invitations = invitations;
        this.clock = clock;
        this.tokens = tokens;
    }

    // Issue a high-entropy token once while persisting only its hash for a known group.
    public IssuedInvitation createInvitation(UUID groupId, int expiresInMinutes) {
        if (groupId == null) {
            throw new IllegalArgumentException("Group ID is required.");
        }
        if (expiresInMinutes < 1 || expiresInMinutes > 60) {
            throw new IllegalArgumentException("Invitation lifetime must be between 1 and 60 minutes.");
        }
        if (groups.findById(groupId).isEmpty()) {
            throw new IllegalArgumentException("Group does not exist: " + groupId);
        }

        String token = tokens.generateToken();
        Instant createdAt = clock.instant();
        Instant expiresAt = createdAt.plus(Duration.ofMinutes(expiresInMinutes));
        var invitation = new RegistrationInvitation(
                UUID.randomUUID(), groupId, tokens.hashToken(token), createdAt, expiresAt, null);
        invitations.insert(invitation);
        return new IssuedInvitation(invitation.id(), groupId, token, expiresAt);
    }

    // Redeem through one conditional update inside the device service's registration transaction.
    public UUID consumeInvitation(String token) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) {
            throw new InvalidInvitationException();
        }
        return invitations.consume(tokens.hashToken(token), clock.instant())
                .orElseThrow(InvalidInvitationException::new);
    }

    // Carry the token to the admin output without including it in incidental log messages.
    public record IssuedInvitation(UUID id, UUID groupId, String token, Instant expiresAt) {
        @Override
        public String toString() {
            return "IssuedInvitation[id=" + id + ", groupId=" + groupId
                    + ", token=[REDACTED], expiresAt=" + expiresAt + "]";
        }
    }
}
