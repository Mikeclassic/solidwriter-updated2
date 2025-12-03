"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Check, Wand2, PenTool, Share2, Megaphone, ArrowLeft, LayoutTemplate, FileText } from "lucide-react";

type WizardMode = "blog" | "social" | "ads" | "copywriting" | null;

export default function WizardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<WizardMode>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Streaming State
  const [streamedContent, setStreamedContent] = useState("");
  const contentEndRef = useRef<HTMLDivElement>(null);

  // Common State
  const [input, setInput] = useState({ 
    topic: "", 
    keywords: "", 
    tone: "Professional",
    platform: "LinkedIn",
    framework: "AIDA" 
  });

  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [outline, setOutline] = useState<string[]>([]);

  // Scroll to bottom during streaming
  useEffect(() => {
    if (step === 4) {
        contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamedContent, step]);

  // --- STREAM READER HELPER ---
  const readStream = async (res: Response) => {
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    
    setStep(4); // Move to "Generating" view
    setStreamedContent("");

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setStreamedContent((prev) => prev + chunk);
    }
  };

  const handleBlogTitles = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ type: 'titles', ...input }) });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setGeneratedTitles(JSON.parse(data.result));
        setStep(2);
    } catch(e: any) { alert(e.message); }
    setLoading(false);
  };

  const handleBlogOutline = async () => {
    if(!selectedTitle) return;
    setLoading(true);
    try {
        const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ type: 'outline', title: selectedTitle, ...input }) });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setOutline(JSON.parse(data.result));
        setStep(3);
    } catch(e: any) { alert(e.message); }
    setLoading(false);
  };

  const handleBlogFinal = async () => {
    setLoading(true);
    try {
        // 1. Create Shell
        const docRes = await fetch('/api/documents', { method: 'POST', body: JSON.stringify({ title: selectedTitle }) });
        const doc = await docRes.json();
        
        // 2. Start Stream
        const genRes = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ type: 'article', title: selectedTitle, outline, documentId: doc.id, ...input })
        });

        if (!genRes.ok) {
            if(genRes.status === 403) alert("Limit reached! Upgrade plan.");
            else throw new Error("Generation failed");
            setLoading(false);
            return;
        }

        // 3. Visualize Stream
        await readStream(genRes);

        // 4. Redirect
        router.push(`/editor/${doc.id}`);

    } catch(e: any) { alert(e.message); setLoading(false); }
  };

  const handleQuickGen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const titleMap: Record<string, string> = { social: "Social Post", ads: "Ad Copy", copywriting: "Marketing Copy" };
        const safeTitle = titleMap[mode!] || "Content"; 
        const displayTitle = `${safeTitle}: ${input.topic.substring(0, 20)}...`;

        const docRes = await fetch('/api/documents', { method: 'POST', body: JSON.stringify({ title: displayTitle }) });
        const doc = await docRes.json();

        const genRes = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ type: mode, documentId: doc.id, ...input })
        });

        if (!genRes.ok) {
            if(genRes.status === 403) alert("Limit reached!");
            else throw new Error("Generation failed");
            setLoading(false);
            return;
        }

        await readStream(genRes);
        router.push(`/editor/${doc.id}`);

    } catch(e: any) { alert(e.message); setLoading(false); }
  };

  // --- RENDERERS ---

  if (!mode) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
            <h1 className="text-3xl font-bold mb-2 text-center">Create Content</h1>
            <p className="text-muted-foreground mb-10 text-center">Select a workflow to get started.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
                <Card icon={<PenTool className="h-8 w-8 text-primary"/>} title="Blog Post" desc="SEO Articles" onClick={() => setMode("blog")} />
                <Card icon={<Share2 className="h-8 w-8 text-primary"/>} title="Social Media" desc="LinkedIn / X / IG" onClick={() => setMode("social")} />
                <Card icon={<Megaphone className="h-8 w-8 text-primary"/>} title="Advertisement" desc="Ad Copy Variations" onClick={() => setMode("ads")} />
                <Card icon={<LayoutTemplate className="h-8 w-8 text-primary"/>} title="Copywriting" desc="Marketing Frameworks" onClick={() => setMode("copywriting")} />
            </div>
            <button onClick={() => router.push('/dashboard')} className="mt-12 text-muted-foreground hover:text-foreground flex items-center gap-2">
                <ArrowLeft className="h-4 w-4"/> Back to Dashboard
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-6 px-4">
        <div className="max-w-3xl w-full bg-card rounded-2xl shadow-sm border p-6 md:p-8 relative">
            {step !== 4 && (
                <button onClick={() => { setMode(null); setStep(1); }} className="absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-5 w-5"/>
                </button>
            )}
            
            <h1 className="text-xl md:text-2xl font-bold text-center mb-6 capitalize">
                {step === 4 ? 'Writing your content...' : (mode === 'blog' ? 'Blog Writer' : `${mode} Generator`)}
            </h1>

            {/* STEP 4: STREAMING VIEW (New) */}
            {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-secondary/20 rounded-xl p-6 h-96 overflow-y-auto border font-mono text-sm leading-relaxed whitespace-pre-wrap relative">
                        {streamedContent}
                        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"/>
                        <div ref={contentEndRef}/>
                    </div>
                    <div className="flex justify-center text-muted-foreground text-sm flex-col items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                        <p>Generating... Please do not close this tab.</p>
                    </div>
                </div>
            )}

            {/* BLOG WIZARD STEPS 1-3 */}
            {mode === 'blog' && step < 4 && (
                <>
                    <div className="flex justify-between mb-8 relative px-2">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -z-0"></div>
                        {[{n:1,l:"Topic"},{n:2,l:"Title"},{n:3,l:"Outline"},{n:4,l:"Draft"}].map((s) => (
                            <div key={s.n} className={`relative z-10 flex flex-col items-center gap-1 ${step >= s.n ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= s.n ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>
                                    {step > s.n ? <Check className="h-4 w-4"/> : s.n}
                                </div>
                                <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">{s.l}</span>
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleBlogTitles} className="space-y-6">
                            <InputFields input={input} setInput={setInput} />
                            <Button loading={loading} text="Generate Titles" />
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-center">Select a Title</h2>
                            <div className="space-y-3">
                                {generatedTitles.map((t, i) => (
                                    <div key={i} onClick={() => setSelectedTitle(t)} className={`p-4 border rounded-xl cursor-pointer text-sm md:text-base ${selectedTitle === t ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'hover:border-primary/50'}`}>{t}</div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={()=>setStep(1)} className="px-4 py-3 border rounded-lg hover:bg-secondary">Back</button>
                                <Button loading={loading} text="Generate Outline" onClick={handleBlogOutline} disabled={!selectedTitle} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-center">Edit Outline</h2>
                            <div className="space-y-3">
                                {outline.map((item, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <span className="text-xs font-mono text-muted-foreground">H2</span>
                                        <input value={item} onChange={(e) => { const n = [...outline]; n[i] = e.target.value; setOutline(n); }} className="flex-1 border rounded-lg p-2 text-sm bg-background"/>
                                        <button onClick={()=>setOutline(outline.filter((_,x)=>x!==i))} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">×</button>
                                    </div>
                                ))}
                                <button onClick={()=>setOutline([...outline,"New Section"])} className="text-sm text-primary font-medium">+ Add Section</button>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={()=>setStep(2)} className="px-4 py-3 border rounded-lg hover:bg-secondary">Back</button>
                                <Button loading={loading} text="Write Article" onClick={handleBlogFinal} icon={<Wand2 className="h-4 w-4"/>} />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* OTHER WIZARDS */}
            {mode !== 'blog' && step < 4 && (
                <form onSubmit={handleQuickGen} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Topic / Product</label>
                        <textarea required rows={3} value={input.topic} onChange={e=>setInput({...input, topic: e.target.value})} className="w-full border rounded-lg p-3 bg-background" placeholder="Describe content..."/>
                    </div>
                    {(mode === 'social' || mode === 'ads') && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Platform</label>
                            <select value={input.platform} onChange={e=>setInput({...input, platform: e.target.value})} className="w-full border rounded-lg p-3 bg-background">
                                {mode === 'social' ? <><option>LinkedIn</option><option>Twitter</option><option>Instagram</option><option>Facebook</option></> : <><option>Google Ads</option><option>Facebook Ads</option></>}
                            </select>
                        </div>
                    )}
                    {mode === 'copywriting' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Framework</label>
                            <select value={input.framework} onChange={e=>setInput({...input, framework: e.target.value})} className="w-full border rounded-lg p-3 bg-background">
                                <option>AIDA</option><option>PAS</option><option>BAB</option><option>4Ps</option>
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-2">Keywords</label><input value={input.keywords} onChange={e=>setInput({...input, keywords: e.target.value})} className="w-full border rounded-lg p-3 bg-background"/></div>
                        <div><label className="block text-sm font-medium mb-2">Tone</label><select value={input.tone} onChange={e=>setInput({...input, tone: e.target.value})} className="w-full border rounded-lg p-3 bg-background"><option>Professional</option><option>Casual</option><option>Witty</option></select></div>
                    </div>
                    <Button loading={loading} text="Generate Content" icon={<Wand2 className="h-4 w-4"/>} />
                </form>
            )}
        </div>
    </div>
  );
}

function Card({icon, title, desc, onClick}: any) {
    return (
        <div onClick={onClick} className="bg-card p-6 rounded-2xl border hover:border-primary cursor-pointer hover:shadow-md transition-all group text-center flex flex-col items-center justify-center h-32 md:h-40">
            <div className="mb-2 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">{icon}</div>
            <h3 className="font-bold text-base mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
    )
}
function InputFields({input, setInput}: any) {
    return (
        <>
            <div><label className="block text-sm font-medium mb-2">Topic</label><input required value={input.topic} onChange={e=>setInput({...input, topic: e.target.value})} className="w-full border rounded-lg p-3 bg-background" placeholder="e.g. Benefits of Yoga"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Keywords</label><input value={input.keywords} onChange={e=>setInput({...input, keywords: e.target.value})} className="w-full border rounded-lg p-3 bg-background"/></div>
                <div><label className="block text-sm font-medium mb-2">Tone</label><select value={input.tone} onChange={e=>setInput({...input, tone: e.target.value})} className="w-full border rounded-lg p-3 bg-background"><option>Professional</option><option>Casual</option><option>Witty</option><option>Academic</option></select></div>
            </div>
        </>
    )
}
function Button({loading, text, onClick, disabled, icon}: any) {
    return (
        <button disabled={loading || disabled} onClick={onClick} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 flex justify-center items-center gap-2 disabled:opacity-50 transition-opacity">
            {loading ? <Loader2 className="animate-spin"/> : <>{text} {icon || <ArrowRight className="h-4 w-4"/>}</>}
        </button>
    )
}