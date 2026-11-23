cmake_minimum_required(VERSION 3.16)

project(FileTransfer LANGUAGES CXX)

# Build the CLI with standard C++17.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Send HTTP requests with libcurl and escape request fields with the JSON library.
find_package(CURL 7.85 REQUIRED)
include(FetchContent)
FetchContent_Declare(json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.12.0
    GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(json)

add_executable(FileTransfer
    src/main.cpp
    src/register/register.cpp
    src/api/http.cpp
)

# Let feature folders include shared helpers relative to the source directory.
target_include_directories(FileTransfer PRIVATE src)

# Save this installation's credentials in agent/ regardless of the shell's working directory.
target_compile_definitions(FileTransfer PRIVATE FILETRANSFER_AGENT_DIR="${CMAKE_CURRENT_SOURCE_DIR}")
target_link_libraries(FileTransfer PRIVATE CURL::libcurl nlohmann_json::nlohmann_json)
