#include "register.hpp"

#include "api/http.hpp"
#include <nlohmann/json.hpp>

#include <iostream>
#include <stdexcept>
#include <cerrno>
#include <fcntl.h>
#include <unistd.h>

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

// Save only a complete device identity, without overwriting credentials from an earlier enrollment.
void Register::saveRegistration(const std::string& response, const std::string& filePath) const {
    const auto registration = nlohmann::json::parse(response);
    if (registration.at("deviceId").get<std::string>().empty() ||
        registration.at("groupId").get<std::string>().empty() ||
        !validateToken(registration.at("deviceToken").get<std::string>())) {
        throw std::runtime_error("The backend returned incomplete registration details.");
    }
    const std::string data = registration.dump(2) + '\n';

    // Create an owner-only file from the outset so other users cannot read the device token.
    const int file = ::open(filePath.c_str(), O_WRONLY | O_CREAT | O_EXCL, 0600);
    if (file < 0)
        throw std::runtime_error("Device registered, but could not create " + filePath + ".");

    // Finish and flush every byte before claiming the credential was saved.
    std::size_t offset = 0;
    while (offset < data.size()) {
        const auto written = ::write(file, data.data() + offset, data.size() - offset);
        if (written < 0 && errno == EINTR) continue;
        if (written <= 0) break;
        offset += static_cast<std::size_t>(written);
    }
    const bool flushed = offset == data.size() && ::fsync(file) == 0;
    const bool closed = ::close(file) == 0;
    if (!flushed || !closed) {
        ::unlink(filePath.c_str());
        throw std::runtime_error("Device registered, but could not save all details to " + filePath + ".");
    }
}
