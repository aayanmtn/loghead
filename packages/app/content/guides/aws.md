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
