import call_notifications


def test_extract_call_details_rejects_control_chars():
    result = call_notifications.extract_call_details("Caller: hi\x00", job_reference="JOB-1")
    assert result["gate_number"] == ""
    assert result["fault_or_request"] == ""


def test_extract_call_details_clean_transcript():
    result = call_notifications.extract_call_details("Caller: my gate number is 12", job_reference="JOB-1")
    assert result["gate_number"] == "12"
