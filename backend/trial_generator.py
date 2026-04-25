import random
import string

# ── Risk task ──────────────────────────────────────────────────────────────────
# Three prize levels; same 9 probability levels appear under each prize.
RISK_PRIZES = [500, 1000, 2000]
RISK_PROB_LEVELS = [0.01, 0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95, 0.99]

# Safe amounts scale with prize so the MPL always spans 5%–100% of the prize.
SAFE_AMOUNTS_BY_PRIZE = {
    500:  [25  * i for i in range(1, 21)],   # ¥25 – ¥500
    1000: [50  * i for i in range(1, 21)],   # ¥50 – ¥1,000
    2000: [100 * i for i in range(1, 21)],   # ¥100 – ¥2,000
}

# ── Time task ─────────────────────────────────────────────────────────────────
# Three delay conditions, all within-subject.
# Exchange rates are calibrated per delay to be empirically plausible
# (monthly δ ≈ 0.93–0.99, present-bias β ≈ 0.7–0.95).
DELAYS = {
    "1week":   "1週間後",
    "1month":  "1ヶ月後",
    "3months": "3ヶ月後",
}

TIME_RATES_BY_DELAY = {
    "1week":   [1.01, 1.02, 1.03, 1.05, 1.08, 1.12, 1.17, 1.23, 1.30],
    "1month":  [1.01, 1.03, 1.05, 1.08, 1.12, 1.17, 1.25, 1.35, 1.50],
    "3months": [1.02, 1.05, 1.10, 1.20, 1.35, 1.50, 1.75, 2.00, 2.50],
}

TODAY_AMOUNTS = [50 * i for i in range(1, 21)]   # ¥50 – ¥1,000
TIME_STAKE    = 1000

# ── Cognitive load ─────────────────────────────────────────────────────────────
TOTAL_BLOCKS       = 27           # 3 × 9 combinations per task
LOAD_BLOCKS        = 14           # first or last 14 blocks of each task have load
DIGIT_CHANGE_EVERY = 3            # new 7-digit string every N load-blocks


def _make_digit_string() -> str:
    first = random.choice("123456789")
    rest  = "".join(random.choices(string.digits, k=6))
    return first + rest


def generate_digit_strings(load_order: str) -> list[str]:
    """Return a list of length TOTAL_BLOCKS.
    Load blocks get a 7-digit string; no-load blocks get ''.
    load_order: 'LOAD_FIRST'  → blocks 0..13 have load
                'LOAD_SECOND' → blocks 13..26 have load
    """
    n_load = LOAD_BLOCKS
    load_indices = (
        range(0, n_load)
        if load_order == "LOAD_FIRST"
        else range(TOTAL_BLOCKS - n_load, TOTAL_BLOCKS)
    )
    load_set = set(load_indices)

    n_unique    = (n_load + DIGIT_CHANGE_EVERY - 1) // DIGIT_CHANGE_EVERY
    unique_digits = [_make_digit_string() for _ in range(n_unique)]

    result   = []
    load_pos = 0
    for i in range(TOTAL_BLOCKS):
        if i in load_set:
            result.append(unique_digits[load_pos // DIGIT_CHANGE_EVERY])
            load_pos += 1
        else:
            result.append("")
    return result


def generate_risk_trials() -> list[dict]:
    """3 prize levels × 9 probability levels = 27 blocks.
    Block order randomised; within each block safe amounts scale with prize.
    """
    combinations = [
        (prize, prob)
        for prize in RISK_PRIZES
        for prob in RISK_PROB_LEVELS
    ]
    random.shuffle(combinations)
    trials = []
    for block_idx, (prize, prob) in enumerate(combinations):
        for row_idx, safe_amount in enumerate(SAFE_AMOUNTS_BY_PRIZE[prize]):
            trials.append({
                "block":      block_idx + 1,
                "prize":      prize,
                "prob":       prob,
                "prob_pct":   round(prob * 100, 2),
                "row":        row_idx + 1,
                "safe_amount": safe_amount,
            })
    return trials


def generate_time_trials() -> list[dict]:
    """3 delay conditions × 9 exchange rates = 27 blocks (all within-subject).
    Block order randomised; today-amounts fixed at ¥50–¥1,000 across all delays.
    """
    combinations = [
        (delay_cond, rate)
        for delay_cond, rates in TIME_RATES_BY_DELAY.items()
        for rate in rates
    ]
    random.shuffle(combinations)
    trials = []
    for block_idx, (delay_cond, rate) in enumerate(combinations):
        future_amount = round(TIME_STAKE * rate)
        for row_idx, today_amount in enumerate(TODAY_AMOUNTS):
            trials.append({
                "block":          block_idx + 1,
                "delay_condition": delay_cond,
                "delay_label":    DELAYS[delay_cond],
                "exchange_rate":  rate,
                "future_amount":  future_amount,
                "row":            row_idx + 1,
                "today_amount":   today_amount,
            })
    return trials
