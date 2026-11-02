import call_notifications as cn


def test_helper_rejects_del_and_c1():
    assert cn._has_control_chars("clean") is False
    assert cn._has_control_chars("a" + chr(0x7F)) is True
    assert cn._has_control_chars("a" + chr(0x80)) is True
    assert cn._has_control_chars("a" + chr(0x9F)) is True
    assert cn._has_control_chars("a" + chr(0)) is True


def test_extract_call_details_rejects_del_and_c1_in_transcript():
    empty = {"gate_number": "", "area": "", "name": "", "callback": "", "address": "", "postcode": "", "fault_or_request": "", "sent": False}
    assert cn.extract_call_details("transcript" + chr(0x7F), job_reference="J1") == empty
    assert cn.extract_call_details("transcript" + chr(0x80), job_reference="J1") == empty
    assert cn.extract_call_details("transcript" + chr(0x9F), job_reference="J1") == empty
