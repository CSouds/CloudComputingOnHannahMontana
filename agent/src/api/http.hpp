#pragma once

#include <string>

namespace api {

// Let callers interpret HTTP status codes without exposing libcurl details.
struct HttpResponse {
    long status;
    std::string body;
};

// Send JSON once and return the HTTP response, or throw when the network operation fails.
HttpResponse postJson(const std::string& url, const std::string& body);

} // namespace api
