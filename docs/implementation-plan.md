# Implementation plan

Source: [File Transfer Across Network](sources/file-transfer-across-network.pdf), pages 3–5.

## Current addition: registration backend

Confirmed November 23, 2026: use Java with Spring Boot for the shared registration backend in `backend/`; keep device agents in C++. The folder is initially empty, with no application scaffold or dependencies added.

- [ ] Define device identity, group membership, authorized enrollment, returning-device authentication, and revocation contracts.
- [ ] Select persistent database storage and implement registration that survives restarts.
- [ ] Connect the C++ agent to the backend over HTTPS with JSON.
- [ ] Select hosting and deploy the service when registration across different networks is needed.

Presence tracking follows registration. Remote agent connectivity and file relaying are not introduced by this backend decision. See the [architecture decision](architecture.md#current-decision-shared-registration-backend). The original schedule below is preserved; these additions have not been assigned deadlines.

## Delivery order

Start with a thin end-to-end slice: UI → local agent → status reply. Then add features one at a time. The tasks below preserve the proposal's ordering and are unchecked because the source does not record completion.

## Setup: November 16–30, 2026

- [ ] Create the GitHub repository with `agent/` (C++), `ui/` (React), and `docs/`; add its link to the proposal itself (“this doc” in the source).
- [ ] Define the REST API contract for `GET /ping`, `GET /status`, `POST /wake`, `GET /peers`, `GET /files`, `POST /upload`, and `GET /download`.

The PDF already includes the repository link on page 5; it is also available in the [documentation index](README.md). Checkboxes retain the source task list rather than certify completion of the setup phase.

## Core build: November 30–December 7, 2026

- [ ] Implement peer discovery with UDP beacons and manual add-by-IP.
- [ ] Implement the Wake-on-LAN endpoint and dashboard Wake button.
- [ ] Collect real CPU, memory, and disk health data on Linux, macOS, and Windows.
- [ ] Build Storage Setup: list disks and mounts and save the chosen primary storage path.
- [ ] Implement upload and download endpoints with streaming file I/O.
- [ ] Connect UI screens to the live agent API.

The source's scope also requires registration, sharing/unsharing folders, creating directories, browsing shared folders, and propagating online status to peers. These remain requirements even though the core-build checklist does not give each one a separate task. See [scope](project-overview.md) and the [API planning gaps](architecture.md#open-decisions-before-implementation).

## Test and document: December 7–11, 2026

- [ ] Run the [evaluation experiments](evaluation-plan.md) and save raw results.
- [ ] Write deployment instructions and a README.
- [ ] Capture screenshots and draft technical-report sections.

## Milestones

| Milestone | Date or period |
| --- | --- |
| Source proposal due | November 20, 2026, at 11:59 PM; timezone not specified in the PDF. |
| Thanksgiving break | November 21–29, 2026; no required work, optional buffer only. |
| Progress check-in | December 4, 2026. |
| Final project review | December 11, 2026. |
| Technical report submission | Finals week; exact deadline not specified in the PDF. |

The setup date range overlaps Thanksgiving break; the proposal explicitly treats work during the break as optional.
