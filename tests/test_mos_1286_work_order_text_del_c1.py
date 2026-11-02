from work_order_text import problem_description_error


def test_problem_description_rejects_del():
    assert problem_description_error("leak\x7ftap") == "Problem description contains control characters"


def test_problem_description_rejects_c1():
    assert problem_description_error("leak\x80tap") == "Problem description contains control characters"
    assert problem_description_error("leak\x9ftap") == "Problem description contains control characters"


def test_problem_description_accepts_clean_and_whitespace():
    assert problem_description_error("leaking tap") is None
    assert problem_description_error("line1\nline2\tnote") is None


def test_problem_description_still_rejects_c0():
    assert problem_description_error("leak\x00tap") == "Problem description contains control characters"
