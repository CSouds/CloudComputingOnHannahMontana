#pragma once

#include <string>

class Register {
public:
    // Reject malformed invitations before they are sent to the backend.
    bool validateToken(const std::string& token) const;

    // Read the invitation interactively so it does not need to be a CLI argument.
    std::string promptForToken() const;

    // Return the backend's registration JSON, including the device credential, or throw on failure.
    std::string registerDevice(
        const std::string& backendUrl,
        const std::string& displayName,
        const std::string& invitationToken
    ) const;
};
