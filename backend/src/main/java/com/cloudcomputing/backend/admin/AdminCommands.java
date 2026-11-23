package com.cloudcomputing.backend.admin;

import java.io.PrintStream;
import java.util.Set;
import java.util.UUID;

import com.cloudcomputing.backend.groups.GroupService;
import com.cloudcomputing.backend.invitations.InvitationService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;

/**
 * Create groups and invitations from the backend host without exposing public management endpoints.
 * Each command saves its result and exits without starting the HTTP server.
 *
 * Run from backend/; Compose starts both PostgreSQL and the HTTP backend:
 *
 * <pre>
 * docker compose up -d
 * docker compose exec backend java -jar /app/backend.jar admin create-group --name="My devices"
 * docker compose exec backend java -jar /app/backend.jar admin create-invitation --group-id="YOUR_GROUP_ID"
 * </pre>
 *
 * Replace YOUR_GROUP_ID with the ID printed by create-group. Invitations expire after
 * 10 minutes by default; add --expires-in-minutes=15 to choose a lifetime of 1–60 minutes.
 * Save the displayed invitation token securely: it is shown only at creation and only its hash is stored.
 * Run docker compose up -d --build after Java changes to rebuild and restart the backend.
 * Run docker compose stop to stop both services without deleting database data.
 */
@Component
public class AdminCommands {
    private final GroupService groups;
    private final InvitationService invitations;

    // Reuse transactional services so provisioning commits before reporting success.
    public AdminCommands(GroupService groups, InvitationService invitations) {
        this.groups = groups;
        this.invitations = invitations;
    }

    // Print provisioning results and return a nonzero exit code for invalid admin input.
    public int execute(ApplicationArguments args, PrintStream output, PrintStream errors) {
        try {
            var commands = args.getNonOptionArgs();
            if (commands.size() != 2 || !"admin".equals(commands.get(0))) {
                throw new IllegalArgumentException("Specify one admin command.");
            }
            switch (commands.get(1)) {
                case "create-group" -> {
                    validateOptions(args, Set.of("name"));
                    var group = groups.createGroup(requiredOption(args, "name"));
                    output.println("Group ID: " + group.id());
                    output.println("Name: " + group.name());
                }
                case "create-invitation" -> {
                    validateOptions(args, Set.of("group-id", "expires-in-minutes"));
                    UUID groupId = UUID.fromString(requiredOption(args, "group-id"));
                    int minutes = args.containsOption("expires-in-minutes")
                            ? Integer.parseInt(requiredOption(args, "expires-in-minutes")) : 10;
                    var invitation = invitations.createInvitation(groupId, minutes);
                    output.println("Invitation ID: " + invitation.id());
                    output.println("Group ID: " + invitation.groupId());
                    output.println("Expires at: " + invitation.expiresAt());
                    output.println("Invitation token (shown only now): " + invitation.token());
                }
                default -> throw new IllegalArgumentException("Unknown admin command.");
            }
            return 0;
        } catch (IllegalArgumentException exception) {
            errors.println("Error: " + exception.getMessage());
            errors.println("Usage: admin create-group --name=\"My devices\"");
            errors.println("       admin create-invitation --group-id=<UUID> [--expires-in-minutes=10]");
            return 2;
        }
    }

    // Catch misspelled options before a command creates persistent records.
    private void validateOptions(ApplicationArguments args, Set<String> allowed) {
        if (!allowed.containsAll(args.getOptionNames())) {
            throw new IllegalArgumentException("Unknown option for this command.");
        }
    }

    // Require one explicit value so missing or repeated arguments cannot change command intent.
    private String requiredOption(ApplicationArguments args, String name) {
        var values = args.getOptionValues(name);
        if (values == null || values.size() != 1 || values.get(0).isBlank()) {
            throw new IllegalArgumentException("Provide exactly one nonblank --" + name + "=<value>.");
        }
        return values.get(0);
    }
}
