import csv
import io
import random
import uuid
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models.session import SessionStartRequest
from models.result import RiskRowResult, TimeRowResult
from trial_generator import (
    DELAYS, PROB_LEVELS, EXCHANGE_RATES,
    generate_risk_trials, generate_time_trials, generate_digit_strings,
)

app = FastAPI(title="ExpRTApp API — Risk × Time Discounting 2×2 RCT")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://exprtapp-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: dict[str, dict[str, Any]] = {}
risk_results: list[dict[str, Any]] = []
time_results: list[dict[str, Any]] = []

PRIOR_INFO_CONDITIONS = ["NONE", "INFO"]
TASK_ORDERS = ["RISK_FIRST", "TIME_FIRST"]
LOAD_ORDERS = ["LOAD_FIRST", "LOAD_SECOND"]


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/session/start")
def start_session(req: SessionStartRequest):
    if not req.participant_id.strip() or not req.name.strip():
        raise HTTPException(status_code=400, detail="participant_id と name は必須です")

    session_id = str(uuid.uuid4())

    # 3 between-subjects random assignments
    prior_info = random.choice(PRIOR_INFO_CONDITIONS)
    task_order = random.choice(TASK_ORDERS)
    load_order = random.choice(LOAD_ORDERS)
    delay_condition = random.choice(list(DELAYS.keys()))

    risk_trials = generate_risk_trials()
    time_trials = generate_time_trials(delay_condition)

    # Digit strings: one list per task (28 entries each)
    risk_digit_strings = generate_digit_strings(load_order)
    time_digit_strings = generate_digit_strings(load_order)

    sessions[session_id] = {
        "participant_id": req.participant_id.strip(),
        "name": req.name.strip(),
        "prior_info": prior_info,
        "task_order": task_order,
        "load_order": load_order,
        "delay_condition": delay_condition,
        "delay_label": DELAYS[delay_condition],
        "created_at": datetime.now().isoformat(),
    }

    return {
        "session_id": session_id,
        "prior_info": prior_info,
        "task_order": task_order,
        "load_order": load_order,
        "delay_condition": delay_condition,
        "delay_label": DELAYS[delay_condition],
        "prob_levels": PROB_LEVELS,
        "exchange_rates": EXCHANGE_RATES,
        "risk_trials": risk_trials,
        "time_trials": time_trials,
        "risk_digit_strings": risk_digit_strings,
        "time_digit_strings": time_digit_strings,
    }


@app.post("/api/results/risk")
def save_risk_result(result: RiskRowResult):
    if result.session_id not in sessions:
        raise HTTPException(status_code=404, detail="セッションが見つかりません")
    record = result.model_dump()
    record["name"] = sessions[result.session_id].get("name", "")
    record["timestamp"] = datetime.now().isoformat()
    risk_results.append(record)
    return {"status": "ok"}


@app.post("/api/results/time")
def save_time_result(result: TimeRowResult):
    if result.session_id not in sessions:
        raise HTTPException(status_code=404, detail="セッションが見つかりません")
    record = result.model_dump()
    record["name"] = sessions[result.session_id].get("name", "")
    record["timestamp"] = datetime.now().isoformat()
    time_results.append(record)
    return {"status": "ok"}


RISK_CSV_COLUMNS = [
    "participant_id", "name", "prior_info", "task_order", "load_order",
    "block", "prob", "safe_amount", "prize", "row", "has_load", "choice",
    "response_time_ms", "timestamp",
]

TIME_CSV_COLUMNS = [
    "participant_id", "name", "prior_info", "task_order", "load_order",
    "delay_condition", "block", "exchange_rate", "future_amount",
    "today_amount", "row", "has_load", "choice", "response_time_ms", "timestamp",
]


@app.get("/api/results/risk/csv")
def download_risk_csv():
    if not risk_results:
        raise HTTPException(status_code=404, detail="リスク課題の結果がまだありません")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=RISK_CSV_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for r in risk_results:
        writer.writerow({col: r.get(col, "") for col in RISK_CSV_COLUMNS})
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="ExpRT_risk_{ts}.csv"'},
    )


@app.get("/api/results/time/csv")
def download_time_csv():
    if not time_results:
        raise HTTPException(status_code=404, detail="時間割引課題の結果がまだありません")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=TIME_CSV_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for r in time_results:
        writer.writerow({col: r.get(col, "") for col in TIME_CSV_COLUMNS})
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="ExpRT_time_{ts}.csv"'},
    )
