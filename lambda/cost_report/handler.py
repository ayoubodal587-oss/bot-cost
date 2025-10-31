import json
import boto3
import os

def lambda_handler(event, context):
    print("Lambda started")

    bucket_name = os.environ["COST_REPORT_BUCKET"]
    region = os.environ.get("AWS_REGION", "eu-north-1")
    print(f"Using bucket: {bucket_name} in region: {region}")

    s3 = boto3.client("s3", region_name=region)

    data = {
        "ResultsByTime": [
            {
                "TimePeriod": {"Start": "2025-10-29", "End": "2025-10-30"},
                "Total": {"BlendedCost": {"Amount": "1.23", "Unit": "USD"}}
            }
        ]
    }

    key = "reports/cost-report-test.json"
    try:
        s3.put_object(Bucket=bucket_name, Key=key, Body=json.dumps(data))
        print(f"✅ Uploaded file to s3://{bucket_name}/{key}")
        return {"status": "ok", "file": f"s3://{bucket_name}/{key}"}

    except Exception as e:
        print(f"❌ S3 upload failed: {e}")
        return {"status": "error", "message": str(e)}
