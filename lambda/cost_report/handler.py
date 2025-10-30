import os
import json
import requests
import boto3
import datetime

def lambda_handler(event, context):
    # Load mock data (for now)
    with open("mock_data.json", "r") as f:
        data = json.load(f)
        data1 = data

    total_cost = data["total_cost"]
    details = data["details"]

    # Format message
    message = f"*AWS Cost Report (Mock)*\nTotal: ${total_cost}\n\n"
    for day in details:
        start = day["TimePeriod"]["Start"]
        amount = day["Total"]["BlendedCost"]["Amount"]
        message += f"• {start}: ${amount}\n"

    # ------------------------------
    # ✅ Step 1: Store daily report to S3--
    # ------------------------------
    s3 = boto3.client("s3", region_name=os.environ.get("AWS_REGION", "eu-north-1"))
    bucket_name = os.environ.get("COST_REPORT_BUCKET", "aws-cost-reports-bucket")
    
    today = datetime.date.today().strftime("%Y-%m-%d")
    object_key = f"reports/{today}.json"
    
    try:
        s3.put_object(
            Bucket=bucket_name,
            Key=object_key,
            Body=json.dumps(data, indent=2),
            ContentType="application/json"
        )
        print(f"✅ Stored cost report in S3: s3://{bucket_name}/{object_key}")
    except Exception as e:
        print(f"❌ Failed to store report in S3: {e}")

    # ------------------------------
    # ✅ Step 2: Send report to Slack
    # ------------------------------
    webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    if webhook_url:
        payload = {"text": message}
        requests.post(webhook_url, json=payload)
        print("✅ Report sent to Slack")
    else:
        print("⚠️ No Slack webhook URL configured.")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "mocked": True,
            "stored_to_s3": True,
            "total_cost": total_cost
        })
    }
