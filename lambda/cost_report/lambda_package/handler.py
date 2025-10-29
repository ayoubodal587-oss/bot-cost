import os
import json
import requests

def lambda_handler(event, context):
    # Load mock data
    with open("mock_data.json", "r") as f:
        data = json.load(f)

    total_cost = data["total_cost"]
    details = data["details"]

    # Format message
    message = f"*AWS Cost Report (Mock)*\nTotal: ${total_cost}\n\n"
    for day in details:
        start = day["TimePeriod"]["Start"]
        amount = day["Total"]["BlendedCost"]["Amount"]
        message += f"• {start}: ${amount}\n"

    # Send to Slack
    webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    if webhook_url:
        payload = {"text": message}
        requests.post(webhook_url, json=payload)
    else:
        print("No Slack webhook URL configured.")

    return {
        "statusCode": 200,
        "body": json.dumps({"mocked": True, "total_cost": total_cost})
    }