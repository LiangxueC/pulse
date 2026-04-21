import json
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

_CASES_PATH = Path(__file__).parent.parent / "data" / "archivedCases.json"


def _load_cases() -> list:
    if not _CASES_PATH.exists():
        mock_path = Path(__file__).parent.parent / "data" / "mockData.json"
        with open(mock_path) as f:
            data = json.load(f)
        cases = data.get("archivedCases", [])
        _save_cases(cases)
        return cases
    with open(_CASES_PATH) as f:
        return json.load(f)


def _save_cases(cases: list):
    with open(_CASES_PATH, "w") as f:
        json.dump(cases, f, indent=2)


@router.get("/")
def list_cases(search: str = ""):
    cases = _load_cases()
    if search:
        cases = [c for c in cases if search.lower() in c["label"].lower()]
    return {"items": cases}


class DeleteRequest(BaseModel):
    ids: list[str]


# ── /bulk MUST be before /{case_id} ──
@router.delete("/bulk")
def delete_cases(body: DeleteRequest):
    if not body.ids:
        return {"success": False, "message": "No IDs provided"}
    cases = _load_cases()
    before = len(cases)
    cases = [c for c in cases if c["id"] not in body.ids]
    _save_cases(cases)
    return {
        "success": True,
        "deletedCount": before - len(cases),
        "remaining": cases,
    }


@router.delete("/{case_id}")
def delete_case(case_id: str):
    cases = _load_cases()
    before = len(cases)
    cases = [c for c in cases if c["id"] != case_id]
    if len(cases) == before:
        return {"success": False, "message": "Case not found"}
    _save_cases(cases)
    return {"success": True, "remaining": cases}


@router.post("/")
def add_case(body: dict):
    label = body.get("label", "").strip()
    if not label:
        return {"success": False, "message": "Missing required field: label"}
    cases = _load_cases()
    new_case = {
        "id": f"case{len(cases) + 1}",
        "date": body.get("date", ""),
        "label": label,
    }
    cases.insert(0, new_case)
    _save_cases(cases)
    return {"success": True, "case": new_case}