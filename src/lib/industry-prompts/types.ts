export interface Template {
  id: string;
  industry: string;
  useCase: string;
  name: string;
  promptText: string;
  variables: string[];
  version: number;
  isSystem: boolean;
  orgId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RenderedTemplate {
  text: string;
  missingVariables: string[];
}
