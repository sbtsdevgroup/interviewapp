import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import {
  Download,
  FilePlus2,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";

/**
 * ICBM TalentGauge
 * SBTS Group LLC | ICBM – Intelligent Capacity Building Model
 * Single-file React app (shadcn/ui + Tailwind + recharts)
 *
 * Features:
 * - Guided interview form with exact questions, answer-key checkboxes, and radio scoring
 * - Automatic section totals, overall total /100, outcome rules (READY/CONDITIONAL/NOT READY)
 * - Candidate registry, search/filter, analytics dashboard
 * - Local persistence (localStorage)
 * - Export CSV, Print scorecard
 * - Branded metallic two-tone look (SBTS/ICBM blue + metallic gold accents)
 */

// Brand palette
const BRAND = {
  blueDark: "#004A99",
  blue: "#0070C0",
  gold: "#D4AF37",
  goldSoft: "#F4E7B2",
  ink: "#0B1220",
};

const STORAGE_KEY = "icbm-talentgauge:v1";

const OUTCOME = {
  READY: "READY",
  CONDITIONAL: "CONDITIONAL",
  NOT_READY: "NOT READY",
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function nowIsoDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toCsv(rows) {
  const esc = (v) =>
    `"${String(v ?? "")
      .replaceAll('"', '""')
      .replaceAll("\n", " ")}"`;
  const header = Object.keys(rows[0] || {}).map(esc).join(",");
  const body = rows
    .map((r) => Object.keys(rows[0] || {}).map((k) => esc(r[k])).join(","))
    .join("\n");
  return header + "\n" + body;
}

function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function outcomeFromTotal(total) {
  if (total >= 80) return OUTCOME.READY;
  if (total >= 60) return OUTCOME.CONDITIONAL;
  return OUTCOME.NOT_READY;
}

function badgeVariant(outcome) {
  if (outcome === OUTCOME.READY) return "default";
  if (outcome === OUTCOME.CONDITIONAL) return "secondary";
  return "destructive";
}

// --- Interview configuration (exact questions + scoring) ---
// Each item can include answerKey checkboxes (informational) and a score radio.
const INTERVIEW = {
  meta: {
    title: "BPO Agent Interview",
    subtitle: "Question Matrix, Answer Keys & Scoring",
  },
  sections: [
    {
      id: "opening",
      title: "Opening & Professional Readiness",
      weight: 5,
      blurb:
        "Confirm audio/video, environment, and professionalism before proceeding.",
      items: [
        {
          id: "opening_checks",
          type: "checks",
          label: "Mandatory interviewer checks",
          options: [
            "Audio clear",
            "Internet stable",
            "Quiet environment",
            "Candidate alert & responsive",
          ],
        },
        {
          id: "opening_score",
          type: "radioScore",
          label: "Opening score",
          max: 5,
          choices: [
            { label: "5 – Fully ready", value: 5 },
            { label: "3 – Minor issues (manageable)", value: 3 },
            { label: "1 – Poor readiness (noticeable)", value: 1 },
            { label: "0 – Unacceptable", value: 0 },
          ],
          tip:
            "Score based on observed readiness and professionalism during setup.",
        },
      ],
    },
    {
      id: "comm",
      title: "Communication & English Proficiency",
      weight: 30,
      blurb:
        "Assess fluency, clarity, listening accuracy, confidence, and intelligibility.",
      items: [
        {
          id: "q1_intro",
          type: "qaScore",
          max: 8,
          question:
            "Please introduce yourself and provide your full name (first, middle and last name). Have you figured out your agent name? Tell me about your background.",
          answerKeyTitle: "Interviewer tick-box evaluation",
          answerKey: [
            "Clear sentence structure",
            "Confidence and flow",
            "Logical sequencing",
            "Pronunciation and pacing",
            "Relevant and within 2–3 minutes",
          ],
          choices: [
            { label: "8 – Strong", value: 8 },
            { label: "6 – Good", value: 6 },
            { label: "4 – Fair", value: 4 },
            { label: "2 – Poor", value: 2 },
            { label: "0 – Failed", value: 0 },
          ],
        },
        {
          id: "q2_customer_service",
          type: "qaScore",
          max: 6,
          question: "In your own words, what does customer service mean to you?",
          answerKeyTitle: "Answer-key elements (good answers include…)",
          answerKey: [
            "Helping customers / service mindset",
            "Problem-solving / resolution",
            "Respect and patience",
            "Customer satisfaction / loyalty",
          ],
          choices: [
            { label: "6 – Clear, customer-centric", value: 6 },
            { label: "4 – Basic understanding", value: 4 },
            { label: "2 – Vague / partially relevant", value: 2 },
            { label: "0 – No understanding", value: 0 },
          ],
        },
        {
          id: "q3_paraphrase",
          type: "qaScore",
          max: 6,
          question:
            "Paraphrasing Test: The customer is upset because their issue has not been resolved after multiple follow-ups. Please repeat that statement in your own words.",
          answerKeyTitle: "Scoring guidance",
          answerKey: [
            "Meaning retained (not memorized)",
            "Clear and simple phrasing",
            "Accurate understanding",
          ],
          choices: [
            { label: "6 – Fully accurate", value: 6 },
            { label: "4 – Mostly correct", value: 4 },
            { label: "2 – Misunderstood", value: 2 },
            { label: "0 – Failed", value: 0 },
          ],
        },
        {
          id: "q4_spontaneous",
          type: "qaScore",
          max: 10,
          question:
            "Tell me about a time you had to explain something clearly to someone who didn’t understand it at first.",
          answerKeyTitle: "Story checks (S→A→O)",
          answerKey: [
            "Situation described",
            "Action taken",
            "Outcome/result",
            "Patience and clarity",
            "Confident, unscripted response",
          ],
          choices: [
            { label: "10 – Strong", value: 10 },
            { label: "7 – Good", value: 7 },
            { label: "5 – Fair", value: 5 },
            { label: "3 – Poor", value: 3 },
            { label: "0 – Failed", value: 0 },
          ],
        },
      ],
    },
    {
      id: "behavior",
      title: "Customer Service & Behavioral Assessment",
      weight: 25,
      blurb:
        "Evaluate empathy, professionalism, accountability, multitasking, and coachability.",
      items: [
        {
          id: "q5_angry_customer",
          type: "qaScore",
          max: 8,
          question:
            "A customer is angry and raising their voice because they were charged incorrectly. What would you do?",
          answerKeyTitle: "Answer-key elements",
          answerKey: [
            "Calm tone and empathy",
            "Apology and acknowledgment",
            "Ownership of the issue",
            "Clear resolution steps",
            "Avoids blame / stays professional",
          ],
          choices: [
            { label: "8 – 4–5 elements present", value: 8 },
            { label: "6 – 3 elements present", value: 6 },
            { label: "3 – 1–2 elements present", value: 3 },
            { label: "0 – None", value: 0 },
          ],
        },
        {
          id: "q6_mistake",
          type: "qaScore",
          max: 6,
          question:
            "Tell me about a time you made a mistake at work or school. What did you do afterward?",
          answerKeyTitle: "Answer-key elements",
          answerKey: [
            "Accountability / ownership",
            "Correction / remediation",
            "Prevention / learning",
          ],
          choices: [
            { label: "6 – Accountable & reflective", value: 6 },
            { label: "4 – Partial ownership", value: 4 },
            { label: "2 – Defensive", value: 2 },
            { label: "0 – No accountability", value: 0 },
          ],
        },
        {
          id: "q7_pressure",
          type: "qaScore",
          max: 5,
          question:
            "How do you handle situations where multiple people or tasks are demanding your attention at the same time?",
          answerKeyTitle: "Answer-key elements",
          answerKey: ["Prioritization approach", "Emotional control / calm", "Communication"],
          choices: [
            { label: "5 – Practical, specific strategy", value: 5 },
            { label: "3 – General strategy", value: 3 },
            { label: "1 – Weak strategy", value: 1 },
            { label: "0 – Unable", value: 0 },
          ],
        },
        {
          id: "q8_feedback",
          type: "qaScore",
          max: 6,
          question:
            "If your supervisor tells you that your performance needs improvement, how would you respond?",
          answerKeyTitle: "Answer-key elements",
          answerKey: [
            "Coachability / openness",
            "Willingness to improve",
            "Professional attitude",
          ],
          choices: [
            { label: "6 – Highly coachable", value: 6 },
            { label: "4 – Open but passive", value: 4 },
            { label: "2 – Defensive", value: 2 },
            { label: "0 – Resistant", value: 0 },
          ],
        },
      ],
    },
    {
      id: "bpo",
      title: "BPO Readiness & Work Ethic",
      weight: 15,
      blurb:
        "Confirm discipline, understanding of BPO culture, and reliability.",
      items: [
        {
          id: "q9_bpo_understanding",
          type: "qaScore",
          max: 5,
          question:
            "What do you understand about working in a call center or BPO environment? (BPO can be 24 hours with shifts; non-technical roles can be 40 hours/week.)",
          answerKeyTitle: "Answer-key elements",
          answerKey: [
            "Awareness of KPIs / quality",
            "Schedules/shift discipline",
            "Professionalism and customer handling",
            "Realistic expectations",
          ],
          choices: [
            { label: "5 – Realistic & informed", value: 5 },
            { label: "3 – Basic understanding", value: 3 },
            { label: "1 – Unrealistic/unclear", value: 1 },
            { label: "0 – None", value: 0 },
          ],
        },
        {
          id: "q10_attendance",
          type: "qaScore",
          max: 5,
          question:
            "If you are scheduled for a shift but face an unexpected challenge, what would you do?",
          answerKeyTitle: "Answer-key elements",
          answerKey: [
            "Communicates early with supervisor",
            "Follows policy / escalation path",
            "Takes responsibility; avoids excuses",
          ],
          choices: [
            { label: "5 – Responsible & policy-aligned", value: 5 },
            { label: "3 – Partial responsibility", value: 3 },
            { label: "1 – Unreliable attitude", value: 1 },
            { label: "0 – Refuses responsibility", value: 0 },
          ],
        },
        {
          id: "q11_repetitive",
          type: "qaScore",
          max: 5,
          question:
            "BPO work can be repetitive. How do you stay focused and motivated?",
          answerKeyTitle: "Answer-key elements",
          answerKey: [
            "Mental discipline routines",
            "Personal motivation strategy",
            "Professional maturity",
          ],
          choices: [
            { label: "5 – Strong strategy", value: 5 },
            { label: "3 – Basic strategy", value: 3 },
            { label: "1 – Weak/unclear", value: 1 },
            { label: "0 – None", value: 0 },
          ],
        },
      ],
    },
    {
      id: "tech",
      title: "Technical & Digital Readiness",
      weight: 10,
      blurb:
        "Assess basic computer literacy and multitasking capability.",
      items: [
        {
          id: "q12_tools",
          type: "qaScore",
          max: 5,
          question: "What computer applications or tools are you comfortable using?",
          answerKeyTitle: "Expected tools (examples)",
          answerKey: [
            "Email (Gmail/Outlook)",
            "Web browsers and search",
            "MS Word/Excel or Google Docs/Sheets",
            "Chat tools (Teams/Slack/WhatsApp)",
            "Willingness to learn CRM tools",
          ],
          choices: [
            { label: "5 – Comfortable + willing to learn", value: 5 },
            { label: "3 – Basic; needs support", value: 3 },
            { label: "1 – Very limited", value: 1 },
            { label: "0 – Not ready", value: 0 },
          ],
        },
        {
          id: "q13_multitask",
          type: "qaScore",
          max: 5,
          question:
            "Can you listen to a customer, type notes, and respond at the same time? Have you done this before?",
          answerKeyTitle: "Evaluator checks",
          answerKey: [
            "Confidence is realistic (not exaggerated)",
            "Understands multitasking demand",
            "Prior experience described (if any)",
          ],
          choices: [
            { label: "5 – Confident & realistic", value: 5 },
            { label: "3 – Some confidence", value: 3 },
            { label: "1 – Uncertain", value: 1 },
            { label: "0 – No", value: 0 },
          ],
        },
      ],
    },
    {
      id: "availability",
      title: "Availability & Shift Flexibility",
      weight: 10,
      blurb:
        "Confirm operational alignment and flexibility for shifts.",
      items: [
        {
          id: "availability_text",
          type: "text",
          label: "Availability (days/hours)",
          placeholder: "E.g., Mon–Fri 9am–5pm; weekends open; can do nights…",
        },
        {
          id: "q14_availability_score",
          type: "radioScore",
          label: "Availability fit score",
          max: 5,
          choices: [
            { label: "5 – Fully aligns", value: 5 },
            { label: "3 – Partial; needs adjustment", value: 3 },
            { label: "1 – Limited", value: 1 },
            { label: "0 – Does not align", value: 0 },
          ],
        },
        {
          id: "q15_flexibility_score",
          type: "radioScore",
          label: "Flexibility score",
          max: 5,
          choices: [
            { label: "5 – Flexible (nights/weekends/rotation)", value: 5 },
            { label: "3 – Some flexibility", value: 3 },
            { label: "1 – Reluctant", value: 1 },
            { label: "0 – Not flexible", value: 0 },
          ],
        },
      ],
    },
    {
      id: "roleplay",
      title: "Role-Play (Optional)",
      weight: 5,
      blurb:
        "Use when the student needs live evaluation. Do not interrupt; observe structure and control.",
      items: [
        {
          id: "roleplay_elements",
          type: "checks",
          label: "Evaluate the following",
          options: [
            "Professional greeting",
            "Empathy statement",
            "Apology & reassurance",
            "Clarifying questions",
            "Calm and respectful tone",
            "Logical structure",
            "Professional closing",
          ],
        },
        {
          id: "roleplay_score",
          type: "radioScore",
          label: "Role-play score",
          max: 5,
          choices: [
            { label: "5 – Strong control & structure", value: 5 },
            { label: "3 – Adequate", value: 3 },
            { label: "1 – Weak", value: 1 },
            { label: "0 – Not performed / failed", value: 0 },
          ],
        },
      ],
    },
    {
      id: "notes",
      title: "Closing Notes",
      weight: 0,
      blurb: "Capture interviewer notes for audit and coaching.",
      items: [
        {
          id: "accent_clarity",
          type: "text",
          label: "Accent clarity",
          placeholder: "Short note…",
        },
        {
          id: "coachability",
          type: "text",
          label: "Coachability",
          placeholder: "Short note…",
        },
        {
          id: "red_flags",
          type: "textarea",
          label: "Red flags (if any)",
          placeholder: "List any concerns…",
        },
        {
          id: "recommended_track",
          type: "select",
          label: "Recommended track",
          options: ["Voice", "Non-Voice", "Training First"],
        },
        {
          id: "manual_override",
          type: "select",
          label: "Manual outcome override (optional)",
          options: ["—", OUTCOME.READY, OUTCOME.CONDITIONAL, OUTCOME.NOT_READY],
        },
      ],
    },
  ],
};

function computeTotals(values) {
  const sectionTotals = {};
  let total = 0;

  for (const s of INTERVIEW.sections) {
    let st = 0;
    for (const it of s.items) {
      if (it.type === "radioScore" || it.type === "qaScore") {
        const v = Number(values[it.id] ?? 0);
        st += clamp(v, 0, it.max ?? 999);
      }
    }
    sectionTotals[s.id] = st;
    total += st;
  }

  total = clamp(total, 0, 100);
  const autoOutcome = outcomeFromTotal(total);
  const override = values.manual_override;
  const outcome = override && override !== "—" ? override : autoOutcome;

  return { sectionTotals, total, autoOutcome, outcome };
}

function scoreBreakdownToChart(sectionTotals) {
  // consistent order
  const order = [
    { key: "opening", label: "Opening", max: 5 },
    { key: "comm", label: "Comm", max: 30 },
    { key: "behavior", label: "Behavior", max: 25 },
    { key: "bpo", label: "BPO", max: 15 },
    { key: "tech", label: "Tech", max: 10 },
    { key: "availability", label: "Avail", max: 10 },
    { key: "roleplay", label: "RolePlay", max: 5 },
  ];
  return order.map((o) => ({
    name: o.label,
    score: sectionTotals[o.key] ?? 0,
    max: o.max,
  }));
}

function outcomeHint(autoOutcome, override) {
  if (!override || override === "—") return null;
  return override === autoOutcome
    ? "Override matches auto outcome."
    : "Override differs from auto outcome — ensure notes justify the decision.";
}

function MetallicBrandStrip() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div
        className="absolute inset-0 opacity-[0.9]"
        style={{
          background:
            "radial-gradient(1200px 300px at 15% 0%, rgba(212,175,55,0.45), transparent 60%), radial-gradient(900px 280px at 85% 20%, rgba(0,112,192,0.22), transparent 55%), linear-gradient(135deg, rgba(0,74,153,0.12), rgba(212,175,55,0.10))",
        }}
      />
      <div className="relative flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl border shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,74,153,0.95), rgba(0,112,192,0.92))",
            }}
          >
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ color: BRAND.ink }}
              >
                ICBM <span style={{ color: BRAND.blueDark }}>Talent</span>
                <span style={{ color: BRAND.gold }}>Gauge</span>
              </span>
              <Badge
                className="border"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(244,231,178,0.25))",
                  color: BRAND.blueDark,
                  borderColor: "rgba(212,175,55,0.35)",
                }}
              >
                SBTS | ICBM
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Interview scoring system for BPO agent readiness (Ready / Conditional /
              Not Ready)
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Metallic two-tone UI
          </Badge>
          <Badge variant="outline" className="gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            Coachable insights
          </Badge>
        </div>
      </div>
    </div>
  );
}

