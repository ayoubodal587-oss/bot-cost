import json
import boto3
import os

def lambda_handler(event, context):
    print("Lambda started")

    # Get bucket name from environment variable
    bucket_name = os.environ.get("COST_REPORT_BUCKET")
    if not bucket_name:
        print("❌ COST_REPORT_BUCKET not set in environment variables.")
        return {"status": "error", "message": "Missing COST_REPORT_BUCKET"}

    print(f"Using bucket: {bucket_name}")

    # Initialize S3 client
    s3 = boto3.client("s3")

    # Build data (use event if provided, otherwise default test data)
    data = event.get("ResultsByTime") if isinstance(event, dict) and "ResultsByTime" in event else [
        {
            "TimePeriod": {"Start": "2025-10-29", "End": "2025-10-30"},
            "Total": {"BlendedCost": {"Amount": "1.23", "Unit": "USD"}}
        }
    ]

    json_data = json.dumps({"ResultsByTime": data}, indent=2)
    key = "reports/cost-report-test.json"

    # Upload directly to S3
    try:
        s3.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=json_data,
            ContentType="application/json"
        )
        print(f"✅ Uploaded file to s3://{bucket_name}/{key}")
        return {"status": "success", "bucket": bucket_name, "key": key}
    except Exception as e:
        print(f"❌ S3 upload failed: {e}")
        return {"status": "error", "message": str(e)}

    print("Done.")
    return {"status": "completed"}      