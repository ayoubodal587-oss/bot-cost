provider "aws" {
  region = var.region
}

# EventBridge rule for scheduled cost reports
resource "aws_cloudwatch_event_rule" "cost_report_schedule" {
  name                = "cost-report-schedule"
  description         = "Scheduled rule for AWS cost reports"
  schedule_expression = var.report_schedule_frequency == "minutes" ? "rate(${var.report_schedule_interval_minutes} minutes)" : "cron(0 9 * * ? *)"  # Default daily at 9 AM UTC

  # Create rule if frequency is minutes OR if interval_minutes > 0 (for backward compatibility)
  count = (var.report_schedule_frequency == "minutes" || var.report_schedule_interval_minutes > 0) ? 1 : 0

  tags = {
    Name = "cost-report-schedule"
  }
}

# EventBridge target to trigger Lambda
resource "aws_cloudwatch_event_target" "cost_report_lambda" {
  count = (var.report_schedule_frequency == "minutes" || var.report_schedule_interval_minutes > 0) ? 1 : 0
  rule      = aws_cloudwatch_event_rule.cost_report_schedule[0].name
  target_id = "cost-report-lambda"
  arn       = aws_lambda_function.cost_report_lambda.arn

  input = jsonencode({
    report_interval_minutes = var.report_schedule_interval_minutes
  })
}

# Lambda permission for EventBridge
resource "aws_lambda_permission" "allow_eventbridge" {
  count = (var.report_schedule_frequency == "minutes" || var.report_schedule_interval_minutes > 0) ? 1 : 0
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_report_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cost_report_schedule[0].arn
}
