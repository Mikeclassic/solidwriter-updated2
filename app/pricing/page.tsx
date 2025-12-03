"use client";
import Link from "next/link";
import { Check, ArrowLeft, Bot, Zap, Crown } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Bot className="h-6 w-6" />
          Solidwriter
        </div>
        <Link href="/dashboard" className="text-sm font-medium hover:underline">
           Back to Dashboard
        </Link>
      </header>

      <section className="py-20 px-6 text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-primary font-semibold text-sm mb-4">
            7-Day Free Trial
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Simple Pricing, Powerful Writing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start your 7-day free trial on any plan. Cancel anytime.
        </p>
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
            
            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:border-primary transition-all relative">
                <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                <div className="my-4">
                    <span className="text-4xl font-extrabold">$12</span>
                    <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Perfect for individuals just starting out.</p>
                
                <Link href="/auth">
                    <button className="w-full py-3 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
                        Start Free Trial
                    </button>
                </Link>

                <ul className="mt-8 space-y-4">
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0"/> 25,000 Words / mo
                    </li>
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0"/> All Content Types
                    </li>
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0"/> 8+ Languages
                    </li>
                </ul>
            </div>

            {/* Standard Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-primary relative transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    MOST POPULAR
                </div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" fill="currentColor"/> Standard</h3>
                <div className="my-4">
                    <span className="text-4xl font-extrabold">$24</span>
                    <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">For professional writers and creators.</p>
                
                <Link href="/auth">
                    <button className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-blue-700 transition-all shadow-lg">
                        Start Free Trial
                    </button>
                </Link>

                <ul className="mt-8 space-y-4">
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-primary shrink-0"/> 100,000 Words / mo
                    </li>
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-primary shrink-0"/> All Content Types
                    </li>
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-primary shrink-0"/> Priority Support
                    </li>
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-primary shrink-0"/> SEO Mode
                    </li>
                </ul>
            </div>

            {/* Unlimited Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:border-primary transition-all">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Crown className="h-5 w-5 text-purple-500"/> Unlimited</h3>
                <div className="my-4">
                    <span className="text-4xl font-extrabold">$72</span>
                    <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">For agencies and heavy users.</p>
                
                <Link href="/auth">
                    <button className="w-full py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-bold hover:border-primary hover:text-primary transition-all">
                        Start Free Trial
                    </button>
                </Link>

                <ul className="mt-8 space-y-4">
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0"/> Unlimited Words
                    </li>
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0"/> All Content Types
                    </li>
                    <li className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0"/> Enterprise Security
                    </li>
                </ul>
            </div>

        </div>
      </section>
    </div>
  );
}