function DiverseHumansIllustration() {
  // Inline SVG: “confluence of diverse humans interacting” (abstract, modern, professional)
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-slate-50 shadow-sm">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(600px 220px at 20% 0%, rgba(0,112,192,0.18), transparent 60%), radial-gradient(500px 200px at 80% 20%, rgba(212,175,55,0.20), transparent 55%)",
        }}
      />
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: BRAND.blueDark }}>
              Collaboration Snapshot
            </div>
            <div className="text-xs text-muted-foreground">
              Diverse teams • Customer empathy • Operational excellence
            </div>
          </div>
          <div className="text-xs text-muted-foreground">ICBM TalentGauge</div>
        </div>

        <svg
          viewBox="0 0 980 320"
          className="mt-3 h-[180px] w-full"
          role="img"
          aria-label="Diverse humans interacting in a professional setting"
        >
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#EAF2FF" />
              <stop offset="1" stopColor="#FFF7DC" />
            </linearGradient>
            <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#D4AF37" stopOpacity="0.95" />
              <stop offset="1" stopColor="#F4E7B2" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#004A99" stopOpacity="0.95" />
              <stop offset="1" stopColor="#0070C0" stopOpacity="0.92" />
            </linearGradient>
            <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* background */}
          <rect x="0" y="0" width="980" height="320" rx="18" fill="url(#bg)" />
          <circle cx="130" cy="70" r="55" fill="#0070C0" opacity="0.10" />
          <circle cx="820" cy="80" r="70" fill="#D4AF37" opacity="0.12" />
          <path
            d="M60 250 C 200 180, 330 280, 480 230 C 620 185, 760 260, 920 210"
            stroke="#004A99"
            strokeOpacity="0.10"
            strokeWidth="18"
            fill="none"
            filter="url(#soft)"
          />

          {/* table */}
          <rect x="220" y="205" width="540" height="48" rx="14" fill="#0B1220" opacity="0.06" />
          <rect x="250" y="197" width="480" height="52" rx="16" fill="#FFFFFF" opacity="0.90" />
          <rect x="270" y="212" width="140" height="10" rx="5" fill="#0070C0" opacity="0.18" />
          <rect x="430" y="212" width="120" height="10" rx="5" fill="#D4AF37" opacity="0.22" />
          <rect x="570" y="212" width="130" height="10" rx="5" fill="#004A99" opacity="0.16" />

          {/* person 1 */}
          <circle cx="250" cy="140" r="22" fill="#8B5E3C" />
          <path d="M220 190 C 235 160, 265 160, 280 190" fill="url(#blue)" />
          <rect x="232" y="188" width="36" height="44" rx="10" fill="url(#blue)" />
          <circle cx="241" cy="137" r="3" fill="#0B1220" opacity="0.45" />
          <circle cx="259" cy="137" r="3" fill="#0B1220" opacity="0.45" />

          {/* person 2 */}
          <circle cx="420" cy="120" r="22" fill="#F2C9A0" />
          <path d="M390 170 C 405 140, 435 140, 450 170" fill="url(#metal)" />
          <rect x="402" y="168" width="36" height="50" rx="10" fill="url(#metal)" />
          <circle cx="411" cy="117" r="3" fill="#0B1220" opacity="0.45" />
          <circle cx="429" cy="117" r="3" fill="#0B1220" opacity="0.45" />

          {/* person 3 */}
          <circle cx="560" cy="128" r="22" fill="#4A2E2B" />
          <path d="M530 178 C 545 148, 575 148, 590 178" fill="#0B1220" opacity="0.12" />
          <rect x="542" y="176" width="36" height="52" rx="10" fill="#0B1220" opacity="0.18" />
          <circle cx="551" cy="125" r="3" fill="#0B1220" opacity="0.45" />
          <circle cx="569" cy="125" r="3" fill="#0B1220" opacity="0.45" />

          {/* person 4 */}
          <circle cx="720" cy="135" r="22" fill="#C58C5D" />
          <path d="M690 185 C 705 155, 735 155, 750 185" fill="url(#blue)" opacity="0.88" />
          <rect x="702" y="183" width="36" height="48" rx="10" fill="url(#blue)" opacity="0.88" />
          <circle cx="711" cy="132" r="3" fill="#0B1220" opacity="0.45" />
          <circle cx="729" cy="132" r="3" fill="#0B1220" opacity="0.45" />

          {/* chat bubbles */}
          <rect x="310" y="70" width="120" height="40" rx="14" fill="#FFFFFF" opacity="0.92" />
          <rect x="322" y="83" width="82" height="8" rx="4" fill="#004A99" opacity="0.20" />
          <rect x="322" y="95" width="62" height="8" rx="4" fill="#D4AF37" opacity="0.26" />

          <rect x="600" y="55" width="150" height="44" rx="14" fill="#FFFFFF" opacity="0.92" />
          <rect x="612" y="70" width="112" height="8" rx="4" fill="#0070C0" opacity="0.20" />
          <rect x="612" y="82" width="78" height="8" rx="4" fill="#004A99" opacity="0.16" />

          {/* center spark */}
          <circle cx="490" cy="80" r="10" fill="#D4AF37" opacity="0.55" />
          <circle cx="490" cy="80" r="26" fill="#D4AF37" opacity="0.10" />
        </svg>
      </div>
    </div>
  );
}

