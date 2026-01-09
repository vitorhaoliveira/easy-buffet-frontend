export interface SubscriptionPlan {
  name: string;
  price: string;
  currency: string;
  interval: string;
}

export interface SubscriptionTrial {
  isActive: boolean;
  endsAt: string | null;
}

export interface SubscriptionDetails {
  endsAt: string | null;
  canceledAt: string | null;
  willRenew: boolean | null;
}

export interface SubscriptionCancellation {
  reason: string | null;
  comment: string | null;
}

export interface SubscriptionResponse {
  hasSubscription: boolean;
  status: 'trialing' | 'active' | 'expired' | 'canceled' | 'past_due' | null;
  plan: SubscriptionPlan | null;
  trial: SubscriptionTrial;
  subscription: SubscriptionDetails;
  cancellation: SubscriptionCancellation | null;
}
