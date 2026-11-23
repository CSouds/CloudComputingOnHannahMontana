#include "register.hpp"

#include "api/http.hpp"
#include <nlohmann/json.hpp>

#include <iostream>
#include <stdexcept>

// Accept only the 43 URL-safe characters required by the backend's invitation format.
bool Register::validateToken(const std::string& token) const {
    return token.size() == 43 &&
        token.find_first_not_of("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-") == std::string::npos;
}

// Return the entered invitation, or an empty string if input ends before a token is provided.
std::string Register::promptForToken() const {
    std::cout << "Invitation token: " << std::flush;
    std::string token;
    std::getline(std::cin, token);
    return token;
}

// Submit enrollment to the backend, which checks and consumes the admin-created invitation.
std::string Register::registerDevice(
    const std::string& backendUrl,
    const std::string& displayName,
    const std::string& invitationToken
) const {
    std::string endpoint = backendUrl;

    // remove trailing / characters, and add the correct backend
    while (!endpoint.empty() && endpoint.back() == '/') endpoint.pop_back();
    endpoint += "/devices/register";

    // create the request in json format
    const std::string request = nlohmann::json{
        {"displayName", displayName},
        {"invitationToken", invitationToken}
    }.dump();

    // send the request and capture the response
    const auto response = api::postJson(endpoint, request);

    // Only a created response means the backend accepted this invitation.
    if (response.status == 403)
        throw std::runtime_error("The invitation was rejected, expired, or already used.");
    if (response.status != 201)
        throw std::runtime_error("Registration failed with HTTP " + std::to_string(response.status) + ".");
    return response.body;
}
