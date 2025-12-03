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
        <p className="text-muted-foreground mb-8">Last updated: December 2024</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Free Trial</h2>
        <p>We offer a 7-day free trial for all plans. You will not be charged if you cancel your subscription before the trial period ends.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">2. Subscription Cancellation</h2>
        <p>You may cancel your subscription at any time. Upon cancellation, your access to premium features will continue until the end of your current billing cycle. We do not provide partial refunds for unused time in the current billing cycle.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Refund Eligibility</h2>
        <p>Since a free trial is provided to test the service, refunds are generally not issued once a payment is processed. However, exceptions may be made in the following cases:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Technical issues prevented you from using the service.</li>
            <li>You were charged due to a billing error.</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Contact Us</h2>
        <p>If you believe you are eligible for a refund, please contact us at <a href="mailto:support@solidwriter.com" className="text-primary underline">support@solidwriter.com</a> with your transaction details.</p>
      </main>
    </div>
  );
}