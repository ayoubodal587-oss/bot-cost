import json, boto3, os, certifi, botocore.config

def lambda_handler(event, context):
    print("Lambda started")

    bucket_name = os.environ["COST_REPORT_BUCKET"]
    region = os.environ.get("AWS_REGION", "eu-north-1")
    print(f"Using bucket: {bucket_name} in region: {region}")

    # Force boto3 to use certifi's CA bundle
    session = boto3.session.Session()
    s3 = session.client(
        "s3",
        region_name=region,
        verify=certifi.where(),  # << important fix
        config=botocore.config.Config(signature_version='s3v4')
    )

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
