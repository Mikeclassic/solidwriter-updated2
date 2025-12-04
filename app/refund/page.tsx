import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="px-6 h-20 flex items-center border-b bg-card">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4"/> Back to Home
        </Link>
      </header>
      <main className="max-w-3xl mx-auto py-16 px-6 prose dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 2025</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. 14-Day Money-Back Guarantee</h2>
        <p>We want you to be completely satisfied with Solidwriter. If you are not satisfied with your purchase, you may request a refund within <strong>14 days</strong> of the initial transaction date.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">2. How to Request a Refund</h2>
        <p>To request a refund, please contact our support team at <a href="mailto:support@solidwriter.com" className="text-primary underline">support@solidwriter.com</a>. Please provide your transaction ID or the email address used for the purchase.</p>
        <p>As our Merchant of Record, Paddle handles all payment processing and refunds. Once we verify your request is within the 14-day window, Paddle will process the refund to your original payment method.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Subscription Cancellation</h2>
        <p>You may cancel your subscription at any time. If you cancel after the 14-day refund window, you will continue to have access to the premium features until the end of your current billing cycle, but no refund will be issued for the remaining time.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Fraud and Abuse</h2>
        <p>Refunds are provided at the sole discretion of Paddle and Solidwriter. We reserve the right to refuse a refund request if we find evidence of fraud, refund abuse, or other manipulative behavior that violates our Terms of Service.</p>
      </main>
    </div>
  );
}