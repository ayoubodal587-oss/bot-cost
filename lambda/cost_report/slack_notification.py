import os
import requests
import json

def send_cost_report_to_slack(webhook_url, report):
    total_cost = report.get("total_cost", 0)
    details = report.get("details", [])
    mocked = report.get("mocked", True)

    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": "💸 AWS Cost Report"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Total Cost:* ${total_cost:.2f} USD"}},
        {"type": "divider"},
    ]

    for d in details:
        start = d["TimePeriod"]["Start"]
        end = d["TimePeriod"]["End"]
        amount = d["Total"]["BlendedCost"]["Amount"]
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"• {start} → {end}: *${amount}*"}
        })

    blocks.append({"type": "divider"})
    blocks.append({
        "type": "context",
        "elements": [{"type": "mrkdwn", "text": f"⚙️ Mode: {'Mock' if mocked else 'Real'}"}]
    })

    payload = {"blocks": blocks}

    r = requests.post(webhook_url, data=json.dumps(payload), headers={"Content-Type": "application/json"})
    if r.status_code != 200:
        raise Exception(f"Slack webhook failed: {r.text}")
