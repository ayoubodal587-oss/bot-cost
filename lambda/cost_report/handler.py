import json, boto3, os

def lambda_handler(event, context):
    print("Lambda started")

    bucket_name = os.environ["COST_REPORT_BUCKET"]
    print(f"Using bucket: {bucket_name}")

    s3 = boto3.client("s3")

    # Make the data to upload (for test)
    data = {
        "ResultsByTime": [
            {
                "TimePeriod": {"Start": "2025-10-29", "End": "2025-10-30"},
                "Total": {"BlendedCost": {"Amount": "1.23", "Unit": "USD"}}
            }
        ]
    }
    json_data = json.dumps(data)
    key = "reports/cost-report-test.json"

    try:
        s3.put_object(Bucket=bucket_name, Key=key, Body=json_data)
        print(f"✅ Uploaded file to s3://{bucket_name}/{key}")
    except Exception as e:
        print(f"❌ S3 upload failed: {e}")

    print("Done.")
