import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  MapPin, 
  ArrowRight, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Business, BusinessType, SAProvince } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onAuthSuccess: (user: any, business: Business) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Spaza & Convenience');
  const [townOrCity, setTownOrCity] = useState('Orlando West, Soweto');
  const [province, setProvince] = useState<SAProvince>('Gauteng');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        onAuthSuccess(res.user, res.business);
        onClose();
      } else if (mode === 'register') {
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          businessName: businessName.trim() || `${name}'s Business`,
          businessType,
          townOrCity: townOrCity.trim(),
          province,
        });
        onAuthSuccess(res.user, res.business);
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.resetPassword(email.trim());
        setSuccessMessage(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication operation failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleJudgeLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.judgeLogin();
      onAuthSuccess(res.user, res.business);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize judge demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0a1128] rounded-3xl max-w-md w-full border border-cyan-500/25 shadow-2xl p-6 sm:p-8 space-y-5 my-auto animate-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
              KB
            </span>
            <span className="font-extrabold text-sm text-white">Khula<span className="text-cyan-400">Biz</span> Portal</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Judge Demo Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>FNB Hackathon 2026 Judge?</span>
            </div>
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              Instant login with Thabo's Corner Store benchmark dataset.
            </p>
          </div>
          <button
            type="button"
            onClick={handleJudgeLogin}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-xs shrink-0 active:scale-95"
          >
            Judge Login
          </button>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign in to your business workspace'}
            {mode === 'register' && 'Create your small business account'}
            {mode === 'forgot' && 'Reset your account password'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'login' && 'Access real-time sales records, stock alerts, and cash flow.'}
            {mode === 'register' && 'Free forever for single-shop township & micro-entrepreneurs.'}
            {mode === 'forgot' && 'Enter your registered email to receive password reset link.'}
          </p>
        </div>

        {/* Error / Success message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Your Full Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Thabo Ndlovu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="founder@mybusiness.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Password <span className="text-cyan-400">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Siyakhula Convenience Store"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Town or City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Soweto"
                    value={townOrCity}
                    onChange={(e) => setTownOrCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Province
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value as SAProvince)}
                    className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Gauteng">Gauteng</option>
                    <option value="Western Cape">Western Cape</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Free State">Free State</option>
                    <option value="North West">North West</option>
                    <option value="Northern Cape">Northern Cape</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Workspace'}
                  {mode === 'register' && 'Complete Registration'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch mode links */}
        <div className="pt-3 border-t border-white/[0.08] text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Register free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
