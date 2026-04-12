import { InnGest } from "inngest";

export const inngest = new Inngest({
  id: "chatty-ai",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
