# Lambda function for cost reports
resource "aws_lambda_function" "cost_report_lambda" {
  function_name = "aws-cost-report-lambda"
  runtime       = "python3.9"
  handler       = "handler.lambda_handler"
  timeout       = 300

  # Package the Lambda function code
  filename         = data.archive_file.lambda_package.output_path
  source_code_hash = data.archive_file.lambda_package.output_base64sha256

  # Environment variables
  environment {
    variables = {
      COST_REPORT_BUCKET = var.cost_report_bucket
      COST_REPORT_KEY    = var.cost_report_key
      AWS_REGION         = var.region
      GOOGLE_API_KEY     = var.google_api_key
      GOOGLE_MODEL       = var.google_model
      SLACK_WEBHOOK_URL  = var.slack_webhook_url
      MONTHLY_BUDGET     = var.monthly_budget
    }
  }

  # IAM role for Lambda
  role = aws_iam_role.lambda_execution_role.arn

  tags = {
    Name = "aws-cost-report-lambda"
  }
}

# Package the Lambda function code
data "archive_file" "lambda_package" {
  type        = "zip"
  source_dir  = "../lambda/cost_report"
  output_path = "${path.module}/lambda_package.zip"
}

# IAM role for Lambda execution
resource "aws_iam_role" "lambda_execution_role" {
  name = "aws-cost-report-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "aws-cost-report-lambda-policy"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.cost_report_bucket}",
          "arn:aws:s3:::${var.cost_report_bucket}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ce:GetCostAndUsage",
          "ce:GetUsageAndCosts"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}
