# generate_mock_costs.py
import json
import random
import datetime
from collections import defaultdict

def random_amount(base=5.0, volatility=0.5):
    # base is avg daily cost for a service; volatility fraction
    return round(max(0.01, random.normalvariate(base, base*volatility)), 2)

def make_day_entry(day: datetime.date, services, accounts):
    details = []
    total = 0.0
    for service, base in services.items():
        # per-account split
        per_service_total = 0.0
        for acct in accounts:
            amt = random_amount(base=base * random.uniform(0.6, 1.6), volatility=0.6)
            per_service_total += amt
            details.append({
                "TimePeriod": { "Start": day.isoformat(), "End": (day + datetime.timedelta(days=1)).isoformat() },
                "Account": acct,
                "Service": service,
                "Total": { "BlendedCost": { "Amount": f"{amt:.2f}", "Unit": "USD" } }
            })
        total += per_service_total
    return round(total, 2), details

def build_dataset(days=365, start_date=None, services=None, accounts=None):
    if start_date is None:
        start_date = datetime.date.today() - datetime.timedelta(days=days)
    if services is None:
        services = {
            "AmazonEC2": 4.5,
            "AmazonS3": 0.7,
            "AmazonRDS": 2.0,
            "AWSLambda": 0.3,
            "AmazonEKS": 1.5,
            "AmazonCloudFront": 0.4,
            "Other": 0.2
        }
    if accounts is None:
        accounts = ["account-A", "account-B", "account-C"]
    dataset = {"mocked": True, "generated_on": datetime.date.today().isoformat(), "ResultsByTime": []}
    for i in range(days):
        day = start_date + datetime.timedelta(days=i)
        total, details = make_day_entry(day, services, accounts)
        dataset["ResultsByTime"].append({
            "TimePeriod": {"Start": day.isoformat(), "End": (day + datetime.timedelta(days=1)).isoformat()},
            "Total": {"BlendedCost": {"Amount": f"{total:.2f}", "Unit": "USD"}},
            "Details": details
        })
    # global totals
    dataset["total_days"] = days
    return dataset

if __name__ == "__main__":
    ds = build_dataset(days=730)  # 2 years
    with open("mock_costs_large.json", "w") as f:
        json.dump(ds, f, indent=2)
    print("Written mock_costs_large.json (2 years of daily data).")
