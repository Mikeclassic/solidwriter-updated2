"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Loader2, Zap, LogOut, Wand2, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Dashboard() {
  const [docs, setDocs] = useState<any[]>([]);
  const [usage, setUsage] = useState({ apiUsage: 0, usageLimit: 25000, plan: 'TRIAL' }); 
  const [loading, setLoading] = useState(true);
  
  // Brand Voice State
  const [brandVoice, setBrandVoice] = useState("");
  const [savingVoice, setSavingVoice] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetch('/api/documents')
      .then(res => {
          if (res.status === 401) router.push('/auth');
          return res.json();
      })
      .then(data => {
          setDocs(Array.isArray(data) ? data : []);
      });

    fetch('/api/user/usage')
      .then(res => res.json())
      .then(data => {
        if(data) setUsage(data);
        setLoading(false);
      });

    // Fetch Brand Voice
    fetch('/api/user/voice')
      .then(res => res.json())
      .then(data => {
        if (data?.brandVoice) setBrandVoice(data.brandVoice);
      });
  }, [router]);

  const saveBrandVoice = async () => {
    setSavingVoice(true);
    setVoiceMsg("");
    try {
        await fetch('/api/user/voice', {
            method: 'POST',
            body: JSON.stringify({ brandVoice })
        });
        setVoiceMsg("Brand Voice saved!");
        setTimeout(() => setVoiceMsg(""), 3000);
    } catch(e) {
        setVoiceMsg("Failed to save.");
    }
    setSavingVoice(false);
  };

  const usagePercent = Math.min((usage.apiUsage / usage.usageLimit) * 100, 100);
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="min-h-screen bg-secondary/30">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                     <div className="flex items-center gap-3">
                         <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                         <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] md:text-xs font-bold rounded uppercase tracking-wide">
                            {usage.plan}
                         </div>
                     </div>
                     <button 
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 bg-card px-3 py-1.5 rounded-lg border shadow-sm md:hidden"
                     >
                        <LogOut className="h-3 w-3"/>
                     </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full md:w-auto">
                    {/* USAGE CARD */}
                    <div className="bg-card px-4 py-3 rounded-xl border flex flex-col min-w-[200px]">
                        <div className="text-xs text-muted-foreground flex items-center justify-between font-semibold uppercase mb-1">
                             <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" fill="currentColor"/> Words Used</span>
                             <Link href="/pricing" className="text-primary hover:underline text-[10px]">Upgrade</Link>
                        </div>
                        <div className="flex items-end gap-2">
                             <span className="font-bold text-lg">{formatNumber(usage.apiUsage)}</span>
                             <span className="text-sm text-muted-foreground">/ {formatNumber(usage.usageLimit)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary mt-1 rounded-full overflow-hidden">
                             <div className="h-full bg-primary transition-all duration-500" style={{ width: `${usagePercent}%` }}></div>
                        </div>
                    </div>
                    
                    <Link href="/wizard" className="w-full md:w-auto">
                        <button className="w-full md:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition-opacity font-bold">
                            <Wand2 className="h-4 w-4" /> New Content
                        </button>
                    </Link>
                    
                    <button 
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="hidden md:flex text-sm text-muted-foreground hover:text-destructive items-center gap-1 bg-card px-4 py-3 rounded-xl border shadow-sm transition-colors"
                     >
                        <LogOut className="h-4 w-4"/>
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* BRAND VOICE SECTION */}
                <div className="lg:col-span-3 bg-card rounded-xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Mic className="h-5 w-5 text-primary"/> Brand Voice Trainer
                        </h2>
                        {voiceMsg && <span className="text-sm text-green-600 font-medium animate-in fade-in">{voiceMsg}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                        Paste a sample of your best writing (blog post, email, or caption). The AI will analyze this to mimic your unique style when "My Brand Voice" is selected.
                    </p>
                    <div className="flex gap-2">
                        <textarea 
                            value={brandVoice}
                            onChange={(e) => setBrandVoice(e.target.value)}
                            placeholder="e.g. Hey guys! Welcome back to another video. Today we are diving deep into..."
                            className="w-full p-3 text-sm border rounded-xl bg-secondary/20 focus:bg-background transition-colors min-h-[80px] resize-none"
                        />
                        <button 
                            onClick={saveBrandVoice}
                            disabled={savingVoice}
                            className="px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50"
                        >
                            {savingVoice ? <Loader2 className="h-4 w-4 animate-spin"/> : "Save Voice"}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
            ) : docs.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border">
                    <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
                    <p className="text-muted-foreground mb-4">Start creating content with AI power.</p>
                    <Link href="/wizard">
                        <button className="text-primary font-medium hover:underline">Launch Wizard</button>
                    </Link>
                </div>
            ) : (
                <>
                    <h2 className="text-lg font-bold mb-4">Recent Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {docs.map((doc) => (
                            <Link href={`/editor/${doc.id}`} key={doc.id} className="block group">
                                <div className="bg-card p-6 rounded-2xl border h-40 flex flex-col justify-between group-hover:border-primary transition-all shadow-sm group-hover:shadow-md">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl text-primary"><FileText className="h-6 w-6"/></div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{doc.title}</h3>
                                            <p className="text-xs text-muted-foreground">{new Date(doc.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    </div>
  );
}