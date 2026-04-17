export interface CannedScenario {
  agent_type: string;
  scenario_name: string;
  input_signal: Record<string, unknown>;
  actual_output: Record<string, unknown>;
}

export const CANNED_SCENARIOS: CannedScenario[] = [
  {
    agent_type: "instant_lead_response",
    scenario_name: "Hot roofing lead via form",
    input_signal: {
      contact_name: "Mike Reynolds",
      phone: "+15551234567",
      source: "website_form",
      service_type: "roofing",
      message: "Storm damage on my roof last night, need someone out ASAP",
      urgency: "high",
    },
    actual_output: {
      reply_preview: "Hi Mike, sorry to hear about the storm damage. We can have someone out today to assess your roof. Does this afternoon work?",
      actions_planned: ["send_sms", "book_appointment"],
      confidence: 0.95,
    },
  },
  {
    agent_type: "reclaim_aged",
    scenario_name: "3-day-old stale lead",
    input_signal: {
      contact_name: "Sarah Chen",
      phone: "+15559876543",
      service_type: "hvac",
      lead_age_days: 3,
      last_interaction: "initial form submission",
      status: "contacted",
    },
    actual_output: {
      reply_preview: "Hi Sarah, just checking in on your HVAC request from earlier this week. Still looking for help? Happy to answer any questions.",
      actions_planned: ["send_sms"],
      confidence: 0.8,
    },
  },
  {
    agent_type: "review_request",
    scenario_name: "5-star review request after job",
    input_signal: {
      contact_name: "Tom Williams",
      phone: "+15555551234",
      service_type: "roofing",
      job_status: "completed",
      job_value: 12500,
      satisfaction: "high",
    },
    actual_output: {
      reply_preview: "Hi Tom, thanks for choosing us for your roof! If you have a minute, a Google review would mean a lot to our small team.",
      actions_planned: ["send_sms", "generate_review_link"],
      confidence: 0.9,
    },
  },
  {
    agent_type: "voice",
    scenario_name: "Inbound voice call about leak",
    input_signal: {
      caller_number: "+15552223333",
      call_direction: "inbound",
      caller_message: "I have a leak in my bathroom ceiling, I think my roof is damaged",
      service_type: "roofing",
      is_homeowner: true,
    },
    actual_output: {
      reply_preview: "I'm sorry to hear about the leak. Let me get some details so we can get someone out to help. Can you tell me your address?",
      actions_planned: ["qualify_caller", "collect_address", "check_availability"],
      confidence: 0.92,
    },
  },
  {
    agent_type: "telegram_ea",
    scenario_name: "Telegram /metrics query",
    input_signal: {
      command: "/metrics",
      chat_id: 123456789,
      username: "operator_mike",
    },
    actual_output: {
      reply_preview: "Today's Metrics\n\nInbound: 14\nOutbound: 6\nTotal interactions: 20",
      actions_planned: ["fetch_daily_activity", "format_response"],
      confidence: 0.95,
    },
  },
  {
    agent_type: "form_bot",
    scenario_name: "Solar inquiry from landing page",
    input_signal: {
      contact_name: "Lisa Park",
      email: "lisa.park@email.com",
      phone: "+15558887777",
      source: "landing_page_form",
      service_type: "solar",
      message: "Interested in solar panels for my 2400 sqft home",
      property_type: "residential",
    },
    actual_output: {
      reply_preview: "Thanks for your interest in solar, Lisa! Based on your home size, you could see significant savings. Let's schedule a quick assessment.",
      actions_planned: ["create_contact", "create_lead", "send_sms"],
      confidence: 0.88,
    },
  },
];