function SectionCard({ title, blurb, children, right }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {blurb ? <CardDescription>{blurb}</CardDescription> : null}
          </div>
          {right}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AnswerKeyChecklist({ options, valueMap, onChange }) {
  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-2 rounded-xl border bg-white/60 px-3 py-2 text-sm shadow-sm backdrop-blur hover:bg-white"
        >
          <Checkbox
            checked={!!valueMap[opt]}
            onCheckedChange={(v) => onChange(opt, !!v)}
          />
          <span className="text-slate-800">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ScoreRadio({ name, choices, value, onChange }) {
  return (
    <RadioGroup
      value={value == null ? "" : String(value)}
      onValueChange={(v) => onChange(Number(v))}
      className="grid gap-2"
    >
      {choices.map((c) => (
        <label
          key={c.value}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white/60 px-3 py-2 text-sm shadow-sm backdrop-blur hover:bg-white"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value={String(c.value)} />
            <span className="text-slate-800">{c.label}</span>
          </div>
          <span
            className="rounded-lg border px-2 py-0.5 text-xs font-semibold"
            style={{
              borderColor: "rgba(212,175,55,0.35)",
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.14), rgba(244,231,178,0.22))",
              color: BRAND.blueDark,
            }}
          >
            {c.value}
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}

function SectionTotalPill({ value, max }) {
  const pct = max ? clamp((value / max) * 100, 0, 100) : 0;
  const bar = `linear-gradient(90deg, rgba(0,112,192,0.28) ${pct}%, rgba(15,23,42,0.06) ${pct}%)`;
  return (
    <div
      className="min-w-[170px] rounded-xl border px-3 py-2"
      style={{ background: bar }}
    >
      <div className="text-xs text-muted-foreground">Section total</div>
      <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>
        {value} / {max}
      </div>
    </div>
  );
}

function OutcomePill({ outcome, total }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={badgeVariant(outcome)} className="text-xs">
        {outcome}
      </Badge>
      <div className="text-xs text-muted-foreground">Total: {total}/100</div>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">No candidates yet</CardTitle>
        <CardDescription>
          Create your first interview record, score it live, and auto-generate a
          dashboard outcome.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreate} className="gap-2">
          <FilePlus2 className="h-4 w-4" />
          New interview
        </Button>
      </CardContent>
    </Card>
  );
}

function PrintScorecard({ candidate, onClose }) {
  const ref = useRef(null);

  const handlePrint = () => {
    // Print only the dialog content by opening a new window
    const html = ref.current?.innerHTML || "";
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;
    w.document.write(`
      <html>
      <head>
        <title>ICBM TalentGauge Scorecard</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0B1220; }
          h1 { color: ${BRAND.blueDark}; margin: 0 0 6px 0; }
          h2 { color: ${BRAND.blue}; margin: 18px 0 8px; font-size: 14px; }
          .meta { font-size: 12px; color: #334155; margin-bottom: 16px; }
          .badge { display:inline-block; padding:6px 10px; border-radius: 999px; border:1px solid rgba(212,175,55,0.45); background: rgba(244,231,178,0.35); color:${BRAND.blueDark}; font-weight:700; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #E2E8F0; padding: 8px; vertical-align: top; }
          th { background: #F8FAFC; text-align: left; }
          .small { font-size: 11px; color: #475569; }
          .rule { margin-top: 14px; font-size: 12px; color: #334155; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <Dialog open={!!candidate} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>Printable Scorecard</span>
            <Button onClick={handlePrint} className="gap-2" size="sm">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
          <DialogDescription>
            Generates a clean print view for files and audit.
          </DialogDescription>
        </DialogHeader>

        <div ref={ref}>
          <h1>
            ICBM <span style={{ color: BRAND.blueDark }}>Talent</span>
            <span style={{ color: BRAND.gold }}>Gauge</span>
          </h1>
          <div className="meta">
            SBTS Group LLC | ICBM – Intelligent Capacity Building Model<br />
            STRICTLY CONFIDENTIAL – INTERNAL USE ONLY
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="badge">{candidate?.computed?.outcome}</span>
            <span className="small">Total: {candidate?.computed?.total}/100</span>
          </div>

          <h2>Candidate</h2>
          <table>
            <tbody>
              <tr>
                <th>Full Legal Name</th>
                <td>{candidate?.candidate?.fullName || ""}</td>
              </tr>
              <tr>
                <th>Agent Name</th>
                <td>{candidate?.candidate?.agentName || ""}</td>
              </tr>
              <tr>
                <th>Interview Date</th>
                <td>{candidate?.candidate?.interviewDate || ""}</td>
              </tr>
              <tr>
                <th>Interviewer</th>
                <td>{candidate?.candidate?.interviewer || ""}</td>
              </tr>
              <tr>
                <th>Track</th>
                <td>{candidate?.candidate?.track || ""}</td>
              </tr>
            </tbody>
          </table>

          <h2>Section Totals</h2>
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Opening</td>
                <td>{candidate?.computed?.sectionTotals?.opening ?? 0} / 5</td>
              </tr>
              <tr>
                <td>Communication</td>
                <td>{candidate?.computed?.sectionTotals?.comm ?? 0} / 30</td>
              </tr>
              <tr>
                <td>Behavioral</td>
                <td>{candidate?.computed?.sectionTotals?.behavior ?? 0} / 25</td>
              </tr>
              <tr>
                <td>BPO Readiness</td>
                <td>{candidate?.computed?.sectionTotals?.bpo ?? 0} / 15</td>
              </tr>
              <tr>
                <td>Technical</td>
                <td>{candidate?.computed?.sectionTotals?.tech ?? 0} / 10</td>
              </tr>
              <tr>
                <td>Availability</td>
                <td>{candidate?.computed?.sectionTotals?.availability ?? 0} / 10</td>
              </tr>
              <tr>
                <td>Role-Play</td>
                <td>{candidate?.computed?.sectionTotals?.roleplay ?? 0} / 5</td>
              </tr>
            </tbody>
          </table>

          <h2>Interview Notes</h2>
          <table>
            <tbody>
              <tr>
                <th>Availability</th>
                <td>{candidate?.values?.availability_text || ""}</td>
              </tr>
              <tr>
                <th>Accent clarity</th>
                <td>{candidate?.values?.accent_clarity || ""}</td>
              </tr>
              <tr>
                <th>Coachability</th>
                <td>{candidate?.values?.coachability || ""}</td>
              </tr>
              <tr>
                <th>Red flags</th>
                <td>{candidate?.values?.red_flags || ""}</td>
              </tr>
              <tr>
                <th>Recommended track</th>
                <td>{candidate?.values?.recommended_track || ""}</td>
              </tr>
            </tbody>
          </table>

          <div className="rule">
            Outcome rules: READY (80–100), CONDITIONAL (60–79), NOT READY (&lt;60).
            Hard rule: NOT READY candidates must never be placed into live BPO
            environments.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const [records, setRecords] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("ALL");
  const [printCandidate, setPrintCandidate] = useState(null);

  // Load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecords(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  // theme
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  const active = useMemo(
    () => records.find((r) => r.id === activeId) || null,
    [records, activeId]
  );

  const computed = useMemo(() => {
    if (!active) return null;
    return computeTotals(active.values || {});
  }, [active]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .map((r) => ({
        ...r,
        computed: computeTotals(r.values || {}),
      }))
      .filter((r) => {
        const name = (r.candidate?.fullName || "").toLowerCase();
        const agent = (r.candidate?.agentName || "").toLowerCase();
        const interviewer = (r.candidate?.interviewer || "").toLowerCase();
        const matchText =
          !q || name.includes(q) || agent.includes(q) || interviewer.includes(q);
        const matchOutcome =
          filterOutcome === "ALL" ||
          (r.computed?.outcome || "") === filterOutcome;
        return matchText && matchOutcome;
      })
      .sort((a, b) =>
        String(b.candidate?.interviewDate || "").localeCompare(
          String(a.candidate?.interviewDate || "")
        )
      );
  }, [records, search, filterOutcome]);

  const chartData = useMemo(() => {
    const base = filtered.map((r) => ({
      name: (r.candidate?.fullName || "").split(" ")[0] || "Candidate",
      total: r.computed?.total || 0,
      outcome: r.computed?.outcome || "",
    }));
    // show only first 10 for readability
    return base.slice(0, 10);
  }, [filtered]);

  const summary = useMemo(() => {
    const totals = filtered.map((r) => r.computed?.total || 0);
    const avg = totals.length
      ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) /
        10
      : 0;
    const ready = filtered.filter((r) => r.computed?.outcome === OUTCOME.READY)
      .length;
    const conditional = filtered.filter(
      (r) => r.computed?.outcome === OUTCOME.CONDITIONAL
    ).length;
    const notReady = filtered.filter(
      (r) => r.computed?.outcome === OUTCOME.NOT_READY
    ).length;
    return { avg, ready, conditional, notReady, count: filtered.length };
  }, [filtered]);

  function createNew() {
    const id = uid();
    const rec = {
      id,
      createdAt: new Date().toISOString(),
      candidate: {
        fullName: "",
        agentName: "",
        interviewDate: nowIsoDate(),
        interviewer: "",
        track: "Voice",
      },
      values: {
        opening_checks: {},
        opening_score: 0,
      },
    };
    setRecords((prev) => [rec, ...prev]);
    setActiveId(id);
  }

  function updateCandidate(field, val) {
    if (!active) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === active.id
          ? { ...r, candidate: { ...r.candidate, [field]: val } }
          : r
      )
    );
  }

  function updateValue(id, val) {
    if (!active) return;
    setRecords((prev) =>
      prev.map((r) => (r.id === active.id ? { ...r, values: { ...r.values, [id]: val } } : r))
    );
  }

  function updateCheckMap(id, key, checked) {
    const map = (active?.values?.[id] || {}) as any;
    const next = { ...map, [key]: checked };
    updateValue(id, next);
  }

  function removeRecord(id) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function exportCsv() {
    if (!records.length) return;
    const rows = records.map((r) => {
      const c = r.candidate || {};
      const comp = computeTotals(r.values || {});
      return {
        fullName: c.fullName,
        agentName: c.agentName,
        interviewDate: c.interviewDate,
        interviewer: c.interviewer,
        track: c.track,
        total: comp.total,
        outcome: comp.outcome,
        autoOutcome: comp.autoOutcome,
        opening: comp.sectionTotals.opening || 0,
        comm: comp.sectionTotals.comm || 0,
        behavior: comp.sectionTotals.behavior || 0,
        bpo: comp.sectionTotals.bpo || 0,
        tech: comp.sectionTotals.tech || 0,
        availability: comp.sectionTotals.availability || 0,
        roleplay: comp.sectionTotals.roleplay || 0,
      };
    });
    downloadText(
      `ICBM_TalentGauge_Export_${nowIsoDate()}.csv`,
      toCsv(rows),
      "text/csv"
    );
  }

  function openPrint(rec) {
    setPrintCandidate({ ...rec, computed: computeTotals(rec.values || {}) });
  }

  return (
    <TooltipProvider>
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(900px 420px at 10% 0%, rgba(0,112,192,0.12), transparent 60%), radial-gradient(900px 420px at 90% 10%, rgba(212,175,55,0.14), transparent 55%), linear-gradient(180deg, rgba(2,6,23,0.02), rgba(2,6,23,0.00))",
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <MetallicBrandStrip />
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 rounded-2xl border bg-white/60 px-3 py-2 shadow-sm backdrop-blur">
                <span className="text-xs text-muted-foreground">Dark</span>
                <Switch checked={dark} onCheckedChange={setDark} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-2xl">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Data</DropdownMenuLabel>
                  <DropdownMenuItem onClick={exportCsv}>
                    Export candidates (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      setRecords([]);
                      setActiveId(null);
                    }}
                    className="text-red-600"
                  >
                    Clear local data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={createNew}
                className="gap-2 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,74,153,0.95), rgba(0,112,192,0.92))",
                }}
              >
                <FilePlus2 className="h-4 w-4" />
                New interview
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* Left rail */}
            <div className="grid gap-6">
              <DiverseHumansIllustration />

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </CardTitle>
                    <Badge variant="outline">{summary.count} records</Badge>
                  </div>
                  <CardDescription>
                    Quick view of readiness distribution and recent totals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="rounded-2xl">
                      <CardContent className="pt-5">
                        <div className="text-xs text-muted-foreground">Avg score</div>
                        <div className="text-2xl font-semibold">{summary.avg}</div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                      <CardContent className="pt-5">
                        <div className="text-xs text-muted-foreground">Ready</div>
                        <div className="text-2xl font-semibold">{summary.ready}</div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                      <CardContent className="pt-5">
                        <div className="text-xs text-muted-foreground">Conditional</div>
                        <div className="text-2xl font-semibold">{summary.conditional}</div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                      <CardContent className="pt-5">
                        <div className="text-xs text-muted-foreground">Not Ready</div>
                        <div className="text-2xl font-semibold">{summary.notReady}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="h-[170px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <ReTooltip />
                        <Bar dataKey="total" fill={BRAND.blue} radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search candidates / interviewer"
                        className="pl-9 rounded-2xl"
                      />
                    </div>
                    <Select value={filterOutcome} onValueChange={setFilterOutcome}>
                      <SelectTrigger className="w-[140px] rounded-2xl">
                        <SelectValue placeholder="Outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value={OUTCOME.READY}>Ready</SelectItem>
                        <SelectItem value={OUTCOME.CONDITIONAL}>Conditional</SelectItem>
                        <SelectItem value={OUTCOME.NOT_READY}>Not Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    {filtered.length ? (
                      filtered.slice(0, 10).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setActiveId(r.id)}
                          className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-left shadow-sm transition hover:bg-white/70 ${
                            r.id === activeId ? "bg-white" : "bg-white/50"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {r.candidate?.fullName || "(Unnamed candidate)"}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {r.candidate?.interviewDate || ""} • {r.candidate?.interviewer || "—"}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <Badge variant={badgeVariant(r.computed?.outcome)} className="text-[10px]">
                              {r.computed?.outcome}
                            </Badge>
                            <div className="text-xs text-muted-foreground">{r.computed?.total}/100</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No matches.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main */}
            <div className="grid gap-6">
              {!active ? (
                <EmptyState onCreate={createNew} />
              ) : (
                <>
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <UserRound className="h-4 w-4" />
                            Candidate & Outcome
                          </CardTitle>
                          <CardDescription>
                            Fill candidate details, score the interview, and review the auto outcome.
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <OutcomePill outcome={computed?.outcome} total={computed?.total ?? 0} />
                          <Button variant="outline" size="sm" className="gap-2 rounded-2xl" onClick={() => openPrint({ ...active })}>
                            <Printer className="h-4 w-4" />
                            Print
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="rounded-2xl">
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Record</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => removeRecord(active.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Full legal name</Label>
                          <Input
                            value={active.candidate?.fullName || ""}
                            onChange={(e) => updateCandidate("fullName", e.target.value)}
                            placeholder="First Middle Last"
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Agent name (if selected)</Label>
                          <Input
                            value={active.candidate?.agentName || ""}
                            onChange={(e) => updateCandidate("agentName", e.target.value)}
                            placeholder="Agent name"
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Interview date</Label>
                          <Input
                            type="date"
                            value={active.candidate?.interviewDate || nowIsoDate()}
                            onChange={(e) => updateCandidate("interviewDate", e.target.value)}
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Interviewer</Label>
                          <Input
                            value={active.candidate?.interviewer || ""}
                            onChange={(e) => updateCandidate("interviewer", e.target.value)}
                            placeholder="Interviewer name"
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Track target</Label>
                          <Select
                            value={active.candidate?.track || "Voice"}
                            onValueChange={(v) => updateCandidate("track", v)}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Track" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Voice">Voice</SelectItem>
                              <SelectItem value="Non-Voice">Non-Voice</SelectItem>
                              <SelectItem value="Technical">Technical</SelectItem>
                              <SelectItem value="Non-Technical">Non-Technical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Manual outcome override (optional)</Label>
                          <Select
                            value={active.values?.manual_override || "—"}
                            onValueChange={(v) => updateValue("manual_override", v)}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="—">—</SelectItem>
                              <SelectItem value={OUTCOME.READY}>READY</SelectItem>
                              <SelectItem value={OUTCOME.CONDITIONAL}>CONDITIONAL</SelectItem>
                              <SelectItem value={OUTCOME.NOT_READY}>NOT READY</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-muted-foreground">
                            Auto outcome: <b>{computed?.autoOutcome}</b>. {outcomeHint(computed?.autoOutcome, active.values?.manual_override)}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                        <Card className="rounded-2xl">
                          <CardHeader>
                            <CardTitle className="text-sm">Score breakdown</CardTitle>
                            <CardDescription>Section totals toward 100 points</CardDescription>
                          </CardHeader>
                          <CardContent className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={scoreBreakdownToChart(computed?.sectionTotals || {})}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 30]} tick={{ fontSize: 11 }} />
                                <ReTooltip />
                                <Bar dataKey="score" fill={BRAND.gold} radius={[10, 10, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <div className="grid gap-3">
                          <Card className="rounded-2xl">
                            <CardContent className="pt-5">
                              <div className="text-xs text-muted-foreground">Total</div>
                              <div className="text-3xl font-semibold" style={{ color: BRAND.blueDark }}>
                                {computed?.total ?? 0}
                                <span className="text-base text-muted-foreground">/100</span>
                              </div>
                              <div className="mt-2">
                                <Badge variant={badgeVariant(computed?.outcome)}>
                                  {computed?.outcome}
                                </Badge>
                              </div>
                              <div className="mt-3 text-xs text-muted-foreground">
                                Rules: READY (80–100), CONDITIONAL (60–79), NOT READY (&lt;60).
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-2xl border-amber-200/60 bg-amber-50/40">
                            <CardContent className="pt-5">
                              <div className="text-xs font-semibold" style={{ color: BRAND.blueDark }}>
                                Hard Rule
                              </div>
                              <div className="mt-1 text-sm text-slate-700">
                                NOT READY candidates must never be placed into live BPO environments.
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="interview" className="w-full">
                    <TabsList className="rounded-2xl">
                      <TabsTrigger value="interview" className="rounded-2xl">Interview Form</TabsTrigger>
                      <TabsTrigger value="review" className="rounded-2xl">Review & Audit</TabsTrigger>
                    </TabsList>

                    <TabsContent value="interview" className="mt-4 grid gap-6">
                      {INTERVIEW.sections
                        .filter((s) => s.id !== "notes")
                        .map((s) => {
                          const max = s.weight;
                          const st = computed?.sectionTotals?.[s.id] ?? 0;
                          const right = max ? <SectionTotalPill value={st} max={max} /> : null;

                          return (
                            <SectionCard
                              key={s.id}
                              title={`${s.title} ${max ? `(${max} pts)` : ""}`}
                              blurb={s.blurb}
                              right={right}
                            >
                              <div className="grid gap-6">
                                {s.items.map((it) => {
                                  if (it.type === "checks") {
                                    return (
                                      <div key={it.id} className="grid gap-2">
                                        <div className="text-sm font-semibold">{it.label}</div>
                                        <AnswerKeyChecklist
                                          options={it.options}
                                          valueMap={active.values?.[it.id] || {}}
                                          onChange={(k, v) => updateCheckMap(it.id, k, v)}
                                        />
                                      </div>
                                    );
                                  }

                                  if (it.type === "radioScore") {
                                    return (
                                      <div key={it.id} className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                          <div className="text-sm font-semibold">{it.label}</div>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Badge variant="outline" className="cursor-help">Max {it.max}</Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>{it.tip || ""}</TooltipContent>
                                          </Tooltip>
                                        </div>
                                        <ScoreRadio
                                          name={it.id}
                                          choices={it.choices}
                                          value={active.values?.[it.id] ?? 0}
                                          onChange={(v) => updateValue(it.id, v)}
                                        />
                                      </div>
                                    );
                                  }

                                  if (it.type === "qaScore") {
                                    return (
                                      <div key={it.id} className="grid gap-3">
                                        <div className="rounded-2xl border bg-white/50 p-4">
                                          <div className="text-xs font-semibold" style={{ color: BRAND.blueDark }}>
                                            Exact question
                                          </div>
                                          <div className="mt-1 text-sm text-slate-800">{it.question}</div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2">
                                          <div className="grid gap-2">
                                            <div className="text-sm font-semibold">{it.answerKeyTitle}</div>
                                            <AnswerKeyChecklist
                                              options={it.answerKey}
                                              valueMap={active.values?.[`${it.id}__checks`] || {}}
                                              onChange={(k, v) => updateCheckMap(`${it.id}__checks`, k, v)}
                                            />
                                          </div>
                                          <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                              <div className="text-sm font-semibold">Score selection</div>
                                              <Badge variant="outline">Max {it.max}</Badge>
                                            </div>
                                            <ScoreRadio
                                              name={it.id}
                                              choices={it.choices}
                                              value={active.values?.[it.id] ?? 0}
                                              onChange={(v) => updateValue(it.id, v)}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (it.type === "text") {
                                    return (
                                      <div key={it.id} className="grid gap-2">
                                        <Label>{it.label}</Label>
                                        <Input
                                          value={active.values?.[it.id] || ""}
                                          onChange={(e) => updateValue(it.id, e.target.value)}
                                          placeholder={it.placeholder}
                                          className="rounded-2xl"
                                        />
                                      </div>
                                    );
                                  }

                                  if (it.type === "textarea") {
                                    return (
                                      <div key={it.id} className="grid gap-2">
                                        <Label>{it.label}</Label>
                                        <Textarea
                                          value={active.values?.[it.id] || ""}
                                          onChange={(e) => updateValue(it.id, e.target.value)}
                                          placeholder={it.placeholder}
                                          className="min-h-[110px] rounded-2xl"
                                        />
                                      </div>
                                    );
                                  }

                                  if (it.type === "select") {
                                    return (
                                      <div key={it.id} className="grid gap-2">
                                        <Label>{it.label}</Label>
                                        <Select
                                          value={active.values?.[it.id] || (it.options?.[0] ?? "")}
                                          onValueChange={(v) => updateValue(it.id, v)}
                                        >
                                          <SelectTrigger className="rounded-2xl">
                                            <SelectValue placeholder={it.label} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {it.options.map((o) => (
                                              <SelectItem key={o} value={o}>
                                                {o}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    );
                                  }

                                  return null;
                                })}
                              </div>
                            </SectionCard>
                          );
                        })}

                      <SectionCard title="Closing Notes" blurb="Capture audit-ready notes and track recommendation.">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Availability (days/hours)</Label>
                            <Input
                              value={active.values?.availability_text || ""}
                              onChange={(e) => updateValue("availability_text", e.target.value)}
                              placeholder="E.g., Mon–Fri 9am–5pm; weekends open; can do nights…"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Recommended track</Label>
                            <Select
                              value={active.values?.recommended_track || "Voice"}
                              onValueChange={(v) => updateValue("recommended_track", v)}
                            >
                              <SelectTrigger className="rounded-2xl">
                                <SelectValue placeholder="Track" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Voice">Voice</SelectItem>
                                <SelectItem value="Non-Voice">Non-Voice</SelectItem>
                                <SelectItem value="Training First">Training First</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Accent clarity</Label>
                            <Input
                              value={active.values?.accent_clarity || ""}
                              onChange={(e) => updateValue("accent_clarity", e.target.value)}
                              placeholder="Short note…"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Coachability</Label>
                            <Input
                              value={active.values?.coachability || ""}
                              onChange={(e) => updateValue("coachability", e.target.value)}
                              placeholder="Short note…"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="md:col-span-2 grid gap-2">
                            <Label>Red flags (if any)</Label>
                            <Textarea
                              value={active.values?.red_flags || ""}
                              onChange={(e) => updateValue("red_flags", e.target.value)}
                              placeholder="List any concerns…"
                              className="min-h-[120px] rounded-2xl"
                            />
                          </div>
                        </div>
                      </SectionCard>
                    </TabsContent>

                    <TabsContent value="review" className="mt-4 grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Audit Summary</CardTitle>
                          <CardDescription>
                            Review auto outcome vs override and finalize record.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">Auto outcome: {computed?.autoOutcome}</Badge>
                            <Badge variant={badgeVariant(computed?.outcome)}>
                              Final: {computed?.outcome}
                            </Badge>
                            <Badge variant="outline">Total: {computed?.total}/100</Badge>
                          </div>

                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Section</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[
                                ["Opening", computed?.sectionTotals?.opening ?? 0, 5],
                                ["Communication", computed?.sectionTotals?.comm ?? 0, 30],
                                ["Behavioral", computed?.sectionTotals?.behavior ?? 0, 25],
                                ["BPO Readiness", computed?.sectionTotals?.bpo ?? 0, 15],
                                ["Technical", computed?.sectionTotals?.tech ?? 0, 10],
                                ["Availability", computed?.sectionTotals?.availability ?? 0, 10],
                                ["Role-Play", computed?.sectionTotals?.roleplay ?? 0, 5],
                              ].map(([name, v, max]) => (
                                <TableRow key={name}>
                                  <TableCell>{name}</TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold" style={{ color: BRAND.blueDark }}>
                                      {v}
                                    </span>
                                    <span className="text-muted-foreground"> / {max}</span>
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell className="font-semibold">TOTAL</TableCell>
                                <TableCell className="text-right font-semibold">{computed?.total}/100</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>

                          <div className="rounded-2xl border bg-white/60 p-4 text-sm text-slate-700">
                            <div className="font-semibold" style={{ color: BRAND.blueDark }}>
                              Placement recommendation
                            </div>
                            <div className="mt-1">
                              Track: <b>{active.values?.recommended_track || "—"}</b> • Outcome: <b>{computed?.outcome}</b>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Use this review tab for supervisor sign-off. Export CSV for batch reporting.
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-200/60 bg-amber-50/40">
                        <CardHeader>
                          <CardTitle className="text-base">Compliance Notes</CardTitle>
                          <CardDescription>
                            Keep decisions objective and documented.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-700">
                          <ul className="list-disc pl-5">
                            <li>
                              Score using observed behaviors; avoid bias and assumptions.
                            </li>
                            <li>
                              If overriding the auto outcome, document why in red flags / coachability notes.
                            </li>
                            <li>
                              NOT READY candidates must never enter live BPO environments.
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} SBTS Group LLC • ICBM – Intelligent Capacity Building Model • ICBM TalentGauge
          </div>
        </div>

        <PrintScorecard candidate={printCandidate} onClose={() => setPrintCandidate(null)} />
      </div>
    </TooltipProvider>
  );
}

export default App;
