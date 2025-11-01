variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}
variable "bucket_name" {
  description = "S3 bucket name for cost reports"
  type        = string
  default     = "aws-cost-reports-929371299805"
}
variable "report_schedule_frequency" {
  description = "Report schedule frequency (minutes, daily, weekly, monthly)"
  type        = string
  default     = "daily"
}
variable "report_schedule_interval_minutes" {
  description = "Interval in minutes for minute-based reports"
  type        = number
  default     = 5
}
variable "report_schedule_timezone" {
  description = "Timezone for scheduled reports"
  type        = string
  default     = "UTC"
}
variable "cost_report_bucket" {
  description = "S3 bucket name for cost reports"
  type        = string
  default     = "aws-cost-reports-929371299805"
}

variable "cost_report_key" {
  description = "S3 key for cost report file"
  type        = string
  default     = "reports/cost-report-test.json"
}

variable "google_api_key" {
  description = "Google API key for Gemini"
  type        = string
  default     = ""
}

variable "google_model" {
  description = "Google Gemini model"
  type        = string
  default     = "gemini-2.0-flash"
}

variable "slack_webhook_url" {
  description = "Slack webhook URL"
  type        = string
  default     = ""
}

variable "monthly_budget" {
  description = "Monthly budget for cost alerts"
  type        = string
  default     = "1000"
}
