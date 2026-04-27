---
title: "AWS CloudWatch Integration"
description: "Piping AWS CloudWatch logs to Loghead for a centralized AI-powered logging experience."
solutionSteps:
  - title: "Log In"
    description: "Authenticate with Loghead."
    code: "npx @loghead/core login"
  - title: "Configure CloudWatch"
    description: "Update your CloudWatch configuration to point to Loghead."
    code: "aws logs create-export-task --log-group-name my-log-group --destination my-bucket"
  - title: "Start Integration"
    description: "Piping CloudWatch logs to Loghead for analysis."
    code: "aws logs get-log-events --log-group-name my-log-group --log-stream-name my-log-stream | npx @loghead/terminal"
keywords: ["aws", "cloudwatch", "logging", "cloud", "debugging"]
visuals:
  terminal:
    command: "aws logs get-log-events | npx @loghead/terminal"
    output: "AWS integration active..."
    error: "AccessDeniedException: /admin/config"
    suggestion: "Check your IAM policies"
---

# AWS CloudWatch with Loghead

Loghead's AWS integration simplifies the process of managing logs in a cloud environment by providing a unified stream that's ready for AI analysis.

## Prerequisites

Before starting, ensure you have the following:
- An active AWS account with necessary permissions (IAM role with CloudWatch access).
- AWS CLI installed and configured locally (`aws configure`).
- Loghead CLI installed globally or executed via `npx`.

## Step-by-Step Setup

### 1. Authenticate with Loghead
First, you need to authenticate your CLI with your Loghead account:
```bash
npx @loghead/core login
```

### 2. Stream Logs to Loghead
You can stream logs in real-time straight to Loghead. For a live debugging experience, run:
```bash
aws logs get-log-events \
  --log-group-name /aws/lambda/my-function \
  --log-stream-name "my-log-stream" \
  | npx @loghead/terminal
```
*Tip: Replace `/aws/lambda/my-function` and `my-log-stream` with your actual log group and stream names.*

### 3. AI-Powered Analysis
Once the logs are flowing into Loghead, you can immediately start asking questions or looking for anomalies using Loghead's AI capabilities.

## Troubleshooting

- **AccessDeniedException**: If you encounter an error like `AccessDeniedException`, check your AWS IAM policies. Ensure the user or role has the `logs:GetLogEvents` and `logs:DescribeLogStreams` permissions.
- **Empty Output**: Verify that your log stream contains recent events and that the region in your `aws configure` matches the region of your CloudWatch logs.
