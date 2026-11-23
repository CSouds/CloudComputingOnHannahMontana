# Project documentation

This documentation converts **File Transfer Across Network** into a working reference for the Fall 2026 project. It describes the source proposal, not a claim that the features have been implemented.

The [current backend decision](architecture.md#current-decision-shared-registration-backend), confirmed November 23, 2026, adds a shared Java/Spring Boot registration service in `backend/`. Device agents remain C++. This decision supplements the original proposal and does not indicate completed implementation.

## Start here

- [Project overview and scope](project-overview.md): goals, team, required user capabilities, and exclusions.
- [Architecture and API planning](architecture.md): component responsibilities, proposed tools, recorded decisions, and unresolved contracts.
- [Implementation plan](implementation-plan.md): ordered tasks, deadlines, and deliverables.
- [Evaluation plan](evaluation-plan.md): experiments, measurements, and required evidence.
- [Original PDF](sources/file-transfer-across-network.pdf): authoritative source for this conversion.

## How to use these docs

The PDF is the baseline project proposal. Page references in each document point to that five-page source. Proposed choices and open questions remain labeled; do not treat them as settled implementation contracts. Checkboxes are intentionally unchecked because the PDF does not establish completion.

The PDF's page 5 “GitHub repository” entry links to the repository below, which is also this checkout's `origin`:

[CSouds/CloudComputingOnHannahMontana](https://github.com/CSouds/CloudComputingOnHannahMontana)

As implementation proceeds, record confirmed decisions and actual behavior explicitly rather than silently changing the historical proposal. Additional planning questions in these docs are identified as conversion notes, not requirements added by the PDF.
