'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const COLLEGES = [
  { value: 'vel_tech',    label: 'Vel Tech University',                        emailDomain: '@veltech.edu.in',    idPlaceholder: 'e.g. VTU28891',         idLabel: 'Vel Tech ID / VTU Number' },
  { value: 'anna_univ',  label: 'Anna University',                             emailDomain: '@annauniv.edu',      idPlaceholder: 'e.g. 2021501089',        idLabel: 'University Roll Number' },
  { value: 'iit_madras', label: 'IIT Madras',                                  emailDomain: '@iitm.ac.in',        idPlaceholder: 'e.g. CS21B001',          idLabel: 'Roll Number' },
  { value: 'nit_trichy', label: 'NIT Trichy',                                  emailDomain: '@nitt.edu',          idPlaceholder: 'e.g. 610519104001',      idLabel: 'Roll Number' },
  { value: 'srm',        label: 'SRM Institute of Science & Technology',       emailDomain: '@srmist.edu.in',     idPlaceholder: 'e.g. RA2011003010001',   idLabel: 'Student ID' },
  { value: 'vit',        label: 'VIT University',                              emailDomain: '@vit.ac.in',         idPlaceholder: 'e.g. 21BCE1234',         idLabel: 'Registration Number' },
  { value: 'sastra',     label: 'SASTRA University',                           emailDomain: '@sastra.ac.in',      idPlaceholder: 'e.g. 124001E',           idLabel: 'Student ID' },
  { value: 'sathyabama', label: 'Sathyabama Institute of Science & Technology',emailDomain: '@sathyabama.ac.in', idPlaceholder: 'Student Roll Number',     idLabel: 'Roll Number' },
  { value: 'saveetha',   label: 'Saveetha Engineering College',                emailDomain: '@saveetha.ac.in',    idPlaceholder: 'Student Roll Number',     idLabel: 'Roll Number' },
  { value: 'psnacet',    label: 'P.S.N.A. College of Engineering',             emailDomain: '@psnacet.edu.in',    idPlaceholder: 'Student Roll Number',     idLabel: 'Roll Number' },
  { value: 'other',      label: 'Other College / University',                  emailDomain: '',                   idPlaceholder: 'Enter your student/roll number', idLabel: 'Student ID / Roll Number' },
];

