# Evaluation plan

Source: [File Transfer Across Network](sources/file-transfer-across-network.pdf), pages 4–5.

Judge the project by measured behavior on real devices, not feature count. Each experiment must produce a table, screenshot, or log for the final report. Save raw results during the December 7–11 test-and-document phase.

For the current architecture, measure file throughput directly between C++ agents.
Use packet captures to confirm that file contents travel peer to peer rather than
through the Spring Boot registration backend.

## Experiments

| Experiment | What to measure | Required evidence from the source |
| --- | --- | --- |
| Functional test | Every API endpoint and UI screen works end to end on at least two machines. | Test checklist and screenshots. |
| Discovery time | Seconds from agent start until the peer appears in the dashboard; repeat 10 times. | Table of times. |
| Wake-on-LAN | Success rate when waking a sleeping device and time until it reports online. | Wireshark capture and results table. |
| Transfer throughput | Upload and download speed for 1 MB, 100 MB, and 1 GB files, compared with an `iperf3` baseline. | Chart in the technical report. |
| Agent overhead | Agent CPU and memory while idle and during a transfer. | `top` or `ps` output. |
| Failure cases | Behavior when a peer goes offline mid-transfer or primary storage is full. | Logged observations. |

## Measurement tools

- `iperf3`: raw network throughput baseline.
- `curl`: timing measurements.
- Wireshark: packet inspection, including Wake-on-LAN magic packets.
- `top` or `ps`: CPU and memory evidence.

The architecture proposal permits AWS EC2 or a Docker network for repeatable multi-agent tests, pending instructor confirmation. The evaluation plan still explicitly calls for measured behavior on real devices and functional coverage on at least two machines.

## Details still to define

Conversion notes: the PDF does not define the following experiment details. Decide and record them before gathering results so the report can explain the measurements consistently.

- Trial count for experiments other than discovery, whose count is explicitly 10.
- Hardware, operating systems, network conditions, and whether each run uses physical or virtual machines.
- Exact start/end events for wake timing and transfer timing.
- File-size convention (decimal MB/GB or binary MiB/GiB), timing units, and throughput units.
- Numeric pass/fail targets for latency, throughput, overhead, and wake success rate; none are given in the PDF.
- Where raw logs, captures, screenshots, and result tables will be stored.

Do not substitute an unmeasured result or an invented performance target for the required evidence.
