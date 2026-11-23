# Project overview and scope

Source: [File Transfer Across Network](sources/file-transfer-across-network.pdf), page 1; semester boundary also on pages 2 and 5.

## Project identity

- **Course:** CMP_SC 4530/7530 Cloud Computing, Fall 2026.
- **Instructor:** Alicia Esquivel Morel, PhD.
- **Team:** Connor Souders, Carson Mensink, Ashton Lafontaine, and Alexis Paten.
- **Source title:** File Transfer Across Network.
- **Application name in the proposal:** Cross-Device Remote Controller.

## Goal

Build a LAN-first app that lets one person wake their devices, check their status, and move files between them. Any device can act as the primary storage machine.

Moving files and powering on machines across a home or lab network currently requires juggling SSH, SMB shares, and vendor tools. This project puts these tasks behind one interface and makes the choice of storage device a setting instead of a fixed server.

A native C++ agent runs on each device, such as a MacBook, Windows desktop, or Linux NAS. A React web UI served from a Docker container talks to the agent on its own device. Agents discover peers and perform wake, status, and file operations.

The current design adds a Spring Boot backend and PostgreSQL for device registration
and group membership. **File transfers will be peer to peer between C++ agents;
file contents will not pass through the shared backend.** Registration is implemented;
the UI and peer-to-peer file transfers remain future work.

## Fall 2026 scope

The semester deliverable is a working LAN prototype in which a device can be registered, woken over the network, and used to share folders that anyone on the network can browse, upload to, and download from. The original proposal describes shared-token access control, pending instructor confirmation. Current registration uses invitations and per-device credentials; authentication for peer-to-peer operations remains to be implemented.

| Capability | Required behavior from the proposal |
| --- | --- |
| Register a device | Add a device to the program network so it appears in the app. |
| Wake-on-LAN | Wake a registered device from the app. |
| Online status | Once the device wakes and its C++ agent runs, change its status from offline to online in the UI and in every other peer's backend view. |
| Folder sharing | Choose which folders are shared, create new directories, and make sharing or unsharing very easy. |
| Browse and transfer | Navigate currently shared folders; upload files from the local device and download files to it without friction. |
| Storage choice | Allow any machine to hold shared files by configuring the primary storage choice (from the project description and the page 4 Storage Setup task). |

## Outside the semester scope

Remote access from outside the LAN is future work. Relay or VPN access is not part of the semester prototype; the UI retains a disabled placeholder.

## UI areas named in the source

The proposal names dashboard, device detail, Storage Setup, upload, and file-browser screens. Detailed layouts and interaction specifications are not supplied.
