import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import APIRouter
from pydantic import BaseModel
from db import get_session
from models import ArchivedCase, Company

router = APIRouter()


def _case_to_dict(row: ArchivedCase) -> dict:
    return {"id": f"case{row.id}", "date": row.date, "label": row.label}


def _get_company_id(session) -> str:
    company = session.query(Company).first()
    return company.id if company else "unknown"


@router.get("/")
def list_cases(search: str = ""):
    with get_session() as session:
        query = session.query(ArchivedCase).order_by(ArchivedCase.id.desc())
        if search:
            query = query.filter(ArchivedCase.label.ilike(f"%{search}%"))
        rows = query.all()
        return {"items": [_case_to_dict(r) for r in rows]}


class DeleteRequest(BaseModel):
    ids: list[str]


@router.delete("/bulk")
def delete_cases(body: DeleteRequest):
    if not body.ids:
        return {"success": False, "message": "No IDs provided"}
    int_ids = []
    for cid in body.ids:
        try:
            int_ids.append(int(cid.replace("case", "")))
        except ValueError:
            pass
    with get_session() as session:
        deleted = (
            session.query(ArchivedCase)
            .filter(ArchivedCase.id.in_(int_ids))
            .delete(synchronize_session=False)
        )
        remaining = session.query(ArchivedCase).order_by(ArchivedCase.id.desc()).all()
        return {
            "success": True,
            "deletedCount": deleted,
            "remaining": [_case_to_dict(r) for r in remaining],
        }


@router.delete("/{case_id}")
def delete_case(case_id: str):
    try:
        int_id = int(case_id.replace("case", ""))
    except ValueError:
        return {"success": False, "message": "Invalid case ID"}
    with get_session() as session:
        row = session.query(ArchivedCase).filter_by(id=int_id).first()
        if not row:
            return {"success": False, "message": "Case not found"}
        session.delete(row)
        remaining = session.query(ArchivedCase).order_by(ArchivedCase.id.desc()).all()
        return {"success": True, "remaining": [_case_to_dict(r) for r in remaining]}


@router.post("/")
def add_case(body: dict):
    label = body.get("label", "").strip()
    if not label:
        return {"success": False, "message": "Missing required field: label"}
    with get_session() as session:
        company_id = _get_company_id(session)
        new_case = ArchivedCase(
            company_id=company_id,
            date=body.get("date", ""),
            label=label,
        )
        session.add(new_case)
        session.flush()
        return {"success": True, "case": _case_to_dict(new_case)}
