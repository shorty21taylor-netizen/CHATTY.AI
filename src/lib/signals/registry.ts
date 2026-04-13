import type { SignalAdapter } from "./adapter";
import { CustomWebhookAdapter } from "./adapters/custom-webhook";
import { WeatherAdapter } from "./adapters/weather";
import { InternalCrmAdapter } from "./adapters/internal-crm";

const adapters = new Map<string, SignalAdapter>();

function registerDefaults() {
  // Built-in CRM — push-driven, emit functions called from API routes.
  register(new InternalCrmAdapter());
  // External pull-based adapters.
  register(new CustomWebhookAdapter());
  register(new WeatherAdapter());
}

export function register(adapter: SignalAdapter): void { adapters.set(adapter.sourceType, adapter); }
export function getAdapter(sourceType: string): SignalAdapter | undefined { if (adapters.size === 0) registerDefaults(); return adapters.get(sourceType); }
export function listAdapters(): string[] { if (adapters.size === 0) registerDefaults(); return Array.from(adapters.keys()); }
