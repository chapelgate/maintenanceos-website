import commercial_release_controls as crc


def test_retention_class_known_rejects_del_and_c1():
    assert crc.retention_class_known("work_order_closed\x7f") is False
    assert crc.retention_class_known("work_order_closed\x80") is False
    assert crc.retention_class_known("work_order_closed\x9f") is False
    assert crc.retention_class_known("\x7fwork_order_closed") is False


def test_retention_class_known_rejects_c0():
    assert crc.retention_class_known("work_order_closed\x00") is False
    assert crc.retention_class_known("work\x01order_closed") is False


def test_retention_class_known_accepts_clean():
    assert crc.retention_class_known("work_order_closed") is True
    assert crc.retention_class_known("backup_copy") is True
    assert crc.retention_class_known("not_a_real_class") is False
