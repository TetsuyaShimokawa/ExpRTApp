import random
import string

# ── Risk task ──────────────────────────────────────────────────────────────────
PROB_LEVELS = [
    0.01, 0.02, 0.03, 0.05, 0.07, 0.10, 0.15, 0.20, 0.25, 0.30,
    0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80,
    0.85, 0.90, 0.92, 0.93, 0.95, 0.97, 0.98, 0.99,
]
SAFE_AMOUNTS = [50 * i for i in range(1, 21)]   # ¥50 → ¥1,000
RISK_PRIZE = 1000

# ── Time task ─────────────────────────────────────────────────────────────────
EXCHANGE_RATES = [
    1.01, 1.02, 1.03, 1.05, 1.07, 1.10, 1.13, 1.17, 1.20, 1.25,
    1.30, 1.35, 1.40, 1.45, 1.50, 1.55, 1.60, 1.70, 1.80, 1.90,
    2.00, 2.20, 2.50, 3.00, 3.50, 4.00, 5.00, 7.00,
]
TODAY_AMOUNTS = [50 * i for i in range(1, 21)]  # ¥50 → ¥1,000
TIME_STAKE = 1000

DELAYS = {
    "1week":   "1週間後",
    "1month":  "1ヶ月後",
    "3months": "3ヶ月後",
}

# ── Cognitive load ─────────────────────────────────────────────────────────────
LOAD_BLOCKS = 14          # first or last 14 blocks of each task have load
DIGIT_CHANGE_EVERY = 3    # new 7-digit string every N load-blocks


def _make_digit_string() -> str:
    first = random.choice("123456789")
    rest = "".join(random.choices(string.digits, k=6))
    return first + rest


def generate_digit_strings(load_order: str, total_blocks: int = 28) -> list[str]:
    """Return a list of length total_blocks.
    Load blocks get a 7-digit string; no-load blocks get ''.
    load_order: 'LOAD_FIRST' → blocks 0..13 have load
                'LOAD_SECOND' → blocks 14..27 have load
    """
    n_load = LOAD_BLOCKS
    load_indices = (
        range(0, n_load) if load_order == "LOAD_FIRST"
        else range(total_blocks - n_load, total_blocks)
    )
    load_set = set(load_indices)

    # Pre-generate enough digit strings (one per DIGIT_CHANGE_EVERY load blocks)
    n_unique = (n_load + DIGIT_CHANGE_EVERY - 1) // DIGIT_CHANGE_EVERY
    unique_digits = [_make_digit_string() for _ in range(n_unique)]

    result = []
    load_pos = 0  # position within load blocks
    for i in range(total_blocks):
        if i in load_set:
            digit_idx = load_pos // DIGIT_CHANGE_EVERY
            result.append(unique_digits[digit_idx])
            load_pos += 1
        else:
            result.append("")
    return result


def generate_risk_trials() -> list[dict]:
    """28 probability levels × 20 safe amounts = 28 blocks.
    Block order randomised; within each block rows are ¥50→¥1,000 ascending.
    """
    probs = PROB_LEVELS.copy()
    random.shuffle(probs)
    trials = []
    for block_idx, prob in enumerate(probs):
        for row_idx, safe_amount in enumerate(SAFE_AMOUNTS):
            trials.append({
                "block": block_idx + 1,
                "prob": prob,
                "prob_pct": round(prob * 100, 2),
                "row": row_idx + 1,
                "safe_amount": safe_amount,
                "prize": RISK_PRIZE,
            })
    return trials


def generate_time_trials(delay_condition: str) -> list[dict]:
    """28 exchange rates × 20 today-amounts = 28 blocks.
    Block order randomised; within each block rows are ¥50→¥1,000 ascending.
    """
    rates = EXCHANGE_RATES.copy()
    random.shuffle(rates)
    delay_label = DELAYS[delay_condition]
    trials = []
    for block_idx, rate in enumerate(rates):
        future_amount = round(TIME_STAKE * rate)
        for row_idx, today_amount in enumerate(TODAY_AMOUNTS):
            trials.append({
                "block": block_idx + 1,
                "exchange_rate": rate,
                "future_amount": future_amount,
                "row": row_idx + 1,
                "today_amount": today_amount,
                "delay_condition": delay_condition,
                "delay_label": delay_label,
            })
    return trials
