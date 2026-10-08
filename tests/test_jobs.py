"""Offline contract tests for ranking, discovery isolation and MCP transport."""
import copy
from datetime import date, timedelta
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import jobs
import jobs_mcp

TODAY = date(2026, 10, 8)


def listing(name="Example", age=2, location="Pune", **changes):
    result = {
        "company": name, "title": "Machine Learning Engineer",
        "url": f"https://careers.example.com/jobs/{name}", "job_id": name,
        "locations": [location], "remote_india_eligible": True,
        "location_evidence": f"Job detail page specifies {location}",
        "status": "active", "status_evidence": "Application form accepts submissions",
        "checked_on": TODAY.isoformat(), "posted_on": (TODAY - timedelta(days=age)).isoformat(),
        "date_evidence": "Original date on job detail", "valid_through": None,
        "min_years": 1, "max_years": 2, "experience_evidence": "Requires 1–2 years",
        "glassdoor_rating": 3.4, "glassdoor_url": "https://www.glassdoor.co.in/Overview/example",
        "ambitionbox_rating": 3.6, "ambitionbox_url": "https://www.ambitionbox.com/reviews/example",
        "company_notes": "",
    }
    result.update(changes)
    return result


class RankingTests(unittest.TestCase):
    def rank(self, *listings):
        # Fixtures use fixed windows; personal defaults are deliberately editable.
        return jobs.rank_jobs(list(listings), jobs.preferences(must_apply_days=7, should_apply_days=14, max_age_days=30), TODAY)

    def test_location_precedes_freshness(self):
        report = self.rank(listing("Mumbai", 0, "Mumbai"), listing("Pune", 10))
        self.assertEqual([j["company"] for j in report["tiers"]["Should apply"]], ["Pune", "Mumbai"])

    def test_thresholds_and_empty_tiers(self):
        report = self.rank(listing("seven", 7), listing("eight", 8), listing("fourteen", 14),
                           listing("fifteen", 15), listing("thirty", 30), listing("old", 31))
        self.assertEqual([len(report["tiers"][t]) for t in jobs.TIERS], [1, 2, 2])
        self.assertEqual(report["excluded"]["Outside freshness window"], 1)
        self.assertTrue(all(not x for x in self.rank()["tiers"].values()))

    def test_no_quota_or_padding(self):
        report = self.rank(*(listing(str(i)) for i in range(17)))
        self.assertEqual(len(report["tiers"]["Must apply"]), 17)
        self.assertEqual(len(report["tiers"]["Should apply"]), 0)

    def test_unknown_date_or_experience_is_stash(self):
        report = self.rank(listing("undated", posted_on=None, date_evidence=""),
                           listing("unstated", min_years=None, max_years=None, experience_evidence=""))
        self.assertEqual(len(report["tiers"][jobs.TIERS[2]]), 2)

    def test_rejections(self):
        cases = [dict(status="closed"), dict(status_evidence=""), dict(checked_on="2026-10-07"),
                 dict(valid_through="2026-10-07"), dict(min_years=3), dict(max_years=1),
                 dict(glassdoor_rating=None), dict(ambitionbox_rating=1),
                 dict(glassdoor_url="https://glassdoor.com.evil.test/company"),
                 dict(location="Delhi"), dict(title="Accountant"), dict(age=-1),
                 dict(min_years=True), dict(posted_on="bad date"), dict(date_evidence=""),
                 dict(location="Remote", remote_india_eligible=False)]
        for changes in cases:
            with self.subTest(changes=changes):
                report = self.rank(listing(**changes))
                self.assertEqual(sum(len(x) for x in report["tiers"].values()), 0)
                self.assertEqual(sum(report["excluded"].values()), 1)

    def test_remote_verified_and_rating_boundary(self):
        report = self.rank(listing(location="Remote"))
        self.assertEqual(len(report["tiers"]["Should apply"]), 1)
        self.assertEqual(report["tiers"]["Should apply"][0]["average_company_rating"], 3.5)

    def test_deduplicate_tracking_urls_and_requisition_ids(self):
        original = listing()
        tracked = listing(url=original["url"] + "?utm_source=board")
        crosspost = listing(url="https://board.example.com/job/123")
        distinct = listing(url="https://careers.example.com/jobs/another", job_id="another")
        report = self.rank(original, tracked, crosspost, distinct)
        self.assertEqual(len(report["tiers"]["Must apply"]), 2)
        self.assertEqual(report["excluded"]["Duplicate vacancy"], 2)

    def test_configuration_validation_and_custom_first_priority(self):
        for changes in (dict(locations={"bad": ["Pune"]}), dict(titles=[]),
                        dict(experience_years=float("nan")), dict(minimum_company_rating=6),
                        dict(max_age_days=5), dict(must_apply_days=True)):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                jobs.preferences(**changes)
        config = jobs.preferences(locations={"2": ["Mumbai"]})
        report = jobs.rank_jobs([listing(location="Mumbai")], config, TODAY)
        self.assertEqual(len(report["tiers"]["Must apply"]), 1)

    def test_inputs_not_mutated(self):
        item = listing()
        before = copy.deepcopy(item)
        self.rank(item)
        self.assertEqual(item, before)


