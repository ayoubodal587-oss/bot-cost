import json
import boto3
import os
from datetime import datetime

def lambda_handler(event, context):
    """Dynamically create/update EventBridge rules for cost report scheduling"""

    print("🚀 Dynamic Scheduler Lambda started")

    # Extract parameters from event
    action = event.get('action', 'create')  # create, update, delete
    interval_minutes = event.get('interval_minutes', 5)
    rule_name = event.get('rule_name', 'cost-report-schedule-dynamic')
    lambda_arn = event.get('lambda_arn')

    if not lambda_arn:
        # Try to get from environment or construct from current Lambda
        lambda_arn = os.environ.get('COST_REPORT_LAMBDA_ARN')
        if not lambda_arn:
            # Construct from current function ARN
            current_arn = context.invoked_function_arn
            # Replace function name in ARN
            lambda_arn = current_arn.replace('dynamic-scheduler', 'cost-report')

    print(f"📅 Action: {action}, Interval: {interval_minutes}min, Rule: {rule_name}")

    # Initialize AWS clients
    events = boto3.client('events')
    lambda_client = boto3.client('lambda')

    try:
        if action == 'delete':
            # Delete existing rule and target
            try:
                events.remove_targets(Rule=rule_name, Ids=['cost-report-target'])
                print("✅ Removed EventBridge target")
            except events.exceptions.ResourceNotFoundException:
                print("⚠️ Target not found, skipping removal")

            try:
                events.delete_rule(Name=rule_name)
                print("✅ Deleted EventBridge rule")
            except events.exceptions.ResourceNotFoundException:
                print("⚠️ Rule not found, skipping deletion")

            return {"status": "success", "message": "Schedule deleted"}

        elif action in ['create', 'update']:
            # Create or update the rule
            schedule_expression = f"rate({interval_minutes} minutes)"

            # Create/update the rule
            events.put_rule(
                Name=rule_name,
                ScheduleExpression=schedule_expression,
                State='ENABLED',
                Description=f'Cost report every {interval_minutes} minutes'
            )
            print(f"✅ Created/updated EventBridge rule: {schedule_expression}")

            # Add/update the target
            events.put_targets(
                Rule=rule_name,
                Targets=[
                    {
                        'Id': 'cost-report-target',
                        'Arn': lambda_arn,
                        'Input': json.dumps({
                            'report_interval_minutes': interval_minutes,
                            'source': 'eventbridge-dynamic'
                        })
                    }
                ]
            )
            print("✅ Added/updated EventBridge target")

            # Add permission for EventBridge to invoke Lambda (if not exists)
            try:
                lambda_client.add_permission(
                    FunctionName=lambda_arn.split(':')[-1],  # Extract function name from ARN
                    StatementId=f'EventBridge-{rule_name}',
                    Action='lambda:InvokeFunction',
                    Principal='events.amazonaws.com',
                    SourceArn=f"arn:aws:events:{os.environ.get('AWS_REGION', 'us-east-1')}:{os.environ.get('AWS_ACCOUNT_ID', '*')}:rule/{rule_name}"
                )
                print("✅ Added Lambda permission for EventBridge")
            except lambda_client.exceptions.ResourceConflictException:
                print("⚠️ Lambda permission already exists")

            return {
                "status": "success",
                "message": f"Schedule updated to every {interval_minutes} minutes",
                "rule_name": rule_name,
                "schedule_expression": schedule_expression
            }

        else:
            return {"status": "error", "message": f"Unknown action: {action}"}

    except Exception as e:
        print(f"❌ Error in dynamic scheduling: {e}")
        return {"status": "error", "message": str(e)}


def get_current_schedule():
    """Get current EventBridge rule configuration"""
    events = boto3.client('events')

    try:
        rule = events.describe_rule(Name='cost-report-schedule-dynamic')
        targets = events.list_targets_by_rule(Rule='cost-report-schedule-dynamic')

        # Extract interval from schedule expression
        schedule_expr = rule.get('ScheduleExpression', '')
        if 'rate(' in schedule_expr:
            interval_str = schedule_expr.split('rate(')[1].split(' ')[0]
            interval_minutes = int(interval_str)
        else:
            interval_minutes = 60  # default

        return {
            "rule_exists": True,
            "interval_minutes": interval_minutes,
            "state": rule.get('State'),
            "schedule_expression": schedule_expr,
            "targets": len(targets.get('Targets', []))
        }

    except events.exceptions.ResourceNotFoundException:
        return {"rule_exists": False}
    except Exception as e:
        print(f"❌ Error getting current schedule: {e}")
        return {"rule_exists": False, "error": str(e)}
