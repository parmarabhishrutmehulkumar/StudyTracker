'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  Settings,
  Bolt,
  Edit3,
  Activity,
  CheckCircle2,
  GraduationCap,
  Brain,
  CheckSquare,
  Star,
  RotateCw,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun Kapoor',
    role: 'Year 12 Student',
    quote:
      'StudyPulse changed how I view my afternoons. Instead of guessing what to study, I follow the dashboard\'s lead. My grades in Physics jumped from a B to an A* in one term.',
    initials: 'AK',
  },
  {
    name: 'Meera Sharma',
    role: 'Parent',
    quote:
      'As a parent, I no longer have to nag about homework. The weekly reports show me exactly where my daughter is focusing her efforts. Highly recommended for accountability.',
    initials: 'MS',
  },
  {
    name: 'James Chen',
    role: 'Medical Aspirant',
    quote:
      'The Spaced Repetition feature is a game-changer for Biology. Memorization used to be a chore, but now it\'s automated. I feel much more confident for my finals.',
    initials: 'JC',
  },
];

export default function LandingPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((section) => {
      section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-background text-foreground">
      <header className="flex justify-between items-center w-full px-4 md:px-16 h-16 sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-primary">StudyPulse</span>
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
            <Link href="/dashboard" className="border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/daily-entry" className="hover:text-primary transition-colors">
              Daily Entry
            </Link>
            <Link href="/homework" className="hover:text-primary transition-colors">
              Homework
            </Link>
            <Link href="/revision" className="hover:text-primary transition-colors">
              Revision
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-slate-600">
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <Link href="/daily-entry" className="bg-primary text-white px-6 py-2 rounded-xl font-bold transition-transform duration-150 hover:shadow-lg active:scale-95">
            New Entry
          </Link>
        </div>
      </header>

      <section className="hero-pattern relative pt-16 pb-24 px-4 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary-container text-primary px-4 py-1 rounded-full text-xs font-semibold">
              <Bolt className="w-4 h-4" />
              <span>ACADEMIC PERFORMANCE TRACKER</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-slate-950">
              Track learning after tuition. <span className="text-primary">Build consistency.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-xl leading-relaxed">
              The bridge between class hours and mastery. StudyPulse helps students log daily progress, visualize growth, and eliminate learning gaps through clinical tracking.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/register" className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-base hover:shadow-lg transition-all active:scale-95">
                Start Tracking
              </Link>
              <Link href="#workflow" className="border border-slate-300 text-primary px-8 py-4 rounded-xl font-bold text-base hover:bg-slate-50 transition-all">
                Watch Demo
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-6 grid-rows-6 gap-4 h-[500px]">
              <div className="col-span-4 row-span-4 glass-card rounded-3xl p-6 glow-effect border-t-4 border-primary shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Student Dashboard</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">LIVE</span>
                </div>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJgY-e2gTIssWXcc5a5sD02tAZH4HQiB6bYqI6kxpf-q0MyvPB9V7vJ7ZC-6oZ56Pu8aNIS4Oi6N5DHKUetmtCIIkanli6S-0hZOpnBEY5v9YLrEjitZRmTap4dUWqsrdZk4m9JKa7sEhO2wheA1w0kTBEUcOxEKvSzOJna7cL_SjtqhH5lAPizlj68DF6YNA5Xf-CriSz-0kZGf6B_K46gXCxbjO_iKfLwxINov6kA5BpkYgu86adEUT9zpo2ku-_jJc1xkBEngg"
                  alt="Dashboard preview"
                  className="w-full h-48 object-cover rounded-2xl mb-4 opacity-95 shadow-sm"
                />
                <div className="space-y-3">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>PHYSICS MASTERY</span>
                    <span>75%</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 row-span-3 glass-card rounded-3xl p-4 border-t-4 border-emerald-500 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">92%</div>
                  <div className="text-sm text-slate-500">Consistency</div>
                </div>
                <div className="mt-4 text-sm font-semibold text-slate-700">Weekly progress indicator across classes.</div>
              </div>

              <div className="col-span-2 row-span-3 glass-card rounded-3xl p-4 border-t-4 border-amber-400 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">14</div>
                  <div className="text-sm text-slate-500">Day Streak</div>
                </div>
                <div className="mt-4 text-sm font-semibold text-slate-700">Keep the momentum strong with daily reviews.</div>
              </div>

              <div className="col-span-6 row-span-2 glass-card rounded-3xl p-6 flex items-center justify-between shadow-xl">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Calculus Homework</div>
                    <div className="text-sm text-slate-500">Due in 2 hours</div>
                  </div>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">Complete</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white" id="workflow">
        <div className="max-w-7xl mx-auto px-4 md:px-16 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">The Mastery Workflow</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Transform passive attendance into active academic excellence through our four-step cycle.</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-16 relative">
          <svg className="hidden md:block absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 -z-10" viewBox="0 0 1000 100" aria-hidden="true">
            <path d="M 0 50 Q 250 50 500 50 T 1000 50" fill="none" stroke="#cbd5e1" strokeDasharray="8 8" strokeWidth="2" />
          </svg>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 border border-transparent hover:border-primary hover:bg-primary/10 transition-all duration-300">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Tuition</h4>
              <p className="text-sm text-slate-600">Attend lectures and capture core concepts from instructors.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 border border-transparent hover:border-emerald-500 hover:bg-emerald-100 transition-all duration-300">
                <Edit3 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Logging</h4>
              <p className="text-sm text-slate-600">Immediately record what was learned and homework assigned.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 border border-transparent hover:border-amber-400 hover:bg-amber-100 transition-all duration-300">
                <Activity className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Analytics</h4>
              <p className="text-sm text-slate-600">Visualize subject confidence and time distribution.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 border border-transparent hover:border-primary hover:bg-primary hover:text-white transition-all duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Mastery</h4>
              <p className="text-sm text-slate-600">Achieve consistent high scores through data-driven revision.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface-container-low" id="features">
        <div className="max-w-7xl mx-auto px-4 md:px-16 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-surface rounded-3xl p-10 shadow-sm overflow-hidden relative">
            <div className="relative z-10 max-w-md">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-4">
                Visual Evidence
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Study Heatmap</h3>
              <p className="text-slate-600 mb-8">Never lose your momentum. Our heatmap tracks your daily commitment across subjects, highlighting your streaks and potential burnout zones before they happen.</p>
              <button className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors">
                Explore Analytics
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-slate-100 p-8 hidden md:grid grid-cols-7 gap-2">
              {Array.from({ length: 49 }).map((_, index) => {
                const opacityValues = [0.15, 0.3, 0.55, 0.85, 0.22, 0.48, 0.75];
                return (
                  <div
                    key={index}
                    className="aspect-square rounded-sm bg-emerald-600"
                    style={{ opacity: opacityValues[index % opacityValues.length] }}
                  />
                );
              })}
            </div>
          </div>

          <div className="bg-primary text-white rounded-3xl p-10 shadow-sm">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6" />
              <span className="ml-3 text-xs uppercase tracking-[0.2em] font-semibold">Reliability</span>
            </div>
            <h3 className="text-3xl font-bold mb-4">Reliability Scoring</h3>
            <p className="text-white/80 mb-8">Our proprietary algorithm calculates your likelihood of forgetting concepts based on Ebbinghaus' Forgetting Curve.</p>
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="text-4xl font-bold">84/100</div>
              <div className="text-sm opacity-80">Recall Probability Index</div>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-10 shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <RefreshCw className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Spaced Repetition</h3>
            <p className="text-slate-600">StudyPulse intelligently schedules revisions precisely when your brain is about to let a concept slip, ensuring long-term retention with minimal effort.</p>
          </div>

          <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-10 shadow-sm border border-slate-800">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4">Academic Reports</h3>
                <p className="text-white/80 mb-6">Generate clinical performance summaries for parents or teachers. Show evidence of your hard work through data, not just claims.</p>
                <div className="flex gap-4 flex-wrap">
                  <span className="bg-white/10 px-4 py-2 rounded-lg text-xs font-semibold">PDF EXPORT</span>
                  <span className="bg-white/10 px-4 py-2 rounded-lg text-xs font-semibold">REAL-TIME SYNC</span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj36TpCOyyxaLU41sCgR6SIBo1gRTq2_akWlgcwS-9O5t2O2ivw_hOslr74gpfq0PBh5vDLQ760CxAPjE4GnJUjXt-ik76QazJB63uU8eYPK0lUaIisqSjKO7O-T_OTMaD5wmk9mQ2E2baknhrYRj3S7IpbVCjoTgV007iuyJ62wsG9AdAafwtWVPe_weZ06MjwtRr-DOdbvCfH29ju3LCmEzS-hFuRcjRaFmb0RwREqgIrfzRbpVRzErqbvJlQSMjqli6P0-WRZo"
                  alt="Reporting preview"
                  className="w-full h-48 object-cover rounded-xl opacity-80 grayscale"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Trusted by High Achievers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <div className="flex gap-1 text-amber-500 mb-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="w-4 h-4" />
                  ))}
                </div>
                <p className="text-slate-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-16">
        <div className="max-w-5xl mx-auto bg-primary text-white rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
              <path d="M0 100 C 20 0 50 0 100 100" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0 80 C 30 20 60 20 100 80" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to master your curriculum?</h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/80">Join thousands of students building lifelong study habits. Start your consistency streak today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register" className="bg-secondary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform">
                Start Tracking
              </Link>
              <span className="text-white/80 text-sm">No credit card required.</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 px-4 md:px-16 mt-16 border-t border-slate-200 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-bold text-primary">StudyPulse</span>
            <p className="text-sm text-slate-500">© 2024 StudyPulse Academic Operations. Built for ICSE Excellence.</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Support
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