class DiscoveryTests(unittest.TestCase):
    def test_provider_isolated_from_resume_and_recursive_mcp(self):
        response = subprocess.CompletedProcess([], 0, json.dumps({"jobs": [], "searches": ["ML Engineer Pune"], "warnings": []}), "")
        with patch("jobs.shutil.which", return_value="/bin/provider"), patch("jobs.subprocess.run", return_value=response) as call:
            for provider in ("codex", "claude"):
                jobs.discover(jobs.preferences(), provider, "test-model", "high", 60, TODAY)
                command = call.call_args.args[0]
                kwargs = call.call_args.kwargs
                self.assertNotEqual(Path(kwargs["cwd"]), Path(__file__).resolve().parents[1])
                self.assertEqual(kwargs["env"]["JOBS_DISABLE_SEARCH_TOOL"], "1")
                self.assertNotIn("resume/main.tex", kwargs["input"])
                self.assertIn("test-model", command)
                if provider == "codex":
                    self.assertIn("--search", command)
                    self.assertIn("features.shell_tool=false", command)
                    self.assertIn("--ignore-user-config", command)
                else:
                    self.assertIn("WebSearch,WebFetch", command)
                    self.assertIn("--strict-mcp-config", command)

    def test_malformed_provider_results_fail(self):
        for output in ("invented jobs", '{"jobs":[]}', '{"jobs":[],"searches":null,"warnings":[]}'):
            with self.subTest(output=output), patch("jobs.shutil.which", return_value="/bin/provider"), patch("jobs.subprocess.run", return_value=subprocess.CompletedProcess([], 0, output, "")), self.assertRaises(RuntimeError):
                jobs.discover(jobs.preferences(), "codex", None, None, 30, TODAY)


class MCPTests(unittest.TestCase):
    def call(self, name, arguments=None):
        return jobs_mcp.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": name, "arguments": arguments or {}}})

    def test_search_returns_text_and_structured_tiers(self):
        report = jobs.rank_jobs([listing()], jobs.preferences(), TODAY)
        with patch("jobs_mcp.run_search", return_value=report) as search:
            result = self.call("jobs_find_active", {"experience_years": 1.5})["result"]
            self.assertFalse(result["isError"])
            self.assertEqual(result["structuredContent"], report)
            self.assertIn("Must apply (1 jobs)", result["content"][0]["text"])
            self.assertEqual(search.call_args.kwargs["experience_years"], 1.5)

    def test_unknown_and_invalid_arguments(self):
        self.assertEqual(self.call("unknown")["error"]["code"], -32602)
        self.assertEqual(self.call("jobs_find_active", {"resume_path": "private.pdf"})["error"]["code"], -32602)
        with patch.dict("os.environ", {"JOBS_DISABLE_SEARCH_TOOL": "1"}):
            self.assertTrue(self.call("jobs_find_active")["result"]["isError"])

    def test_mcp_defaults_to_terra_xhigh(self):
        report = jobs.rank_jobs([], jobs.preferences(), TODAY)
        with patch.dict("os.environ", {}, clear=True), patch("jobs_mcp.run_search", return_value=report) as search:
            self.assertFalse(self.call("jobs_find_active")["result"]["isError"])
            self.assertEqual(search.call_args.kwargs["provider"], "codex")
            self.assertEqual(search.call_args.kwargs["model"], "gpt-5.6-terra")
            self.assertEqual(search.call_args.kwargs["effort"], "xhigh")
            self.assertEqual(self.call("jobs_find_active", {"model": "other-model"})["error"]["code"], -32602)

    def test_mcp_honors_make_configuration(self):
        report = jobs.rank_jobs([], jobs.preferences(), TODAY)
        config = {"JOBS_PROVIDER": "codex", "JOBS_MODEL": "custom-model", "JOBS_EFFORT": "high", "JOBS_TIMEOUT": "120"}
        with patch.dict("os.environ", config), patch("jobs_mcp.run_search", return_value=report) as search:
            self.assertFalse(self.call("jobs_find_active")["result"]["isError"])
            self.assertEqual(search.call_args.kwargs, {"provider": "codex", "model": "custom-model", "effort": "high", "timeout": 120})

    def test_stdio_protocol_cleanliness_and_recovery(self):
        requests = ['bad json', json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}),
                    json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-06-18"}}),
                    json.dumps({"jsonrpc": "2.0", "id": 2, "method": "tools/list"}),
                    json.dumps({"jsonrpc": "2.0", "id": 3, "method": "resources/read", "params": {"uri": "jobs://preferences"}})]
        completed = subprocess.run([sys.executable, str(Path(jobs_mcp.__file__))], input="\n".join(requests) + "\n", text=True, capture_output=True, check=True)
        responses = [json.loads(line) for line in completed.stdout.splitlines()]
        self.assertEqual(len(responses), 4)
        self.assertEqual(responses[0]["error"]["code"], -32700)
        self.assertEqual(responses[1]["result"]["protocolVersion"], "2025-06-18")
        self.assertEqual(len(responses[2]["result"]["tools"]), 3)
        self.assertIn("Pune", responses[3]["result"]["contents"][0]["text"])
        self.assertEqual(completed.stderr, "")


if __name__ == "__main__":
    unittest.main()
