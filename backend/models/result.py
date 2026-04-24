from pydantic import BaseModel


class RiskRowResult(BaseModel):
    session_id: str
    participant_id: str
    prior_info: str       # "NONE" | "INFO"
    task_order: str       # "RISK_FIRST" | "TIME_FIRST"
    load_order: str       # "LOAD_FIRST" | "LOAD_SECOND"
    block: int
    prob: float
    safe_amount: int
    prize: int
    row: int
    has_load: bool
    choice: str           # "A" (safe) | "B" (lottery)
    response_time_ms: int


class TimeRowResult(BaseModel):
    session_id: str
    participant_id: str
    prior_info: str
    task_order: str
    load_order: str
    delay_condition: str
    block: int
    exchange_rate: float
    future_amount: int
    today_amount: int
    row: int
    has_load: bool
    choice: str           # "A" (today) | "B" (future)
    response_time_ms: int
