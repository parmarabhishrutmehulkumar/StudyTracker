'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BookOpen, Check, Plus, Loader2, Award, Calendar, Phone } from 'lucide-react';

const PRELOADED_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
];

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  school: z.string().min(2, 'School name is required'),
  board: z.string().default('ICSE'),
  class: z.string().default('Class 10'),
  parentContact: z.string().min(10, 'Parent contact must be at least 10 digits'),
  tuition: z.boolean().default(true),
  studyGoal: z.string().min(5, 'Please provide a study goal'),
  reminderTime: z.string().default('20:00'),
});

type OnboardingFormValues = z.input<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(PRELOADED_SUBJECTS);
  const [customSubject, setCustomSubject] = useState('');
  const [subjectsList, setSubjectsList] = useState<string[]>(PRELOADED_SUBJECTS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      board: 'ICSE',
      class: 'Class 10',
      tuition: true,
      studyGoal: 'Score above 95% in ICSE Board Exams',
      reminderTime: '20:00',
    },
  });

  // Redirect if not authenticated or already onboarded
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user && (session.user as any).isOnboarded) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Load registration details into form when session is ready
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setValue('name', session.user.name);
      
      // Load details from database if already registered
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            if (data.name) setValue('name', data.name);
            if (data.school) setValue('school', data.school);
            if (data.parentContact) setValue('parentContact', data.parentContact);
            if (data.tuition !== undefined) setValue('tuition', data.tuition);
            if (data.studyGoal) setValue('studyGoal', data.studyGoal);
            if (data.reminderTime) setValue('reminderTime', data.reminderTime);
            if (data.subjects && data.subjects.length > 0) {
              setSubjectsList(data.subjects);
              setSelectedSubjects(data.subjects);
            }
          }
        })
        .catch(() => {});
    }
  }, [session, setValue]);

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    
    // Capitalize first letter
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    
    if (subjectsList.includes(formatted)) {
      toast.warning('Subject already exists');
      return;
    }

    setSubjectsList([...subjectsList, formatted]);
    setSelectedSubjects([...selectedSubjects, formatted]);
    setCustomSubject('');
    toast.success(`Added custom subject: ${formatted}`);
  };

  const onSubmit: SubmitHandler<OnboardingFormValues> = async (data) => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one study subject');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          subjects: selectedSubjects,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Failed to complete onboarding');
        setIsSubmitting(false);
      } else {
        toast.success('Profile set up complete!');
        
        // Update session client-side so middleware or redirect logic registers isOnboarded
        await updateSession({
          isOnboarded: true,
          subjects: selectedSubjects,
          name: data.name,
        });

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto w-full">
        {/* Onboarding Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-container px-3 py-1.5 rounded-full">
            Onboarding Setup
          </span>
          <h1 className="font-hanken text-3xl font-extrabold text-primary tracking-tight mt-4">
            Initialize StudyPulse
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Configure your ICSE Class 10 academic settings to activate analytics tracking.
          </p>
        </div>

        {/* Steps Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface border border-border rounded-2xl p-8 shadow-sm">
          {/* Section 1: Academic Settings */}
          <div>
            <h3 className="font-hanken text-lg font-bold border-b border-border pb-3 text-slate-800 flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <span>1. Profile & Goal Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
                {errors.name && <p className="text-xs text-critical mt-1.5 font-medium">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">School Name</label>
                <input
                  type="text"
                  {...register('school')}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
                {errors.school && <p className="text-xs text-critical mt-1.5 font-medium">{errors.school.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Parent Contact Number</label>
                <input
                  type="tel"
                  {...register('parentContact')}
                  placeholder="10 digit number"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
                {errors.parentContact && <p className="text-xs text-critical mt-1.5 font-medium">{errors.parentContact.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Daily Study Goal / Target</label>
                <input
                  type="text"
                  {...register('studyGoal')}
                  placeholder="e.g. Score above 95% in ICSE Board Exams"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
                {errors.studyGoal && <p className="text-xs text-critical mt-1.5 font-medium">{errors.studyGoal.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Daily Reminder Time</label>
                <input
                  type="time"
                  {...register('reminderTime')}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-center">
                <label className="flex items-center space-x-3 cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    {...register('tuition')}
                    className="w-4.5 h-4.5 text-primary border-border rounded focus:ring-primary focus:ring-opacity-25"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Do you attend tuition classes?</span>
                    <span className="block text-xs text-slate-500 font-medium">Activate specific tutoring logs and homework triggers.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Preloads & Selection */}
          <div className="pt-4">
            <h3 className="font-hanken text-lg font-bold border-b border-border pb-3 text-slate-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>2. Subject Selection</span>
            </h3>
            
            <p className="text-slate-500 text-xs font-medium mt-3 mb-4">
              Select the subjects you currently attend tuition for. Unchecked subjects will be excluded from dropdown lists but can be reactivated later.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjectsList.map((subject) => {
                const isSelected = selectedSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`flex items-center justify-between p-3.5 border rounded-xl text-sm font-semibold text-left transition-all ${
                      isSelected
                        ? 'bg-primary-container/20 border-primary text-primary shadow-sm'
                        : 'bg-background border-border text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{subject}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Subject Addition */}
            <div className="mt-5 flex items-center space-x-2 max-w-md">
              <input
                type="text"
                placeholder="Add custom subject (e.g. Commercial Applications)"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSubject();
                  }
                }}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomSubject}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center space-x-1 border border-border"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Locked board standard warning */}
          <div className="bg-blue-50/50 border border-primary/10 rounded-xl p-4 flex items-start space-x-3 text-xs text-primary-dark">
            <Calendar className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <span className="block font-bold">Academic Board Locked</span>
              <span className="font-medium text-slate-600 leading-normal">
                StudyPulse is custom-built for the standard **ICSE Class 10** syllabus. Syllabus structures, equations tracking, and default tasks are automatically mapped.
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Setup...</span>
              </>
            ) : (
              <span>Activate StudyPulse Profile</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
