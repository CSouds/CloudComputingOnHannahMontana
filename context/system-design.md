# Transfer queue design

Status: recommendation for discussion; no queue decisions accepted yet.

## Verified current state

- `docs/architecture.md` assigns UI requests to the local C++ agent and file streaming directly to peer agents. Spring Boot currently owns registration and group membership.
- `docs/ui-design.md`, lines 71–77, specifies one active transfer and ordered queued jobs, but leaves queue ownership and persistence open.
- `agent/src/main.cpp` currently implements registration only. The UI displays a mock transfer queue and completed history through service modules. No transfer worker or queue persistence is implemented.

## Proposed ownership and persistence

Give each initiating agent its own durable queue in a local SQLite database. A transfer row represents one file copy, with a stable UUID, source/destination device and share IDs, relative paths, queue position, state, byte counts, timestamps, attempt count, and last error. Keep queue pause state separately from each transfer's state.

The agent owns state transitions and starts at most one job at a time. The browser reads snapshots from the local agent and requests enqueue, reorder, pause, or cancellation. File contents still travel directly between participating agents.

Use the same transfer ID for command retries so a lost response does not create a second execution. Participating agents must recognize duplicate commands. Report destination-confirmed byte counts; mark success only after the destination finalizes the file. Keep finished rows for history.

After restart, reconcile previously running jobs with participating agents before retrying. Persisting progress alone does not implement resumable transfers. A simple initial implementation can mark interrupted jobs failed and require an explicit retry after reconciliation and partial-file cleanup.

## Open decision

Should queues be independent per initiating agent, or should every device see and control one group-wide queue? Per-agent ownership is the simpler initial recommendation and does not enforce group-wide serial execution. Group-wide ownership would require a shared coordinator and an updated control-plane contract.
