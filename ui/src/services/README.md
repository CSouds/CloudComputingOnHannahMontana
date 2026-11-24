# UI services

Components import from public service modules such as `devices.ts` and `transfers.ts`. Components must not import from `mock/` or load fixtures directly.

## Current calls

| Call | Result | Implementation |
| --- | --- | --- |
| `getDevices(signal?)` | Group devices and current device ID | Existing backend HTTP request |
| `getOnlineDeviceIds(signal?)` | Reachable device IDs | Mock: empty until presence exists |
| `getQueue(signal?)` | Ordered `QueuedTransfer[]` snapshot | Mock: 32 fixture items initially |
| `getRecentTransfers(signal?)` | Completed transfers, newest first | Mock: `RecentTransfers.json` |
| `changeQueueOrder(id, targetId)` | Updated queue snapshot | Mock: move the item to the target's previous index |
| `startQueuedTransfer(id)` | Updated queue snapshot | Mock: activate the chosen item; return the previous active job to the front |
| `cancelQueuedTransfer(id)` | Updated queue snapshot | Mock: remove by ID; repeated cancellation succeeds |

Queue and history calls return promises and reject with `Error` on failure. Read calls accept an optional abort signal. `getActiveTransfer()` returns a stable active-job snapshot; `subscribeActiveTransfer(listener)` returns an unsubscribe function for active-job updates. Queue array order determines displayed positions. Mutations return the authoritative updated snapshot, so components do not simulate service state.

Mock queue changes survive component remounts but reset on page reload. Returned snapshots are detached from the mock store. The mock does not transfer files or persist to disk.

To preview Home's idle states, set `mock/Queue.json` to `[]` and reload. The three completed fixtures then appear under Recent transfers. Also set `mock/RecentTransfers.json` to `[]` to preview the compact first-use prompt linking to Files. Canceled queue items never become completed history.

## Switching to the agent

Replace implementations in the public service modules with HTTP calls, preserving these function signatures and return shapes. Adapt the agent's response to the UI types inside the service when necessary. Replace the presence re-export in `devices.ts` as well, then delete the unused `mock/` directory. React components keep their imports and handlers.

Files, sharing, settings, and actual file transport are still unimplemented. Add their service contracts when their UI behavior is built rather than inventing unused API calls now.

Queue overflow actions include Show source in Files and Remove from queue. The first navigates to `/files?device=…&file=…`, preserving the source device and filename; Files currently displays that context but cannot browse or resolve the containing folder. Transfer records need stable source device IDs and source paths when the real file service is implemented. Remove from queue calls `cancelQueuedTransfer` and never deletes the source file.
