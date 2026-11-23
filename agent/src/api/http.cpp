#include "http.hpp"

#include <curl/curl.h>

#include <stdexcept>

namespace api {

// Share HTTP setup, response collection, and timeouts across backend operations.
HttpResponse postJson(const std::string& url, const std::string& body) {
    HttpResponse response{};

    // Release HTTP resources on every failure path before reporting the error to the caller.
    if (curl_global_init(CURL_GLOBAL_DEFAULT) != CURLE_OK)
        throw std::runtime_error("Could not initialize libcurl.");
    CURL* curl = curl_easy_init();
    curl_slist* headers = curl_slist_append(nullptr, "Content-Type: application/json");
    if (!curl || !headers) {
        curl_slist_free_all(headers);
        if (curl) curl_easy_cleanup(curl);
        curl_global_cleanup();
        throw std::runtime_error("Could not create the HTTP request.");
    }

    // Collect the reply without allowing a large response or a C++ exception into libcurl.
    const auto receiveResponse = +[](char* data, std::size_t size, std::size_t count, void* context) -> std::size_t {
        auto& responseBody = *static_cast<std::string*>(context);
        if (size != 0 && count > (65536 - responseBody.size()) / size) return 0;
        const auto length = size * count;
        try { responseBody.append(data, length); } catch (...) { return 0; }
        return length;
    };

    // Bound waiting time and avoid redirects or retries that could forward or consume credentials.
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_PROTOCOLS_STR, "http,https");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, static_cast<long>(body.size()));
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 5L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 15L);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 0L);
    curl_easy_setopt(curl, CURLOPT_NOSIGNAL, 1L);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, receiveResponse);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response.body);
    const CURLcode result = curl_easy_perform(curl);
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response.status);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    curl_global_cleanup();

    // Preserve uncertainty after a network failure so callers do not assume a retry is safe.
    if (result != CURLE_OK)
        throw std::runtime_error(std::string("HTTP request failed: ") + curl_easy_strerror(result)
            + ". The backend may have received it; check before retrying.");
    return response;
}

} // namespace api
