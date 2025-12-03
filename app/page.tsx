// ... (Previous imports remain unchanged)
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Check, Bot, PenTool, ChevronDown, ChevronUp, Copy, RefreshCw, Star, PlayCircle, ArrowRight, LayoutTemplate, Zap, MessageSquare, Menu, X } from "lucide-react";
import SmartStartButton from "@/components/smart-start-button";

// ... (Rest of the constants and component logic remain unchanged until the footer)

// ... (Inside the return statement, scroll down to the footer)

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-2xl text-white mb-4">
              <Bot className="h-8 w-8 text-blue-500" />
              Solidwriter
            </div>
            <p className="text-sm leading-relaxed">Powerful AI writing assistant that helps you create better content faster.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link href="/wizard" className="hover:text-white transition-colors">AI Writer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-800 text-xs text-center md:text-left">
          © 2024 Solidwriter Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}