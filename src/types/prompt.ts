export interface BasePrompt {
  id: string;
  type: string;
  content: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendantPrompt extends BasePrompt {
  presentation?: string;
  speechStyle?: string;
  expressionInterpretation?: string;
  schedulingScript?: string;
  rules?: string;
}

export interface SdrPrompt extends BasePrompt {}

export interface FollowUpPrompt extends BasePrompt {}

export type Prompt = AttendantPrompt | SdrPrompt | FollowUpPrompt;
