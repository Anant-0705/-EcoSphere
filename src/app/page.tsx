"use client"

import { motion } from "framer-motion"
import { Play, Search, Bell, ChevronDown, CheckCircle2, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body relative overflow-x-hidden">
      {/* Background Video for Hero */}
      <div className="absolute inset-0 w-full h-screen z-0 overflow-hidden pointer-events-none">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5">
        <div className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          ✦ EcoSphere
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        </div>
        <Link href="/login">
          <Button className="rounded-full px-5 text-sm font-medium">Login</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center w-full pt-12 md:pt-20 px-6 pb-20">
        
        {/* Badge */}
      

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center font-display text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-3xl"
        >
          The Future of <em className="italic">Smarter</em> ESG Compliance
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-center text-base md:text-lg text-muted-foreground max-w-[650px] leading-relaxed font-body"
        >
          Automate your carbon tracking, empower your workforce with gamification, and generate audit-proof reports instantly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex items-center gap-3"
        >
          <Link href="/login">
            <Button className="rounded-full px-6 py-5 text-sm font-medium font-body h-auto">
              LOGIN
            </Button>
          </Link>
          <button className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-background shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-background/80 transition-colors">
            <Play className="h-4 w-4 fill-foreground text-foreground ml-0.5" />
          </button>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 w-full max-w-5xl"
        >
          <div 
            className="rounded-2xl overflow-hidden p-3 md:p-4 backdrop-blur-md"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: 'var(--shadow-dashboard)'
            }}
          >
            {/* Dashboard Internals */}
            <div className="flex h-[500px] w-full rounded-xl bg-background overflow-hidden border border-border shadow-sm text-[11px] select-none pointer-events-none font-body">
              {/* Sidebar */}
              <div className="w-40 border-r border-border bg-gray-50/50 flex flex-col">
                <div className="flex items-center gap-2 p-4 font-semibold text-sm border-b border-border">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">E</div>
                  EcoSphere
                  <ChevronDown className="h-3 w-3 ml-auto text-muted-foreground" />
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between rounded bg-white px-2 py-1.5 font-medium shadow-sm border border-border/50">
                    Dashboard
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">
                    Environmental
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-medium text-foreground">3</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">Gamification</div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">
                    Governance <ChevronDown className="h-3 w-3" />
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">Reports</div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">Settings</div>
                </div>
                <div className="mt-4 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Integrations</div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">Data Sources</div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">Webhooks</div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">API Keys</div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col bg-secondary/30 relative">
                {/* Topbar */}
                <div className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
                  <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-muted-foreground w-64">
                    <Search className="h-3 w-3" />
                    <span>Search...</span>
                    <span className="ml-auto text-[9px]">⌘K</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-medium text-primary cursor-pointer hover:underline">View Reports</div>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">EA</div>
                  </div>
                </div>

                {/* Dashboard Body */}
                <div className="p-6 flex-1 overflow-auto">
                  <h2 className="text-sm font-semibold text-foreground mb-4">Welcome, EcoSphere Admin</h2>
                  
                  {/* Action Row */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="rounded-full bg-accent text-accent-foreground px-4 py-1.5 font-medium shadow-sm">Upload CSV</div>
                    <div className="rounded-full bg-white border border-border px-4 py-1.5 font-medium hover:bg-gray-50">Connect Gmail</div>
                    <div className="rounded-full bg-white border border-border px-4 py-1.5 font-medium hover:bg-gray-50">View Leaderboard</div>
                    <div className="rounded-full bg-white border border-border px-4 py-1.5 font-medium hover:bg-gray-50">Generate PDF</div>
                    <div className="rounded-full bg-white border border-border px-4 py-1.5 font-medium hover:bg-gray-50">Assign Policy</div>
                    <div className="ml-auto text-muted-foreground font-medium underline cursor-pointer">Customize</div>
                  </div>

                  {/* Cards Row */}
                  <div className="flex gap-4 mb-6">
                    {/* Balance Card */}
                    <div className="flex-1 rounded-xl bg-white border border-border p-5 shadow-sm flex flex-col relative overflow-hidden">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1 relative z-10">
                        Overall ESG Score <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-semibold text-foreground relative z-10">
                        84<span className="text-xs text-muted-foreground">.5</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3 relative z-10">
                        <span className="text-muted-foreground">Last 30 Days</span>
                        <span className="text-emerald-600 font-medium">+2.4</span>
                      </div>
                      {/* SVG Chart */}
                      <div className="absolute bottom-0 left-0 w-full h-20 pointer-events-none">
                        <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full">
                          <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,80 L0,40 C50,40 80,60 120,50 C180,35 220,70 280,45 C330,25 360,15 400,10 L400,80 Z"
                            fill="url(#chart-gradient)"
                          />
                          <path
                            d="M0,40 C50,40 80,60 120,50 C180,35 220,70 280,45 C330,25 360,15 400,10"
                            fill="none"
                            stroke="hsl(var(--accent))"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Accounts Card */}
                    <div className="flex-1 rounded-xl bg-white border border-border p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold text-foreground text-xs">Emissions by Scope</div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MoreVertical className="h-3 w-3" />
                        </div>
                      </div>
                      <div className="space-y-3 flex flex-col h-full">
                        <div className="flex justify-between items-center text-xs text-foreground font-medium">
                          <span className="text-muted-foreground">Scope 1</span>
                          42.5 mtCO2e
                        </div>
                        <div className="flex justify-between items-center text-xs text-foreground font-medium">
                          <span className="text-muted-foreground">Scope 2</span>
                          128.0 mtCO2e
                        </div>
                        <div className="flex justify-between items-center text-xs text-foreground font-medium">
                          <span className="text-muted-foreground">Scope 3</span>
                          4,592.8 mtCO2e
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="rounded-xl bg-white border border-border p-5 shadow-sm">
                    <h3 className="font-semibold text-foreground text-xs mb-4">Recent Uploads</h3>
                    <div className="w-full">
                      <div className="flex items-center text-muted-foreground font-medium border-b border-border pb-2 mb-2">
                        <div className="flex-1">Date</div>
                        <div className="flex-[2]">Source</div>
                        <div className="flex-1 text-right">Items Parsed</div>
                        <div className="flex-1 text-right">Status</div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center border-b border-gray-50 pb-2">
                          <div className="flex-1 text-muted-foreground">Today</div>
                          <div className="flex-[2] font-medium text-foreground">AWS Invoice (Oct)</div>
                          <div className="flex-1 text-right font-medium text-foreground">42 Items</div>
                          <div className="flex-1 text-right">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm font-medium">Processed</span>
                          </div>
                        </div>
                        <div className="flex items-center border-b border-gray-50 pb-2">
                          <div className="flex-1 text-muted-foreground">Yesterday</div>
                          <div className="flex-[2] font-medium text-foreground">PG&E Utility Bill</div>
                          <div className="flex-1 text-right font-medium text-foreground">1 Item</div>
                          <div className="flex-1 text-right">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm font-medium">Processed</span>
                          </div>
                        </div>
                        <div className="flex items-center border-b border-gray-50 pb-2">
                          <div className="flex-1 text-muted-foreground">Oct 12</div>
                          <div className="flex-[2] font-medium text-foreground">Delta Flights (Q3)</div>
                          <div className="flex-1 text-right font-medium text-foreground">85 Items</div>
                          <div className="flex-1 text-right">
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm font-medium">Processing</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 text-muted-foreground">Oct 10</div>
                          <div className="flex-[2] font-medium text-foreground">Office Supplies CSV</div>
                          <div className="flex-1 text-right font-medium text-foreground">1,240 Items</div>
                          <div className="flex-1 text-right">
                            <span className="text-gray-600 bg-gray-50 px-2 py-0.5 rounded-sm font-medium">Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Sections Below (EcoSphere Context) */}
      <section className="relative z-20 bg-white py-24 border-t border-border" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-foreground mb-4">How EcoSphere Works</h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              We translate your business data into actionable ESG insights using industry-leading AI and calculation models.
            </p>
          </div>

          <div className="space-y-12">
            {/* Card 1: Automated Ingestion */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden font-body">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center">
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6 leading-tight">
                    Automate Data Ingestion <br /> In Seconds
                  </h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Connect your Gmail or upload raw invoices directly. Our LLM-powered ingestion service parses unstructured documents automatically, saving you hours of manual entry.
                  </p>
                  <div>
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-8 py-6 text-base shadow-sm">
                      Try Ingestion
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50/50 p-8 lg:p-12 border-l border-gray-100 flex items-center justify-center">
                  <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="h-10 w-10 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Upload your invoice</div>
                        <div className="text-[10px] text-gray-400">PDF, JPG or PNG. Max 5MB</div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-8 bg-gray-50 rounded border border-gray-100 w-full"></div>
                      <div className="h-8 bg-gray-50 rounded border border-gray-100 w-3/4"></div>
                      <div className="h-8 bg-gray-50 rounded border border-gray-100 w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50/30 p-6 flex flex-col md:flex-row items-center justify-around gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Supports 50+ formats</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> GPT-5 Powered Parsing</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Auto-sync with Gmail</div>
              </div>
            </div>

            {/* Card 2: Smart Calculation */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden font-body">
              <div className="flex flex-col lg:flex-row-reverse">
                <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center">
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6 leading-tight">
                    Smart Real-Time <br /> CO2e Calculation
                  </h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    We map your parsed line items directly to standardized Emission Factors (Scope 1, 2, and 3) to accurately calculate your carbon footprint without spreadsheets.
                  </p>
                  <div>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 py-6 text-base shadow-sm">
                      View Models
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50/50 p-8 lg:p-12 border-r border-gray-100 flex items-center justify-center">
                  <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div className="text-sm font-semibold text-gray-900">Emission Factor Match</div>
                      <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">99% Confidence</div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-500">Source Item</span>
                        <span className="font-medium text-gray-900">Grid Electricity</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-500">Quantity</span>
                        <span className="font-medium text-gray-900">450 kWh</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">CO2e Result</span>
                        <span className="font-bold text-emerald-600">0.25 mtCO2e</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50/30 p-6 flex flex-col md:flex-row items-center justify-around gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> EPA & DEFRA standards</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Scope 1, 2, 3 Tracking</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant verification</div>
              </div>
            </div>

            {/* Card 3: Action & Gamification */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden font-body">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center">
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6 leading-tight">
                    Drive Engagement With <br /> Gamification
                  </h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Transform ESG compliance into an engaging team sport. Reward sustainable actions with XP, badges, and tangible rewards in your company's custom shop.
                  </p>
                  <div>
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-8 py-6 text-base shadow-sm">
                      Explore Rewards
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50/50 p-8 lg:p-12 border-l border-gray-100 flex items-center justify-center">
                  <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-semibold text-gray-900">Leaderboard</div>
                      <div className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">Weekly Sprint</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded bg-purple-50 border border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700">1</div>
                          <span className="text-sm font-medium text-gray-900">Engineering</span>
                        </div>
                        <span className="text-sm font-bold text-purple-700">4,500 XP</span>
                      </div>
                      <div className="flex items-center justify-between p-2 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">2</div>
                          <span className="text-sm font-medium text-gray-600">Marketing</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">3,200 XP</span>
                      </div>
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">3</div>
                          <span className="text-sm font-medium text-gray-600">Operations</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">2,950 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50/30 p-6 flex flex-col md:flex-row items-center justify-around gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Custom challenges</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Unlockable badges</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Redeemable rewards</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 bg-white py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 font-body">
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col md:flex-row items-center relative">
            {/* Wavy background graphic on the left */}
            <div className="absolute left-0 top-0 w-1/2 h-full pointer-events-none opacity-40">
              <svg viewBox="0 0 400 400" className="w-full h-full text-indigo-500 stroke-current" fill="none" strokeWidth="0.5">
                <path d="M-100,200 C50,50 150,350 400,200 C500,100 600,300 800,200" opacity="0.2" />
                <path d="M-100,220 C60,60 160,360 400,220 C510,110 610,310 800,220" opacity="0.4" />
                <path d="M-100,240 C70,70 170,370 400,240 C520,120 620,320 800,240" opacity="0.6" />
                <path d="M-100,260 C80,80 180,380 400,260 C530,130 630,330 800,260" opacity="0.8" />
                <path d="M-100,280 C90,90 190,390 400,280 C540,140 640,340 800,280" opacity="1" />
              </svg>
            </div>
            
            <div className="w-full md:w-1/2 p-12 md:p-20 relative z-10" />
            
            <div className="w-full md:w-1/2 p-12 md:p-20 relative z-10 text-left">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4 leading-tight">
                Get Started with <br /> EcoSphere
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm">
                Join modern companies using EcoSphere to automate their ESG compliance and drive sustainable action.
              </p>
              <Link href="/login">
                <Button className="bg-indigo-400 hover:bg-indigo-500 text-white rounded-full px-8 py-6 text-base shadow-sm">
                  Try it Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a2e1f] text-emerald-100/70 font-body py-16 px-6 border-t border-emerald-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-white font-semibold text-lg mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-white text-xs">✦</div>
              EcoSphere
            </div>
            <p className="text-sm text-emerald-100/60 leading-relaxed mb-6 max-w-xs">
              Automate your ESG compliance, track carbon emissions, and engage employees with intelligent gamification.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-pink-600 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">ESG Guides</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Carbon Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Features</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Data Ingestion</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Emission Calculation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Gamification</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Reporting</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Audit Logs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div>Copyright © 2026 EcoSphere. All right reserved.</div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-100 text-black">
              <svg className="w-4 h-4" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              <div className="flex flex-col"><span className="text-[8px] font-medium leading-none">Download on the</span><span className="text-xs font-bold leading-none">App Store</span></div>
            </div>
            <div className="bg-white rounded px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-100 text-black">
              <svg className="w-4 h-4" viewBox="0 0 512 512"><path fill="currentColor" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
              <div className="flex flex-col"><span className="text-[8px] font-medium leading-none">GET IT ON</span><span className="text-xs font-bold leading-none">Google Play</span></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
