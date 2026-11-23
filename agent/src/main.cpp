#include "register.hpp"

#include <exception>
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

    // Confirm enrollment with the device name instead of showing the backend response.
    try {
        registration.registerDevice(argv[2], argv[3], token);
        std::cout << displayName << " has been registered successfully!\n";
    } catch (const std::exception& error) {
        std::cerr << "Registration failed: " << error.what() << '\n';
        return 1;
    }
    return 0;
}
