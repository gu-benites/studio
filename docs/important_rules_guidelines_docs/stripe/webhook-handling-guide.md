# Stripe Webhook Handling for AromaChat

## Overview

This document outlines the approach for handling Stripe webhooks in the AromaChat application to manage subscription lifecycle events properly.

## Webhook Setup

### 1. Create a Webhook Endpoint

Create a Next.js API route `/api/webhooks/stripe` to handle incoming webhook events.

```typescript
// app/api/webhooks/stripe/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Process event based on type
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, supabase);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription, supabase);
        break;
      }
      // Add more event types as needed
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Webhook Error: ${errorMessage}`);
    return NextResponse.json(
      { error: { message: `Webhook Error: ${errorMessage}` } },
      { status: 400 }
    );
  }
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: any
) {
  // First, store the event in the database to avoid duplicates
  const { data, error } = await supabase
    .from('stripe_events')
    .insert({
      id: subscription.id,
      type: 'subscription.updated',
      data: subscription,
      processed: false
    })
    .select()
    .single();
  
  if (error && error.code === '23505') {
    // Already processed this event
    return;
  }
  
  // Update the subscription in our database
  await supabase
    .from('subscriptions')
    .upsert({
      id: subscription.id,
      user_id: subscription.metadata.user_id,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      cancel_at_period_end: subscription.cancel_at_period_end,
      created: new Date(subscription.created * 1000).toISOString(),
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      ended_at: subscription.ended_at
        ? new Date(subscription.ended_at * 1000).toISOString()
        : null,
      cancel_at: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null
    });
  
  // Mark event as processed
  await supabase
    .from('stripe_events')
    .update({ processed: true })
    .eq('id', subscription.id);
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
  supabase: any
) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      ended_at: new Date(subscription.ended_at! * 1000).toISOString()
    })
    .eq('id', subscription.id);
}
```

### 2. Configure the Webhook in Stripe Dashboard

1. Go to the Stripe Dashboard → Developers → Webhooks
2. Add an endpoint with your app's URL: `https://your-app.domain/api/webhooks/stripe`
3. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3. Set Up Local Testing with Stripe CLI

For local development, use the Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Event Handling Flow

1. Validate the incoming webhook signature
2. Check if the event has already been processed (avoid duplicates)
3. Process the event based on its type
4. Update the relevant database tables
5. Mark the event as processed

## Critical Events to Handle

| Event Type | Action |
|------------|--------|
| `customer.subscription.created` | Store subscription, update user role to premium |
| `customer.subscription.updated` | Update subscription details, maybe change user role |
| `customer.subscription.deleted` | Mark subscription as inactive, change user role back to free |
| `invoice.payment_succeeded` | Update payment records |
| `invoice.payment_failed` | Notify customer, log payment attempt |

## Best Practices

1. **Store Events**: Store all processed events in the `stripe_events` table to prevent duplicate processing
2. **Idempotent Operations**: Ensure all database operations are idempotent
3. **Error Handling**: Log all errors and implement retries for failed events
4. **Monitoring**: Set up alerts for webhook failures
5. **Testing**: Test all event handlers thoroughly with mock events

## UI Components for Subscription Status

Follow the Shadcn UI best practices when creating subscription-related UI components:

1. Use theme variables for consistent styling 
2. Implement proper tooltips with `TooltipProvider` at the root level
3. Use conditional rendering based on the user's subscription status
4. Create appropriate feedback using the Toaster component for subscription updates