const DEPARTMENTS = [
  // Computing / IT
  { value: 'CSE', label: 'CSE - Computer Science & Engineering' },
  { value: 'CSE (AI & ML)', label: 'CSE (AI & ML) - Artificial Intelligence & Machine Learning' },
  { value: 'CSE (Cyber Security)', label: 'CSE (Cyber Security) - Cyber Security' },
  { value: 'CSE (Data Science)', label: 'CSE (Data Science) - Data Science' },
  { value: 'AI & DS', label: 'AI & DS - Artificial Intelligence & Data Science' },
  { value: 'CSD', label: 'CSD - Computer Science & Design' },
  { value: 'IT', label: 'IT - Information Technology' },
  { value: 'MCA', label: 'MCA - Master of Computer Applications' },
  { value: 'BCA', label: 'BCA - Bachelor of Computer Applications' },
  
  // Electrical / Communication
  { value: 'ECE', label: 'ECE - Electronics & Communication Engineering' },
  { value: 'EEE', label: 'EEE - Electrical & Electronics Engineering' },
  { value: 'Biomedical', label: 'Biomedical Engineering' },
  
  // Mechanical / Construction / Other Engineering
  { value: 'Mechanical', label: 'Mechanical Engineering' },
  { value: 'Civil', label: 'Civil Engineering' },
  { value: 'Aeronautical', label: 'Aeronautical Engineering' },
  { value: 'Automobile', label: 'Automobile Engineering' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Mechatronics', label: 'Mechatronics Engineering' },
  { value: 'Agricultural', label: 'Agricultural Engineering' },
  { value: 'Chemical', label: 'Chemical Engineering' },
  { value: 'Petroleum', label: 'Petroleum Engineering' },
  { value: 'Marine', label: 'Marine Engineering' },
  { value: 'Food Technology', label: 'Food Technology' },
  
  // Business / Management
  { value: 'MBA', label: 'MBA - Master of Business Administration' },
  { value: 'BBA', label: 'BBA - Bachelor of Business Administration' },
  { value: 'B.Com', label: 'B.Com - Bachelor of Commerce' },
  
  // Law / Legal Studies
  { value: 'BA LLB', label: 'BA LLB (Hons)' },
  { value: 'BBA LLB', label: 'BBA LLB (Hons)' },
  { value: 'LLB', label: 'LLB - Bachelor of Laws' },
  { value: 'Law', label: 'Law / Legal Studies (Other)' },
  
  // Science / Others
  { value: 'B.Sc', label: 'B.Sc - Bachelor of Science' },
  { value: 'other', label: 'Other Department' },
];

const SCHOOLS = [
  { value: 'School of Computing', label: 'School of Computing' },
  { value: 'School of Electrical & Electronics', label: 'School of Electrical & Electronics' },
  { value: 'School of Mechanical & Construction', label: 'School of Mechanical & Construction' },
  { value: 'School of Law', label: 'School of Law' },
  { value: 'School of Management', label: 'School of Management' },
  { value: 'School of Science & Humanities', label: 'School of Science & Humanities' },
  { value: 'School of Media & Design', label: 'School of Media & Design' },
  { value: 'Other', label: 'Other School / Division' },
];

/* ── Reusable field wrapper with left icon ── */
function Field({
  icon, label, hint, children,
}: { icon: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="group/field">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        <span>{icon}</span> {label}
        {hint && <span className="text-blue-400/60 font-normal normal-case tracking-normal ml-1 text-[11px]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Base input styles ── */
const inp = [
  'w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none border transition-all duration-200',
  'bg-slate-900/70 border-slate-700/50 placeholder-slate-600',
  'focus:border-blue-500/80 focus:bg-slate-900 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]',
].join(' ');

const sel = [
  'w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none border transition-all duration-200 appearance-none cursor-pointer',
  'bg-slate-900/70 border-slate-700/50',
  'focus:border-blue-500/80 focus:bg-slate-900 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]',
].join(' ');

/* ── Section divider ── */
function SectionHeader({ icon, title, color = 'blue' }: { icon: string; title: string; color?: string }) {
  const bar = color === 'amber' ? 'bg-amber-500' : 'bg-blue-500';
  const text = color === 'amber' ? 'text-amber-400' : 'text-blue-400';
  return (
    <div className={`flex items-center gap-3 py-3 border-b border-slate-800/60 mb-5`}>
      <span className={`w-1 h-5 rounded-full ${bar}`} />
      <span className="text-lg mr-1">{icon}</span>
      <h3 className={`text-xs font-bold uppercase tracking-widest ${text}`}>{title}</h3>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '', college: 'vel_tech', college_name: '', veltech_id: '',
    email: '', phone_number: '', year_of_studying: '1', branch: '', school: '',
    role: 'student', discipline: 'engineering', password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const selectedCollege = COLLEGES.find(c => c.value === formData.college) || COLLEGES[0];
  const passwordsMatch = confirmPassword === '' ? null : formData.password === confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'college' ? { email: '' } : {}) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setPasswordError('');
    if (formData.password !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (formData.password.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    
    if (formData.role === 'student') {
      const phoneClean = formData.phone_number.trim();
      if (!/^\d{10}$/.test(phoneClean)) {
        setError('Phone number must be exactly 10 digits.');
        return;
      }
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess('Account request submitted!');
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-stretch relative overflow-hidden">

      {/* ── Global ambient glows ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ═══════════════════════════════════════════════
          LEFT BRAND PANEL (hidden on mobile)
      ═══════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/30 px-12 py-14 border-r border-slate-800/40 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-0 w-56 h-56 bg-amber-500/8 rounded-full blur-[80px]" />

        {/* Logo */}
        <div>
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-slate-700/50 group-hover:border-blue-500/60 transition shadow-lg">
              <Image src="/logo.png" alt="Yantriksha_X_Hub" fill className="object-contain" style={{ mixBlendMode: 'screen' }} />
            </div>
            <span className="text-lg font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
              <span className="inline-block relative h-7 w-9 mx-0.5 align-middle shrink-0">
                <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
              </span>
              <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
            </span>
          </Link>

          <div className="mt-14">
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Start Your<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
                Innovation<br />Journey
              </span>
            </h2>
            <p className="mt-5 text-gray-400 text-sm leading-relaxed max-w-xs">
              Join a cross-disciplinary hub of Engineering, Law, and Business students building tomorrow&apos;s startups.
            </p>
          </div>

          {/* Feature list */}
          <ul className="mt-10 space-y-4">
            {[
              { icon: '💰', text: 'Seed funding up to ₹50,000' },
              { icon: '🎓', text: 'Expert mentorship & coaching' },
              { icon: '🚀', text: 'Full startup incubation support' },
              { icon: '🏆', text: 'Hackathons & innovation challenges' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-900/40 flex items-center justify-center text-base shrink-0">
                  {icon}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote */}
        <p className="text-xs text-slate-600 italic mt-10">
          &quot;From confusion to a registered company — we guide every step.&quot;
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT FORM PANEL
      ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-xl">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
             <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-700">
               <Image src="/logo.png" alt="logo" fill className="object-contain" style={{ mixBlendMode: 'screen' }} />
             </div>
              <span className="text-base font-bold flex items-center">
               <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
               <span className="inline-block relative h-6 w-8 mx-0.5 align-middle shrink-0">
                 <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
               </span>
               <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
              </span>
          </div>

          {/* Form card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/60 shadow-2xl overflow-hidden">

            {/* Rainbow top bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-400" />

            <div className="p-7 md:p-9">

              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Create Account</h1>
              <p className="text-gray-500 text-sm mb-7">Fill in your details to join Yantriksha_X_Hub</p>

              {/* Alerts */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-950/60 border border-red-700/50 text-red-400 rounded-xl text-sm flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">❌</span> {error}
                </div>
              )}
              {success && (
                <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 rounded-xl text-sm flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">🎉</span> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ─── Section 1: Identity ─── */}
                <SectionHeader icon="👤" title="Personal Identity" />

                <Field icon="✏️" label="Full Name">
                  <input type="text" name="name" value={formData.name}
                    onChange={handleChange} placeholder="Enter your full name"
                    className={inp} required />
                </Field>

                {/* ─── Section 2: Institution ─── */}
                <SectionHeader icon="🏫" title="Institution" />

                <Field icon="🎓" label="College / University" hint="(Select your institution)">
                  <div className="relative">
                    <select name="college" value={formData.college} onChange={handleChange} className={sel}>
                      {COLLEGES.map(c => (
                        <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
                  </div>
                  {selectedCollege.emailDomain && (
                    <p className="mt-2 text-xs flex items-center gap-1.5 text-blue-400/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      Official domain: <strong>{selectedCollege.emailDomain}</strong>
                    </p>
                  )}
                  {formData.college === 'other' && (
                    <div className="mt-3 relative">
                      <input type="text" name="college_name" value={formData.college_name}
                        onChange={handleChange} placeholder="Type your college / university name"
                        className={`${inp} border-amber-500/40 focus:border-amber-400`}
                        required autoFocus />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-[10px] font-bold uppercase tracking-wider pointer-events-none">
                        Required
                      </span>
                    </div>
                  )}
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon="🪪" label={selectedCollege.idLabel}>
                    <input type="text" name="veltech_id" value={formData.veltech_id}
                      onChange={handleChange} placeholder={selectedCollege.idPlaceholder}
                      className={inp} required />
                  </Field>

                  <Field icon="📧" label="College Email"
                    hint={selectedCollege.emailDomain ? `(${selectedCollege.emailDomain})` : ''}>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleChange}
                      placeholder={selectedCollege.emailDomain ? `yourname${selectedCollege.emailDomain}` : 'your.college@email.com'}
                      className={inp} required />
                  </Field>
                </div>

                {/* ─── Section 3: Role ─── */}
                <SectionHeader icon="🤝" title="Role & Discipline" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon="👔" label="Role">
                    <div className="relative">
                      <select name="role" value={formData.role} onChange={handleChange} className={sel}>
                        <option value="student" className="bg-slate-900">Student</option>
                        <option value="faculty" className="bg-slate-900">Faculty Member</option>
                        <option value="mentor"  className="bg-slate-900">Advisor / Mentor</option>
                      </select>
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
                    </div>
                  </Field>

                  <Field icon="🔬" label="Discipline">
                    <div className="relative">
                      <select name="discipline" value={formData.discipline} onChange={handleChange} className={sel}>
                        <option value="engineering" className="bg-slate-900">Engineering</option>
                        <option value="law"         className="bg-slate-900">Law</option>
                        <option value="business"    className="bg-slate-900">Business (MBA)</option>
                        <option value="other"       className="bg-slate-900">Other</option>
                      </select>
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
                    </div>
                  </Field>
                </div>

                {/* ─── Conditional: Student Details ─── */}
                {formData.role === 'student' && (
                  <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-5 space-y-4">
                    <SectionHeader icon="📋" title="Student Profile Details" color="blue" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field icon="📞" label="Phone Number" hint="(10 digits)">
                        <input type="tel" name="phone_number" value={formData.phone_number}
                          onChange={handleChange} placeholder="e.g. 9182169185"
                          pattern="[0-9]{10}" maxLength={10}
                          className={inp} required />
                      </Field>

                      <Field icon="📅" label="Year of Study">
                        <div className="relative">
                          <select name="year_of_studying" value={formData.year_of_studying}
                            onChange={handleChange} className={sel}>
                            <option value="1" className="bg-slate-900">1st Year</option>
                            <option value="2" className="bg-slate-900">2nd Year</option>
                            <option value="3" className="bg-slate-900">3rd Year</option>
                            <option value="4" className="bg-slate-900">4th Year</option>
                          </select>
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
                        </div>
                      </Field>

                      <Field icon="🏫" label="Schooling / School">
                        <div className="relative">
                          <select name="school" value={formData.school}
                            onChange={handleChange} className={sel} required>
                            <option value="" disabled className="bg-slate-900 text-gray-550">Select School</option>
                            {SCHOOLS.map(s => (
                              <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>
                            ))}
                          </select>
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
                        </div>
                      </Field>

                      <Field icon="🌿" label="Branch / Department">
                        <div className="relative">
                          <select name="branch" value={formData.branch}
                            onChange={handleChange} className={sel} required>
                            <option value="" disabled className="bg-slate-900 text-gray-550">Select Department</option>
                            {DEPARTMENTS.map(d => (
                              <option key={d.value} value={d.value} className="bg-slate-900">{d.label}</option>
                            ))}
                          </select>
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
                        </div>
                      </Field>
                    </div>
                  </div>
                )}

                {/* ─── Section 4: Security ─── */}
                <SectionHeader icon="🔐" title="Account Security" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon="🔑" label="Password">
                    <input type="password" name="password" value={formData.password}
                      onChange={handleChange} placeholder="Min. 8 characters"
                      className={inp} autoComplete="new-password" required />
                  </Field>

                  <Field icon="🔒" label="Confirm Password"
                    hint={passwordsMatch === true ? '✓ Match' : passwordsMatch === false ? '✗ No match' : ''}>
                    <input type="password" name="confirmPassword" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`${inp} ${
                        passwordsMatch === false ? 'border-red-500/60 focus:border-red-500' :
                        passwordsMatch === true  ? 'border-emerald-500/60 focus:border-emerald-500' : ''
                      }`}
                      autoComplete="new-password" required />
                  </Field>
                </div>

                {passwordError && (
                  <p className="text-red-400 text-xs flex items-center gap-1.5 -mt-1">
                    ❌ {passwordError}
                  </p>
                )}

                {/* ─── Submit ─── */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden group mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-500 text-white py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-900/30 border border-blue-500/20 hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
                    ) : (
                      <>🚀 Create My Account</>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <p className="text-center text-gray-600 text-xs pt-1">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                    Sign in here →
                  </Link>
                </p>

              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* ── Success Modal Approval Notification ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn animate-duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative text-center shadow-2xl">
            {/* Glowing success icon */}
            <div className="mx-auto h-16 w-16 bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              🎉
            </div>
            
            {/* Modal Title */}
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Join Request Submitted!
            </h3>
            
            {/* Modal Description */}
            <p className="text-gray-400 text-sm mt-4 leading-relaxed font-light">
              Your registration details have been submitted successfully. Your request is now pending approval by the Admin. Once accepted, you will be able to log in to access the Yantriksha Hub dashboard.
            </p>
            
            {/* OK Button */}
            <button
              onClick={() => router.push('/')}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-750 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-blue-900/30"
            >
              Okay
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
