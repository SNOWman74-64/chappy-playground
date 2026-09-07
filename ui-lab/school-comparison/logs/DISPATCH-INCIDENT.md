# Dispatch correction

Parent initially invoked the high filter repair with the medium session ID by mistake. The process was interrupted after a read-only search of the high folder; no completed file_change event was recorded in that invocation. This misdispatch used high effort but carried medium history, so it is not a valid high benchmark repair and is excluded from benchmark usage. Its raw events are preserved locally as school-luna-high-misdispatch-events.jsonl. No completed turn usage was emitted, so consumed tokens for this aborted attempt are unknown; do not treat them as zero. The same repair is relaunched against the correct high session 01a07c22-7ddb-77d1-bd75-4188af1d3d19.

This parent orchestration incident affects the medium session's final turn_context metadata. Requested/observed effort for benchmark runs must use their initial context plus stage-specific usage, not the last context of the contaminated session. The standalone run is unaffected.
