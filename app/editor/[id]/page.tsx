"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Sparkles, Loader2, Bot, Download, ChevronDown, X, Copy, Check, Undo, Redo } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// AI Command Templates
const AI_COMMANDS = [
    "Fix Grammar & Spelling",
    "Make it Shorter",
    "Make it Longer",
    "Simplify Language",
    "Add an Intro",
    "Add a Conclusion",
    "Make Professional",
    "Make Casual / Witty",
    "Improve Flow",
    "Summarize Key Points",
    "Turn into Bullet Points",
    "Write a catchy Headline"
];

export default function Editor({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showAi, setShowAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-none',
        id: 'editor-content'
      },
    },
  });

  // Load Content
  useEffect(() => {
    fetch(`/api/documents/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || "");
        if (editor && data.content) {
            editor.commands.setContent(data.content); 
        }
      });
  }, [params.id, editor]);

  const saveDoc = async () => {
    if (!editor) return;
    setSaving(true);
    const htmlContent = editor.getHTML();
    await fetch(`/api/documents/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: htmlContent, title })
    });
    setSaving(false);
  };

  const handleCopy = () => {
      if (!editor) return;
      // Copy HTML to clipboard for rich text support in some apps, 
      // but usually plain text is safer for general use. 
      // Here we grab text. To support rich copy, we need the Clipboard API with 'text/html'.
      const text = editor.getText();
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (type: 'pdf' | 'md' | 'html') => {
    if (!editor) return;
    const filename = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    if (type === 'pdf') {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            // 1. Create a visible container off-screen (fixes unresponsiveness)
            // html2canvas needs the element to be in the DOM and visible (not display:none)
            const tempContainer = document.createElement('div');
            tempContainer.className = 'prose'; // Use same tailwind typography
            tempContainer.style.width = '595px'; // A4 width in px (approx) at 72dpi
            tempContainer.style.padding = '40px';
            tempContainer.style.background = 'white';
            tempContainer.style.position = 'fixed'; // Fixed prevents scrolling issues
            tempContainer.style.left = '0';
            tempContainer.style.top = '0';
            tempContainer.style.zIndex = '-9999'; // Behind everything
            
            // Add Title and Content
            tempContainer.innerHTML = `<h1 style="margin-bottom: 20px; font-size: 24px; font-weight: bold;">${title}</h1>` + editor.getHTML();
            
            document.body.appendChild(tempContainer);

            // 2. Generate PDF
            await doc.html(tempContainer, {
                callback: function(pdf) {
                    pdf.save(`${filename}.pdf`);
                    document.body.removeChild(tempContainer); // Cleanup
                },
                x: 0,
                y: 0,
                width: 595, // Matches A4 width in points
                windowWidth: 595, // Crucial for responsive layout scaling
                autoPaging: 'text', // Prevents cutting text in half
                margin: [20, 20, 20, 20]
            });
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Could not generate PDF. Please try again.");
        }
    } else {
        const contentToSave = type === 'html' 
            ? `<html><head><title>${title}</title></head><body><h1>${title}</h1>${editor.getHTML()}</body></html>` 
            : editor.getText();
        
        const blob = new Blob([contentToSave], { type: type === 'html' ? 'text/html' : 'text/markdown' });
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
    if (!prompt || !editor) return;
    setGenerating(true);
    setErrorMsg("");
    
    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ 
                prompt, 
                tone: 'Professional', 
                documentId: params.id,
                currentContent: editor.getHTML() 
            })
        });

        if (res.status === 403) { setErrorMsg("Limit Reached! Upgrade to continue."); setGenerating(false); return; }
        if (!res.ok) throw new Error("Failed");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        editor.commands.clearContent();
        let accumulatedHtml = "";

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulatedHtml += chunk;
                editor.commands.setContent(accumulatedHtml);
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
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground shrink-0"><ArrowLeft className="h-5 w-5"/></Link>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="font-semibold text-base md:text-lg bg-transparent focus:outline-none w-32 md:w-64 text-foreground truncate" placeholder="Untitled Document"/>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
            
            {/* Undo / Redo Group */}
            <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 mr-2">
                <button 
                    onClick={() => editor?.chain().focus().undo().run()}
                    disabled={!editor?.can().undo()}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all disabled:opacity-30"
                    title="Undo"
                >
                    <Undo className="h-4 w-4"/>
                </button>
                <div className="w-px h-4 bg-border mx-0.5"></div>
                <button 
                    onClick={() => editor?.chain().focus().redo().run()}
                    disabled={!editor?.can().redo()}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all disabled:opacity-30"
                    title="Redo"
                >
                    <Redo className="h-4 w-4"/>
                </button>
            </div>

            {/* Copy Button */}
            <button 
                onClick={handleCopy}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors relative group"
                title="Copy to Clipboard"
            >
                {copied ? <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600"/> : <Copy className="h-4 w-4 md:h-5 md:w-5"/>}
                {copied && <span className="absolute top-10 right-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50">Copied!</span>}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
                <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    <Download className="h-4 w-4"/> <span className="hidden md:inline">Export</span> <ChevronDown className="h-3 w-3"/>
                </button>
                {isExportOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border/50">Download PDF (Rich)</button>
                        <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border/50">Download Markdown</button>
                        <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors">Download HTML</button>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <button onClick={saveDoc} className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-colors text-sm" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>} <span className="hidden md:inline">Save</span>
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full bg-white/50">
            <EditorContent editor={editor} className="h-full min-h-[50vh]" />
        </div>

        {/* AI Sidebar */}
        {showAi && (
            <div className="w-full md:w-96 border-l bg-card p-4 md:p-6 flex flex-col shadow-2xl absolute md:relative right-0 h-full z-20 animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="font-bold flex items-center gap-2 text-lg"><Bot className="h-6 w-6 text-primary"/> AI Assistant</h3>
                    <button onClick={() => setShowAi(false)} className="text-muted-foreground hover:bg-secondary p-2 rounded-full"><X className="h-5 w-5"/></button>
                </div>
                {errorMsg && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{errorMsg}</div>}
                
                <div className="bg-primary/5 p-4 rounded-xl mb-6 overflow-y-auto max-h-[40vh] md:max-h-none">
                    <p className="text-sm text-muted-foreground font-medium mb-3">Quick Commands:</p>
                    <div className="flex flex-wrap gap-2">
                        {AI_COMMANDS.map(cmd => (
                            <button 
                                key={cmd} 
                                onClick={() => setPrompt(cmd)} 
                                className="text-xs bg-white border border-border px-3 py-1.5 rounded-full hover:border-primary hover:text-primary hover:shadow-sm transition-all whitespace-nowrap"
                            >
                                {cmd}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col">
                    <textarea 
                        className="w-full border rounded-xl p-4 text-sm bg-background flex-1 md:flex-none md:h-32 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" 
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
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-12 w-12 md:h-14 md:w-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 group"
            title="Open AI Assistant"
        >
            <Sparkles className="h-6 w-6 md:h-7 md:w-7 group-hover:rotate-12 transition-transform"/>
        </button>
      )}
    </div>
  );
}