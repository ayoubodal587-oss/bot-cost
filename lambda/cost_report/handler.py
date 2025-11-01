import json
import boto3
import os
import requests
from datetime import datetime, timedelta
from statistics import mean

def lambda_handler(event, context):
    print("🚀 Enhanced Cost Manager Lambda started")

    # Get report interval from event (for minute-based reports)
    report_interval_minutes = event.get('report_interval_minutes', 5) if event else 5
    print(f"📊 Report interval: {report_interval_minutes} minutes")

    # Environment variables
    bucket_name = os.environ["COST_REPORT_BUCKET"]
    key = os.environ.get("COST_REPORT_KEY", "reports/cost-report-test.json")
    region = os.environ.get("AWS_REGION", "eu-north-1")
    google_api_key = os.environ.get("GOOGLE_API_KEY")
    model_name = os.environ.get("GOOGLE_MODEL", "gemini-2.0-flash")
    slack_webhook = os.environ.get("SLACK_WEBHOOK_URL")
    monthly_budget = float(os.environ.get("MONTHLY_BUDGET", "1000"))  # Default $1000

    # Get report interval from event or environment (default to 60 minutes for backward compatibility)
    report_interval_minutes = int(event.get('report_interval_minutes', os.environ.get('REPORT_INTERVAL_MINUTES', 60)))

    # Read cost data from S3
    print(f"📂 Reading {key} from {bucket_name}")
    s3 = boto3.client("s3", region_name=region)

    try:
        response = s3.get_object(Bucket=bucket_name, Key=key)
        cost_data = json.loads(response["Body"].read().decode("utf-8"))
        print("✅ Cost data loaded successfully")
    except Exception as e:
        print(f"❌ Error reading S3: {e}")
        send_error_to_slack(slack_webhook, f"Failed to read cost data: {str(e)}")
        return {"status": "error", "message": str(e)}

    # Analyze cost data
    analysis = analyze_costs(cost_data, monthly_budget, report_interval_minutes)

    # Check for anomalies
    anomaly_alert = detect_anomalies(cost_data)

    # Generate AI summary with enhanced prompt
    ai_summary = generate_ai_summary(cost_data, analysis, google_api_key, model_name)

    # Send enhanced Slack message
    send_enhanced_slack_message(
        slack_webhook,
        ai_summary,
        analysis,
        anomaly_alert,
        monthly_budget
    )
    
    print("✅ Cost report completed successfully")
    return {
        "status": "success", 
        "summary": ai_summary,
        "total_cost": analysis.get("total_cost", 0),
        "anomaly_detected": anomaly_alert is not None
    }


def analyze_costs(cost_data, monthly_budget, interval_minutes=60):
    """Analyze cost data and extract key metrics"""
    analysis = {
        "total_cost": 0,
        "interval_cost": 0,
        "daily_costs": [],
        "top_services": [],
        "trend": "stable",
        "budget_usage": 0,
        "projected_monthly": 0
    }
    
    try:
        # Extract total cost (adjust based on your JSON structure)
        if isinstance(cost_data, dict):
            # Try common cost data structures
            if "ResultsByTime" in cost_data:
                total = 0
                daily_costs = []
                for result in cost_data["ResultsByTime"]:
                    amount = float(result.get("Total", {}).get("BlendedCost", {}).get("Amount", 0))
                    total += amount
                    daily_costs.append(amount)
                analysis["total_cost"] = round(total, 2)
                analysis["daily_costs"] = daily_costs
            elif "total" in cost_data:
                analysis["total_cost"] = float(cost_data["total"])
            
            # Calculate trend
            if len(analysis["daily_costs"]) >= 2:
                recent_avg = mean(analysis["daily_costs"][-3:]) if len(analysis["daily_costs"]) >= 3 else analysis["daily_costs"][-1]
                older_avg = mean(analysis["daily_costs"][:3]) if len(analysis["daily_costs"]) >= 3 else analysis["daily_costs"][0]
                
                if recent_avg > older_avg * 1.15:
                    analysis["trend"] = "increasing"
                elif recent_avg < older_avg * 0.85:
                    analysis["trend"] = "decreasing"
            
            # Project monthly cost
            if analysis["daily_costs"]:
                avg_daily = mean(analysis["daily_costs"])
                analysis["projected_monthly"] = round(avg_daily * 30, 2)
            
            # Calculate interval cost (cost for the last interval period)
            if analysis["daily_costs"]:
                # Convert interval minutes to hours for calculation
                interval_hours = interval_minutes / 60.0
                # Estimate cost per hour from daily data
                avg_daily = mean(analysis["daily_costs"])
                avg_hourly = avg_daily / 24.0
                analysis["interval_cost"] = round(avg_hourly * interval_hours, 4)

            # Calculate budget usage
            if monthly_budget > 0:
                days_in_month = 30
                days_passed = len(analysis["daily_costs"])
                if days_passed > 0:
                    analysis["budget_usage"] = round((analysis["total_cost"] / monthly_budget) * 100, 1)

        print(f"📊 Analysis complete: ${analysis['total_cost']} | Interval: ${analysis['interval_cost']} | Trend: {analysis['trend']}")

    except Exception as e:
        print(f"⚠️ Error analyzing costs: {e}")

    return analysis


