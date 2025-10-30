import os
import json
import requests
import boto3
import datetime

def lambda_handler(event, context):
    print("🔹 Starting Lambda execution...")

    try:
        # Load mock data
        print("🔹 Loading mock data...")
        with open("mock_data.json", "r") as f:
            data = json.load(f)
        print("✅ Mock data loaded successfully")

        total_cost = data["total_cost"]
        details = data["details"]

        # Format message
        print("🔹 Formatting Slack message...")
        message = f"*AWS Cost Report (Mock)*\nTotal: ${total_cost}\n\n"
        for day in details:
            start = day["TimePeriod"]["Start"]
            amount = day["Total"]["BlendedCost"]["Amount"]
            message += f"• {start}: ${amount}\n"
        print("✅ Message formatted")

        # ------------------------------
        # Step 1: Store daily report to S3
        # ------------------------------
        print("🔹 Uploading report to S3...")
        s3 = boto3.client("s3", region_name=os.environ.get("AWS_REGION", "eu-north-1"))
        bucket_name = os.environ.get("COST_REPORT_BUCKET", "aws-cost-reports-bucket")
        
        today = datetime.date.today().strftime("%Y-%m-%d")
        object_key = f"reports/{today}.json"

        s3.put_object(
            Bucket=bucket_name,
            Key=object_key,
            Body=json.dumps(data, indent=2),
            ContentType="application/json"
        )
        print(f"✅ Stored cost report in S3: s3://{bucket_name}/{object_key}")

        # ------------------------------
        # Step 2: Send report to Slack
        # ------------------------------
        webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
        if webhook_url:
            print("🔹 Sending report to Slack...")
            payload = {"text": message}
            requests.post(webhook_url, json=payload)
            print("✅ Report sent to Slack")
        else:
            print("⚠️ No Slack webhook URL configured.")

        print("🎯 Lambda execution finished successfully")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "mocked": True,
                "stored_to_s3": True,
                "total_cost": total_cost
            })
        }

    except Exception as e:
        print(f"❌ Lambda execution failed: {e}")
        raise e
