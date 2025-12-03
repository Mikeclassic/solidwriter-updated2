import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="px-6 h-20 flex items-center border-b bg-card">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4"/> Back to Home
        </Link>
      </header>
      <main className="max-w-3xl mx-auto py-16 px-6 prose dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 2025</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
        <p>Welcome to Solidwriter. We respect your privacy and are committed to protecting your personal data.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">2. Data We Collect</h2>
        <p>We collect email addresses and usage data to provide our services. We do not sell your personal data to third parties.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">3. AI Processing</h2>
        <p>Content generated via our platform is processed by third-party AI providers (OpenRouter) solely for the purpose of generation. Your prompts are not used to train public models.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@solidwriter.com" className="text-primary underline">support@solidwriter.com</a>.</p>
      </main>
    </div>
  );
}