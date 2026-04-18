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
import { reclaimSweeperDispatcher } from "@/inngest/workflows/reclaim-sweeper-dispatcher";
import { reclaimSweepOrg } from "@/inngest/workflows/reclaim-sweep-org";
import { simulationRunWorkflow } from "@/inngest/workflows/simulation-run";
import { briefScheduler } from "@/inngest/workflows/brief-scheduler";
import { briefRun } from "@/inngest/workflows/brief-run";
import { agentMetricsRollup } from "@/inngest/workflows/agent-metrics-rollup";
import { memoryGraphBuild } from "@/inngest/workflows/memory-graph-build";
import { outboundCallDispatch } from "@/inngest/workflows/outbound-call-dispatch";
import { outboundCallReconcile } from "@/inngest/workflows/outbound-call-reconcile";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    decisionRun,
    dailyDecisionTrigger,
    briefDeliver,
    briefRun,
    signalSync,
    feedbackProcess,
    agentRunWorkflow,
    agentInboundReply,
    cadenceStepExecuteWorkflow,
    reclaimSweeperDispatcher,
    reclaimSweepOrg,
    simulationRunWorkflow,
    briefScheduler,
    agentMetricsRollup,
    memoryGraphBuild,
    outboundCallDispatch,
    outboundCallReconcile,
  ],
});
