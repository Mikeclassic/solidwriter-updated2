"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Sparkles, Loader2, Bot, Download, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";

export default function Editor({ params }: { params: { id: string } }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showAi, setShowAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  useEffect(() => {
    fetch(`/api/documents/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || "");
        setTitle(data.title || "");
      });
  }, [params.id]);

  const saveDoc = async () => {
    setSaving(true);
    await fetch(`/api/documents/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content, title })
    });
    setSaving(false);
  };

  const handleExport = (type: 'pdf' | 'md' | 'html') => {
    const filename = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (type === 'pdf') {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        // Clean markdown symbols for PDF
        const cleanText = content
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/#+\s/g, '') // Remove headings
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
            
        doc.setFontSize(24); doc.text(title, 40, 60);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(cleanText, 515);
        doc.text(splitText, 40, 100);
        doc.save(`${filename}.pdf`);
    } else {
        const fileContent = type === 'html' 
            ? `<html><head><title>${title}</title></head><body><h1>${title}</h1><pre>${content}</pre></body></html>` 
            : content;
        
        const blob = new Blob([fileContent], { type: type === 'html' ? 'text/html' : 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${type}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    setIsExportOpen(false);
  };

  const generateAI = async () => {
    if (!prompt) return;
    setGenerating(true);
    setErrorMsg("");
    
    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ 
                prompt, 
                tone: 'Professional', 
                documentId: params.id,
                currentContent: content 
            })
        });

        if (res.status === 403) { setErrorMsg("Limit Reached! Upgrade to continue."); setGenerating(false); return; }
        if (!res.ok) throw new Error("Failed");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        // Clear content to stream new version
        setContent(""); 

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setContent(prev => prev + chunk);
            }
        }
        setShowAi(false);
        setPrompt("");
    } catch (e) { setErrorMsg("Failed to generate content."); } 
    finally { setGenerating(false); }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans relative">
      <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-card shrink-0 z-10">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5"/></Link>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="font-semibold text-lg bg-transparent focus:outline-none w-full md:w-auto text-foreground" placeholder="Untitled Document"/>
        </div>
        <div className="flex items-center gap-2">
            
            <div className="relative">
                <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    <Download className="h-4 w-4"/> <span className="hidden md:inline">Export</span> <ChevronDown className="h-3 w-3"/>
                </button>
                {isExportOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border/50">Download PDF</button>
                        <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border/50">Download Markdown</button>
                        <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors">Download HTML</button>
                    </div>
                )}
            </div>

            <button onClick={saveDoc} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-colors text-sm" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>} <span className="hidden md:inline">Save</span>
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Start writing..." 
                className="w-full h-full resize-none focus:outline-none text-base md:text-lg leading-relaxed text-foreground bg-transparent p-2 font-mono"
            />
        </div>

        {/* AI Sidebar */}
        {showAi && (
            <div className="w-full md:w-96 border-l bg-card p-6 flex flex-col shadow-2xl absolute md:relative right-0 h-full z-20 animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2 text-lg"><Bot className="h-6 w-6 text-primary"/> AI Assistant</h3>
                    <button onClick={() => setShowAi(false)} className="text-muted-foreground hover:bg-secondary p-2 rounded-full"><X className="h-5 w-5"/></button>
                </div>
                {errorMsg && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{errorMsg}</div>}
                
                <div className="bg-primary/5 p-4 rounded-xl mb-6">
                    <p className="text-sm text-muted-foreground font-medium mb-2">I can help you:</p>
                    <div className="flex flex-wrap gap-2">
                        {["Fix Grammar", "Make it Shorter", "Add Intro", "Make Professional"].map(s => (
                            <button key={s} onClick={() => setPrompt(s)} className="text-xs bg-white border px-2 py-1 rounded-md hover:border-primary transition-colors">{s}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col">
                    <textarea 
                        className="w-full border rounded-xl p-4 text-sm bg-background flex-1 md:flex-none md:h-40 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="What should I do with your content?" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button onClick={generateAI} disabled={generating || !prompt} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex justify-center gap-2 shadow-lg shadow-primary/20">
                        {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Sparkles className="h-5 w-5"/>} 
                        {generating ? "Thinking..." : "Generate & Rewrite"}
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {!showAi && (
        <button 
            onClick={() => setShowAi(true)}
            className="fixed bottom-8 right-8 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 group"
            title="Open AI Assistant"
        >
            <Sparkles className="h-7 w-7 group-hover:rotate-12 transition-transform"/>
        </button>
      )}
    </div>
  );
}