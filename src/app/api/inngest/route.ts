import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  decisionRun,
  dailyDecisionTrigger,
} from "@/inngest/workflows/decision-run";
import { briefDeliver } from "@/inngest/workflows/brief-deliver";
import { signalSync } from "@/inngest/workflows/signal-sync";
import { feedbackProcess } from "@/inngest/workflows/feedback-process";
import { agentRunWorkflow } from "@/inngest/workflows/agent-run";
import { agentInboundReply } from "@/inngest/workflows/agent-inbound-reply";
import { cadenceStepExecuteWorkflow } from "@/inngest/workflows/cadence-step-execute";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    decisionRun,
    dailyDecisionTrigger,
    briefDeliver,
    signalSync,
    feedbackProcess,
    agentRunWorkflow,
    agentInboundReply,
    cadenceStepExecuteWorkflow,
  ],
});