def detect_anomalies(cost_data):
    """Detect cost anomalies and spikes"""
    try:
        daily_costs = []
        
        if isinstance(cost_data, dict) and "ResultsByTime" in cost_data:
            for result in cost_data["ResultsByTime"]:
                amount = float(result.get("Total", {}).get("BlendedCost", {}).get("Amount", 0))
                daily_costs.append(amount)
        
        if len(daily_costs) < 2:
            return None
        
        # Check if latest cost is significantly higher than average
        latest_cost = daily_costs[-1]
        avg_cost = mean(daily_costs[:-1]) if len(daily_costs) > 1 else daily_costs[0]
        
        if latest_cost > avg_cost * 1.3:  # 30% increase threshold
            spike_percentage = round(((latest_cost - avg_cost) / avg_cost) * 100, 1)
            return {
                "type": "spike",
                "current": round(latest_cost, 2),
                "average": round(avg_cost, 2),
                "increase": spike_percentage
            }
        
        return None
        
    except Exception as e:
        print(f"⚠️ Error detecting anomalies: {e}")
        return None


def generate_ai_summary(cost_data, analysis, api_key, model_name):
    """Generate AI-powered cost summary"""
    interval_cost = analysis.get('interval_cost', 0)
    interval_text = f"${interval_cost:.4f}" if interval_cost > 0 else "N/A"

    prompt = f"""
You are an AWS cost optimization expert. Analyze this cost data and provide a CONCISE, actionable summary.

Current Analysis:
- Total Cost: ${analysis.get('total_cost', 0)}
- Interval Cost: {interval_text}
- Trend: {analysis.get('trend', 'unknown')}
- Projected Monthly: ${analysis.get('projected_monthly', 0)}

Provide your response in this EXACT format:

**💰 Cost Overview**
[One sentence about total cost and period, including interval cost]

**📈 Key Insights**
• [Insight 1 about costs and trends]
• [Insight 2 about interval spending]
• [Insight 3 about projections]

**🎯 Top 3 Recommendations**
1. [Specific action to reduce cost]
2. [Specific action to reduce cost]
3. [Specific action to reduce cost]

Keep it under 250 words. Be specific and actionable. Focus on the recent interval cost.

Raw data (first 15000 chars):
{json.dumps(cost_data)[:15000]}
"""
    
    try:
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {"Content-Type": "application/json"}
        
        print("🤖 Generating AI summary...")
        ai_resp = requests.post(gemini_url, headers=headers, json=payload, timeout=60)
        
        if ai_resp.status_code == 200:
            ai_data = ai_resp.json()
            summary = ai_data["candidates"][0]["content"]["parts"][0]["text"]
            print("✅ AI summary generated")
            return summary
        else:
            print(f"⚠️ Gemini API error: {ai_resp.status_code}")
            return generate_fallback_summary(analysis)
            
    except Exception as e:
        print(f"❌ AI generation failed: {e}")
        return generate_fallback_summary(analysis)


def generate_fallback_summary(analysis):
    """Generate a basic summary if AI fails"""
    interval_cost = analysis.get('interval_cost', 0)
    interval_text = f"${interval_cost:.4f}" if interval_cost > 0 else "N/A"

    return f"""**💰 Cost Overview**
Total spending: ${analysis.get('total_cost', 0)} | Last interval cost: {interval_text}

**📈 Key Insights**
• Cost trend: {analysis.get('trend', 'stable')}
• Interval spending shows {analysis.get('trend', 'stable')} pattern
• Projected monthly cost: ${analysis.get('projected_monthly', 0)}

**🎯 Recommendations**
1. Monitor interval costs closely for sudden changes
2. Review and optimize resource usage patterns
3. Consider Reserved Instances for consistent workloads
4. Enable cost allocation tags for better visibility"""


