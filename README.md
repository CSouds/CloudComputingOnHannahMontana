# CloudComputingOnHannahMontana

A cloud computing class project for transferring files between devices on the same network.

The C++ agent supports device registration, and the React UI lists registered devices.
File transfers are still to come.

## Why a backend?

The Spring Boot backend registers devices, assigns them to groups, and validates
invitations. PostgreSQL saves those records across restarts. Each device receives
an ID and token for future authentication. File transfers will be **peer to peer,
directly between C++ agents**; file contents will not pass through the Spring Boot backend.

## Requirements

- Docker with Docker Compose.
- A C++17 compiler, CMake 3.16+, Make, Git, and libcurl 7.85+ development headers.

Java runs inside Docker. The first build needs internet access to download dependencies.

## Start the backend

From the project root:

```sh
cd backend
docker compose up -d
```

This starts Spring Boot and PostgreSQL. The API runs at `http://localhost:8080`;
`curl http://localhost:8080/health` returns `{"status":"ok"}` when ready.

From `backend/`, use `docker compose stop` to stop both services. After Java
changes, use `docker compose up -d --build` to rebuild. Stopping keeps your data.

## Create an invitation

Still in `backend/`, create a group:

```sh
docker compose exec backend java -jar /app/backend.jar admin create-group --name="My devices"
```

Use the printed group ID to create an invitation:

```sh
docker compose exec backend java -jar /app/backend.jar admin create-invitation --group-id="GROUP_ID"
```

Copy the invitation token. Each invitation works once and expires after 10 minutes.

## Register a device

From `backend/`, move into the agent's build folder, then build and run:

```sh
cd ../agent
mkdir -p build
cd build
cmake ..
make
./FileTransfer register http://localhost:8080 "My laptop"
```

Paste the invitation token when prompted. On success, the agent confirms registration
and saves the device ID, group ID, and token in `agent/registration.json`. This file
is ignored by Git. An existing file prevents registering again accidentally.

## Start the UI

With the backend running and a device registered, run from the project root:

```sh
cd ui
cp .env.example .env.local
```

Set `VITE_DEVICE_TOKEN` in `.env.local` to the `deviceToken` from
`agent/registration.json`, then run `docker compose up -d --build`.
Open `http://localhost:3000` to see the group's devices. Other devices show offline
until presence tracking is added. Rebuild after changing `.env.local`;
use `docker compose stop` from `ui/` to stop the UI.
