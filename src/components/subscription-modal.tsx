
"use client";

import { X, CheckCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { useUIState } from '@/contexts/UIStateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const pricingTiers = [
  {
    name: 'Basic',
    price: '$9',
    priceSuffix: '/month',
    description: 'Perfect for individuals starting out.',
    features: ['10 recipes per month', 'Basic AI suggestions', 'Email support'],
    isCurrent: false,
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    priceSuffix: '/month',
    description: 'For professionals and frequent users.',
    features: [
      'Unlimited recipes',
      'Advanced AI suggestions',
      'Ingredient refinement',
      'Priority email support',
    ],
    isCurrent: true,
    isPopular: true,
  },
  {
    name: 'Team',
    price: '$79',
    priceSuffix: '/month',
    description: 'Collaborate with your team.',
    features: [
      'All Pro features',
      'Team collaboration (up to 5 users)',
      'Shared recipe library',
      'Dedicated account manager',
    ],
    isCurrent: false,
    isPopular: false,
  },
];

const faqs = [
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, including Visa, Mastercard, American Express, as well as PayPal."
    },
    {
        question: "Is there a free trial available?",
        answer: "We occasionally offer free trials. Please check our homepage or contact support for current promotions."
    }
];

export const SubscriptionModal: React.FC = () => {
  const { isSubscriptionModalOpen, setSubscriptionModalOpen } = useUIState();

  if (!isSubscriptionModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm">
        <h2 className="text-xl sm:text-2xl font-semibold">My Subscription</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSubscriptionModalOpen(false)}
          aria-label="Close subscription modal"
        >
          <X className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 max-w-2xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Current Plan: Pro</CardTitle>
                <CardDescription>Your RecipeSage Pro plan is active and provides access to all premium features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p><strong>Status:</strong> Active</p>
                <p><strong>Renews on:</strong> July 26, 2024</p>
                <p><strong>Price:</strong> $29/month</p>
                <div className="space-y-2">
                  <h4 className="font-medium">Key Features:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Unlimited recipes</li>
                    <li>Advanced AI suggestions</li>
                    <li>Ingredient refinement</li>
                    <li>Priority email support</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:w-auto">Upgrade Plan</Button>
                <Button variant="outline" className="w-full sm:w-auto">Manage Payment Methods</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <section id="pricing" className="py-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">Flexible Pricing for Everyone</h3>
                <p className="mt-4 text-lg text-muted-foreground">Choose the plan that's right for you.</p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {pricingTiers.map((tier) => (
                  <Card
                    key={tier.name}
                    className={`flex flex-col ${tier.isCurrent ? 'border-primary ring-2 ring-primary' : ''} ${tier.isPopular ? 'relative shadow-2xl' : 'shadow-lg'}`}
                  >
                    {tier.isPopular && (
                      <div className="absolute top-0 right-4 -mt-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3"/> Popular
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-semibold">{tier.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                        <span className="text-sm font-medium text-muted-foreground">{tier.priceSuffix}</span>
                      </div>
                      <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant={tier.isCurrent ? 'secondary' : 'default'} disabled={tier.isCurrent}>
                        {tier.isCurrent ? 'Current Plan' : 'Choose Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="billing">
             <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>Manage your payment methods and view billing history.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-medium mb-2">Payment Method</h4>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Image src="/images/visa-card.png" width={40} height={24} alt="Visa card" data-ai-hint="credit card" />
                                <div>
                                    <p className="font-medium">Visa ending in 1234</p>
                                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Update</Button>
                        </div>
                        <Button variant="link" className="mt-2 px-0">Add new payment method</Button>
                    </div>
                    <Separator />
                     <div>
                        <h4 className="font-medium mb-3">Billing History</h4>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div>
                                    <p className="font-medium">Invoice #{12345 - index}</p>
                                    <p className="text-sm text-muted-foreground">Paid on June {20 - index}, 2024 - $29.00</p>
                                </div>
                                <Button variant="outline" size="sm">Download PDF</Button>
                            </div>
                            ))}
                        </div>
                        <Button variant="link" className="mt-2 px-0">View all history</Button>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find answers to common questions about subscriptions and billing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index}>
                            <h4 className="font-medium text-base mb-1">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">
                        Can't find your answer? <Button variant="link" className="p-0 h-auto">Contact Support</Button>
                    </p>
                </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};
