import boto3, os, json, datetime, requests

def lambda_handler(event, context):
    print("Lambda started")

    # mock data
    data = {
        "total_cost": 10.23,
        "details": [
            {"TimePeriod": {"Start": "2025-10-30", "End": "2025-10-31"}, "Total": {"BlendedCost": {"Amount": "10.23", "Unit": "USD"}}}
        ]
    }

    total_cost = data["total_cost"]
    message = f"*AWS Cost Report (Mock)*\nTotal: ${total_cost}\n\n"

    for d in data["details"]:
        start = d["TimePeriod"]["Start"]
        amt = d["Total"]["BlendedCost"]["Amount"]
        message += f"• {start}: ${amt}\n"

    # 🔹 Step 1 — Store report in S3
    try:
        s3 = boto3.client("s3", region_name="eu-north-1")
        bucket_name = os.environ.get("COST_REPORT_BUCKET")
        today = datetime.date.today().strftime("%Y-%m-%d")
        key = f"reports/{today}.json"

        print(f"Uploading to {bucket_name} ...")
        s3.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=json.dumps(data, indent=2),
            ContentType="application/json"
        )
        print(f"✅ Uploaded to s3://{bucket_name}/{key}")
    except Exception as e:
        print(f"❌ S3 upload failed: {e}")

    # 🔹 Step 2 — Slack
    webhook = os.environ.get("SLACK_WEBHOOK_URL")
    if webhook:
        try:
            requests.post(webhook, json={"text": message})
            print("✅ Sent message to Slack")
        except Exception as e:
            print(f"❌ Slack send failed: {e}")
    else:
        print("⚠️ Slack webhook not found")

    return {"statusCode": 200, "body": json.dumps({"ok": True})}