def create_budget_bar(percentage):
    """Create a visual progress bar for budget"""
    filled = int(percentage / 5)  # 20 blocks for 100%
    empty = 20 - filled
    
    if percentage < 50:
        emoji = "🟢"
    elif percentage < 80:
        emoji = "🟡"
    else:
        emoji = "🔴"
    
    bar = "█" * filled + "░" * empty
    return f"{emoji} {bar} {percentage}%"


def send_enhanced_slack_message(webhook_url, ai_summary, analysis, anomaly, budget):
    """Send beautifully formatted message to Slack"""
    
    current_time = datetime.now().strftime("%B %d, %Y at %I:%M %p UTC")
    
    # Build blocks
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "📊 AWS Cost Intelligence Report",
                "emoji": True
            }
        }
    ]
    
    # Anomaly alert (if detected)
    if anomaly:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"⚠️ *COST SPIKE DETECTED*\n🔺 Spending increased by *{anomaly['increase']}%*\nCurrent: ${anomaly['current']} | Average: ${anomaly['average']}"
            }
        })
        blocks.append({"type": "divider"})
    
    # Budget tracker
    budget_percentage = analysis.get("budget_usage", 0)
    budget_bar = create_budget_bar(budget_percentage)
    
    blocks.append({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": f"*💳 Budget Tracker*\n```{budget_bar}```\nSpent: *${analysis.get('total_cost', 0)}* of ${budget} monthly budget"
        }
    })
    
    blocks.append({"type": "divider"})
    
    # AI Summary
    blocks.append({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": ai_summary
        }
    })
    
    # Cost metrics
    trend_emoji = {"increasing": "📈", "decreasing": "📉", "stable": "➡️"}.get(analysis.get("trend", "stable"), "➡️")
    interval_cost = analysis.get('interval_cost', 0)
    interval_display = f"${interval_cost:.4f}" if interval_cost > 0 else "N/A"

    blocks.append({
        "type": "section",
        "fields": [
            {
                "type": "mrkdwn",
                "text": f"*Current Spend*\n${analysis.get('total_cost', 0)}"
            },
            {
                "type": "mrkdwn",
                "text": f"*Interval Cost*\n{interval_display}"
            },
            {
                "type": "mrkdwn",
                "text": f"*Trend*\n{trend_emoji} {analysis.get('trend', 'stable').title()}"
            },
            {
                "type": "mrkdwn",
                "text": f"*Projected Monthly*\n${analysis.get('projected_monthly', 0)}"
            },
            {
                "type": "mrkdwn",
                "text": f"*Budget Remaining*\n${max(0, budget - analysis.get('total_cost', 0))}"
            }
        ]
    })
    
    blocks.append({"type": "divider"})
    
    # Action buttons
    blocks.append({
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "📊 View Details",
                    "emoji": True
                },
                "value": "view_details",
                "url": f"https://console.aws.amazon.com/cost-management/home?region={os.environ.get('AWS_REGION', 'us-east-1')}#/cost-explorer"
            },
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "💡 Optimization Tips",
                    "emoji": True
                },
                "value": "optimization_tips",
                "url": "https://aws.amazon.com/aws-cost-management/cost-optimization/"
            }
        ]
    })
    
    # Footer
    blocks.append({
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": f"🤖 AI-Powered Analysis • 📅 {current_time}"
            }
        ]
    })
    
    # Send to Slack
    try:
        response = requests.post(
            webhook_url, 
            json={"blocks": blocks},
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Enhanced report sent to Slack")
        else:
            print(f"⚠️ Slack responded with {response.status_code}")
            # Fallback to simple message
            simple_msg = {"text": f"📊 *AWS Cost Report*\n\n{ai_summary}"}
            requests.post(webhook_url, json=simple_msg, timeout=10)
            
    except Exception as e:
        print(f"❌ Failed to send to Slack: {e}")


def send_error_to_slack(webhook_url, error_message):
    """Send error notification to Slack"""
    try:
        message = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "⚠️ Cost Report Error",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"```{error_message}```"
                    }
                }
            ]
        }
        requests.post(webhook_url, json=message, timeout=10)
    except:
        pass  # Fail silently if Slack notification fails