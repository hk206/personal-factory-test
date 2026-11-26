"""Run in a disposable CI checkout. Keep head tests fixed and swap only src/."""
import json
import os
import re
from pathlib import Path
import subprocess
import sys
import tempfile


def verify(red, green, red_code, green_code):
    if red_code != 1 or green_code != 0 or red["status"] != "failed" or green["status"] != "passed":
        raise ValueError("期待する終了状態は修正前failed、修正後passedです")
    if red["errors"] or green["errors"] or not red["tests"] or red["tests"].keys() != green["tests"].keys():
        raise ValueError("テスト集合が空・不一致、または実行環境エラーです")
    for key, before in red["tests"].items():
        after = green["tests"][key]
        failed = [a["title"] for a in before["assertions"] if a["failed"]]
        passed = [a["title"] for a in after["assertions"] if not a["failed"]]
        if (before["expected"] != "passed" or after["expected"] != "passed" or
                before["status"] != "failed" or after["status"] != "passed" or
                not failed or not all(title in passed for title in failed)):
            raise ValueError("回帰判定内の同じアサーションで失敗→成功を確認できません")
    return len(red["tests"])


def git(*args):
    return subprocess.check_output(["git", *args], text=True).strip()


def execute(report, specs):
    cli = Path("node_modules/.bin/playwright").resolve()
    # Playwright path arguments are regexes. Match exactly the changed specs.
    patterns = [re.escape(path) + "$" for path in specs]
    result = subprocess.run([str(cli), "test", "--grep", "@regression\\b",
                             "--retries=0", "--repeat-each=1", "--workers=1",
                             "--reporter=./tests/regression-reporter.cjs", *patterns],
                            env={**os.environ, "REGRESSION_REPORT": str(report)})
    return json.loads(report.read_text()), result.returncode


def main(base):
    head = git("rev-parse", "HEAD")
    before = git("merge-base", base, head)
    specs = [p for p in git("diff", "--name-only", "--diff-filter=AM", before, head,
                             "--", "tests").splitlines() if ".spec." in p or ".test." in p]
    if not specs or not git("diff", "--name-only", before, head, "--", "src"):
        raise ValueError("srcと回帰テストの差分が必要です")
    if git("status", "--porcelain", "--", "src"):
        raise ValueError("srcに未保存の変更があります")
    with tempfile.TemporaryDirectory() as temp:
        try:
            git("restore", "--source=" + before, "--staged", "--worktree", "--", "src")
            red, red_code = execute(Path(temp) / "before.json", specs)
        finally:
            git("restore", "--source=" + head, "--staged", "--worktree", "--", "src")
        green, green_code = execute(Path(temp) / "after.json", specs)
        count = verify(red, green, red_code, green_code)
    labels = []
    for key in green["tests"]:
        ids = re.findall(r"\bAC[1-9]\d*\b", key)
        labels.append("/".join(dict.fromkeys(ids)) or "AC未指定")
    evidence = Path("playwright-report") / "regression-proof.json"
    evidence.parent.mkdir(exist_ok=True)
    evidence.write_text(json.dumps({"before": before, "after": head, "red": red, "green": green},
                                   indent=2, ensure_ascii=False))
    summary = f"{count}件 ({', '.join(labels)}) で修正前の失敗 ({before[:12]}) → 修正後の成功 ({head[:12]}) を確認"
    print(summary)
    if os.getenv("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as output:
            print("summary=" + summary, file=output)


if __name__ == "__main__":
    main(sys.argv[1])
