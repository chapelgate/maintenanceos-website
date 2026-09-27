import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).with_name("remove-onboarding-scan-service.py")
SPEC = importlib.util.spec_from_file_location("retire", PATH)
retire = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(retire)


class UpdatedSpecTests(unittest.TestCase):
    def base(self):
        return {
            "name": "seahorse-app",
            "static_sites": [{"name": "website"}],
            "services": [{"name": "onboarding-scan"}, {"name": "keep-me"}],
            "ingress": {
                "rules": [
                    {"match": {"path": {"prefix": "/"}}, "component": {"name": "website"}},
                    {"match": {"path": {"prefix": "/onboarding-scan"}}, "component": {"name": "onboarding-scan"}},
                ]
            },
        }

    def test_removes_only_target_service_and_route(self):
        original = self.base()
        changed = retire.updated_spec(original)
        self.assertEqual([x["name"] for x in changed["static_sites"]], ["website"])
        self.assertEqual([x["name"] for x in changed["services"]], ["keep-me"])
        self.assertEqual([x["component"]["name"] for x in changed["ingress"]["rules"]], ["website"])
        self.assertEqual(len(original["services"]), 2)

    def test_refuses_without_static_site(self):
        spec = self.base()
        spec["static_sites"] = []
        with self.assertRaises(retire.GuardError):
            retire.updated_spec(spec)

    def test_refuses_without_exactly_one_target(self):
        spec = self.base()
        spec["services"] = []
        with self.assertRaises(retire.GuardError):
            retire.updated_spec(spec)

        spec = self.base()
        spec["services"].append({"name": "onboarding-scan"})
        with self.assertRaises(retire.GuardError):
            retire.updated_spec(spec)


if __name__ == "__main__":
    unittest.main()
