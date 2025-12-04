import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="px-6 h-20 flex items-center border-b bg-card">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4"/> Back to Home
        </Link>
      </header>
      <main className="max-w-3xl mx-auto py-16 px-6 prose dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
        <p>These Terms of Service ("Agreement") govern your use of the services provided by <strong>Solidwriter</strong> ("Company", "we", "us", "our"). By accessing or using our website and AI writing assistant services, you agree to be bound by these terms.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">2. Merchant of Record</h2>
        <p>Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.</p>
        <p>By placing an order, you agree to the terms and conditions set out in this Agreement and Paddle&apos;s Buyer Terms and Conditions.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Usage Limits</h2>
        <p>We reserve the right to limit API usage to prevent abuse and ensure stability for all users. The free trial allows for 25,000 words.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Content Ownership</h2>
        <p>You retain full ownership of all content generated using Solidwriter. We claim no intellectual property rights over the text you create.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">5. Termination</h2>
        <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@solidwriter.com" className="text-primary underline">support@solidwriter.com</a>.</p>
      </main>
    </div>
  );
}