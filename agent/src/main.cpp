#include "register/register.hpp"

#include <exception>
#include <filesystem>
#include <iostream>
#include <string_view>

// Enroll this device using the backend address and display name supplied on the command line.
int main(int argc, char** argv) {
    if (argc != 4 || std::string_view(argv[1]) != "register") {
        std::cerr << "Usage: FileTransfer register <backend-url> <display-name>\n";
        return 1;
    }

    const std::string_view backendUrl = argv[2];
    const std::string_view displayName = argv[3];

    // Reject missing values before reporting that the registration input is ready.
    if (backendUrl.find_first_not_of(" \t\r\n") == std::string_view::npos ||
        displayName.find_first_not_of(" \t\r\n") == std::string_view::npos) {
        std::cerr << "Backend URL and display name cannot be blank.\n";
        return 1;
    }

    // Reject malformed invitations before sending the registration request.
    const Register registration;
    const std::string token = registration.promptForToken();
    if (!registration.validateToken(token)) {
        std::cerr << "Token must contain exactly 43 letters, digits, underscores, or hyphens.\n";
        return 1;
    }

    // Preserve an existing identity and confirm success only after the new credentials are saved.
    try {
        const auto filePath = std::filesystem::path(FILETRANSFER_AGENT_DIR) / "registration.json";
        if (std::filesystem::exists(filePath)) {
            std::cerr << "Registration details already exist in " << filePath.string() << ".\n";
            return 1;
        }
        const std::string response = registration.registerDevice(argv[2], argv[3], token);
        registration.saveRegistration(response, filePath.string());
        std::cout << displayName << " has been registered successfully!\n"
                  << "Registration details saved to " << std::filesystem::absolute(filePath).string() << ".\n";
    } catch (const std::exception& error) {
        std::cerr << "Error: " << error.what() << '\n';
        return 1;
    }
    return 0;
}
