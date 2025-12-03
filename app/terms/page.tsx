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
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using Solidwriter, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">2. Usage Limits</h2>
        <p>We reserve the right to limit API usage to prevent abuse and ensure stability for all users. The free trial allows for 25,000 words.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Content Ownership</h2>
        <p>You retain full ownership of all content generated using Solidwriter. We claim no intellectual property rights over the text you create.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Termination</h2>
        <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever.</p>
      </main>
    </div>
  );
}