import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      login(data.user, data.token);
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-surface">
      {/* Background elements */}
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="orb w-96 h-96 bg-brand/10 -top-20 -left-20" />
      <div className="orb w-96 h-96 bg-accent/10 -bottom-20 -right-20" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass border border-brand/20 mb-4 shadow-glow">
            <span className="text-3xl">⚡</span>
          </div>
          <h2 className="font-display font-black text-3xl text-white">
            {isLogin ? 'Welcome Back' : 'Join JaldiKharidoo'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Sign in to access your account' : 'Create an account for fast checkout'}
          </p>
        </div>

        <div className="glass border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                isLogin ? 'text-brand border-b-2 border-brand bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                !isLogin ? 'text-brand border-b-2 border-brand bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 transition-colors"
                    placeholder="John Doe"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">👤</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 transition-colors"
                  placeholder="you@example.com"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">✉️</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 transition-colors"
                  placeholder="••••••••"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">🔒</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-btn text-white text-sm font-bold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
