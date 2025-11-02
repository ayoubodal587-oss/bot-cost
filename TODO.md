# TODO: Fix Scheduled Slack Messages Issue

## Problem
When users set a schedule (e.g., 5 minutes) in the dashboard settings UI, they receive a test confirmation message on Slack immediately, but the actual recurring scheduled messages don't arrive after the specified interval.

## Root Cause
The dashboard was only sending a test confirmation message but not actually setting up the EventBridge rule to trigger recurring cost reports.

## Solution Implemented
1. **Updated `/api/schedule` endpoint** to actually invoke the dynamic scheduler Lambda instead of just simulating the response
2. **Modified settings page** to call the schedule API when saving report schedule settings
3. **Added AWS Lambda SDK** to the dashboard for invoking the dynamic scheduler
4. **Enhanced dynamic scheduler Lambda** to support a `get_status` action for retrieving current schedule information
5. **Updated GET endpoint** in schedule API to fetch real schedule status from Lambda

## Files Modified
- `dashboard/app/api/schedule/route.ts` - Added Lambda invocation and status retrieval
- `dashboard/app/settings/page.tsx` - Added schedule update call on settings save
- `lambda/dynamic_scheduler/handler.py` - Added get_status action support
- `dashboard/package.json` - Added @aws-sdk/client-lambda dependency

## Next Steps
1. Deploy the updated Lambda functions to AWS
2. Test the schedule functionality by setting a 5-minute interval
3. Verify that recurring messages arrive on schedule
4. Monitor CloudWatch logs for any issues

## Testing
- Set schedule to 5 minutes in dashboard
- Check that EventBridge rule is created/updated
- Wait for scheduled messages to arrive
- Verify message content and timing
