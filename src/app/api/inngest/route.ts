import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  decisionRun,
  dailyDecisionTrigger,
} from "@/inngest/workflows/decision-run";
import { briefDeliver } from "@/inngest/workflows/brief-deliver";
import { signalSync } from "@/inngest/workflows/signal-sync";
import { feedbackProcess } from "@/inngest/workflows/feedback-process";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    decisionRun,
    dailyDecisionTrigger,
    briefDeliver,
    signalSync,
    feedbackProcess,
  ],
});
