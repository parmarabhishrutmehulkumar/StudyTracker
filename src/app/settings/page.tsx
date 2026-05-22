'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import LayoutWrapper from '@/components/layout-wrapper';
import {
  Settings as SettingsIcon,
  User,
  BookOpen,
  Shield,
  Trash2,
  Loader2,
  Save,
  Plus,
  Check,
  X,
  AlertTriangle,
  Lock,
  School,
  Phone,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [tuition, setTuition] = useState(true);
  const [studyGoal, setStudyGoal] = useState('');
  const [reminderTime, setReminderTime] = useState('20:00');

  // Subject Management
  const [subjects, setSubjects] = useState<string[]>(PRELOADED_SUBJECTS);
  const [customSubject, setCustomSubject] = useState('');

  // Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setName(data.name || '');
          setEmail(data.email || '');
          setSchool(data.school || '');
          setParentContact(data.parentContact || '');
          setTuition(data.tuition ?? true);
          setStudyGoal(data.studyGoal || '');
          setReminderTime(data.reminderTime || '20:00');
          if (data.subjects && data.subjects.length > 0) {
            setSubjects(data.subjects);
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const toggleSubject = (sub: string) => {
    if (subjects.includes(sub)) {
      if (subjects.length <= 1) {
        toast.error('You must keep at least one subject active.');
        return;
      }
      setSubjects(subjects.filter(s => s !== sub));
    } else {
      setSubjects([...subjects, sub]);
    }
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (subjects.includes(formatted)) {
      toast.warning('Subject already exists');
      return;
    }
    setSubjects([...subjects, formatted]);
    setCustomSubject('');
    toast.success(`Added: ${formatted}`);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        name,
        school,
        parentContact,
        tuition,
        studyGoal,
        reminderTime,
        subjects,
      };

      // Handle password change if provided
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error('Password must be at least 6 characters');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsSaving(false);
          return;
        }
        payload.password = newPassword;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      // Update session with new name and subjects
      await updateSession({
        name,
        subjects,
      });

      toast.success('Settings saved successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/settings', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');

      toast.success('Account deleted. Redirecting...');
      signOut({ callbackUrl: '/login' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  // All possible subjects for the grid (merge preloaded + any custom ones)
  const allSubjectOptions = Array.from(new Set([...PRELOADED_SUBJECTS, ...subjects]));

  if (isLoading) {
    return (
      <LayoutWrapper title="Settings" subtitle="Loading profile...">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper
      title="Account Settings"
      subtitle="Update your profile details, manage active subjects, change your password, or delete your account."
    >
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Section 1: Profile Details */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-hanken font-bold text-base text-slate-800 border-b border-border pb-3 mb-5 flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Profile & Academic Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><User className="w-3.5 h-3.5" /><span>Full Name</span></span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><span>Email (Read-Only)</span></span>
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-sm text-slate-400 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><School className="w-3.5 h-3.5" /><span>School Name</span></span>
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><Phone className="w-3.5 h-3.5" /><span>Parent Contact</span></span>
              </label>
              <input
                type="tel"
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><Target className="w-3.5 h-3.5" /><span>Study Goal / Target</span></span>
              </label>
              <input
                type="text"
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                placeholder="e.g. Score above 95% in ICSE Board Exams"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>Daily Reminder Time</span></span>
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tuition}
                onChange={(e) => setTuition(e.target.checked)}
                className="w-4.5 h-4.5 text-primary border-border rounded focus:ring-primary focus:ring-opacity-25"
              />
              <div>
                <span className="text-sm font-semibold text-slate-800">I attend tuition classes</span>
                <span className="block text-xs text-slate-500 font-medium">Disabling this hides tutor-specific fields from the daily entry forms.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Subject Management */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-hanken font-bold text-base text-slate-800 border-b border-border pb-3 mb-5 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Active Study Subjects</span>
          </h3>

          <p className="text-xs text-slate-500 font-medium mb-4">
            Toggle subjects on or off. Deactivated subjects are hidden from dropdown selectors and analytics aggregation.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {allSubjectOptions.map((sub) => {
              const isActive = subjects.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSubject(sub)}
                  className={`flex items-center justify-between p-3.5 border rounded-xl text-xs font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-primary-container/20 border-primary text-primary shadow-sm'
                      : 'bg-background border-border text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span>{sub}</span>
                  {isActive && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add Custom Subject */}
          <div className="flex items-center space-x-2 max-w-md">
            <input
              type="text"
              placeholder="Add custom subject (e.g. Hindi, Economics)"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSubject();
                }
              }}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-slate-700"
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

        {/* Section 3: Security */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-hanken font-bold text-base text-slate-800 border-b border-border pb-3 mb-5 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Security & Password</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><Lock className="w-3.5 h-3.5" /><span>New Password</span></span>
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1"><Lock className="w-3.5 h-3.5" /><span>Confirm Password</span></span>
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save All Settings</span>
            </>
          )}
        </button>

        {/* Section 4: Danger Zone */}
        <div className="bg-critical/[0.02] border border-critical/15 rounded-2xl p-6">
          <h3 className="font-hanken font-bold text-base text-critical border-b border-critical/10 pb-3 mb-5 flex items-center space-x-2">
            <Trash2 className="w-5 h-5" />
            <span>Danger Zone</span>
          </h3>

          <p className="text-xs text-slate-600 font-semibold mb-4">
            Permanently delete your StudyPulse account and all associated data (tuition logs, homework records, revisions, recurring tasks). 
            This action is irreversible.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 bg-critical/10 hover:bg-critical/15 border border-critical/20 text-critical rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Account</span>
            </button>
          ) : (
            <div className="bg-surface border border-critical/20 rounded-xl p-5 space-y-4">
              <div className="flex items-start space-x-3 text-xs text-critical font-bold">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Are you sure? All study data including tuition logs, homework, revisions, and recurring drills will be permanently deleted.</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-5 py-2 bg-critical hover:bg-critical-dark text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50 transition-all"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </LayoutWrapper>
  );
}
