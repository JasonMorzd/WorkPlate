import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';

type Step = 'choose' | 'magic' | 'password' | 'sent' | 'register' | 'forgot' | 'forgotSent';

const STORAGE_EMAIL = 'wp_remember_email';
const STORAGE_PASS = 'wp_remember_pass';

function loadRemembered(): { email: string; password: string; rememberEmail: boolean; rememberPass: boolean } {
  try {
    const email = localStorage.getItem(STORAGE_EMAIL) || '';
    const password = localStorage.getItem(STORAGE_PASS) || '';
    return {
      email,
      password,
      rememberEmail: !!email,
      rememberPass: !!password,
    };
  } catch {
    return { email: '', password: '', rememberEmail: false, rememberPass: false };
  }
}

function saveRemembered(email: string, password: string, remEmail: boolean, remPass: boolean) {
  try {
    if (remEmail) localStorage.setItem(STORAGE_EMAIL, email);
    else localStorage.removeItem(STORAGE_EMAIL);

    if (remPass && remEmail) localStorage.setItem(STORAGE_PASS, password);
    else localStorage.removeItem(STORAGE_PASS);
  } catch { /* ignore */ }
}

interface AuthPageProps {}

export default function AuthPage(_props: AuthPageProps) {
  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(true);
  const [rememberPass, setRememberPass] = useState(false);

  useEffect(() => {
    const remembered = loadRemembered();
    setEmail(remembered.email);
    setPassword(remembered.password);
    setRememberEmail(remembered.rememberEmail);
    setRememberPass(remembered.rememberPass);
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (err) throw err;
      setStep('sent');
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      saveRemembered(email, password, rememberEmail, rememberPass);

      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      saveRemembered(email, password, rememberEmail, rememberPass);

      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (err) throw err;
      if (data?.user) {
        localStorage.setItem(`wp_pw_set_${data.user.id}`, '1');
      }
      setStep('sent');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (err) throw err;
      setStep('forgotSent');
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('choose');
    setError('');
  };

  if (step === 'sent') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-citrine-50 flex items-center justify-center">
            <Mail size={28} className="text-citrine-400" />
          </div>
          <h1 className="text-2xl font-normal text-canvas-ink tracking-widest mb-3">邮件已发送</h1>
          <p className="text-sm text-canvas-muted/60 tracking-wide leading-relaxed mb-1">
            登录链接已发送至
          </p>
          <p className="text-sm text-canvas-ink font-medium tracking-wide mb-6">{email}</p>
          <p className="text-xs text-canvas-muted/40 tracking-wide leading-relaxed">
            点击邮件中的按钮即可，链接 60 分钟内有效。<br />
            如未收到请检查垃圾邮件箱。
          </p>
          <button
            onClick={goBack}
            className="mt-8 text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
          >
            更换邮箱
          </button>
        </div>
      </div>
    );
  }

  if (step === 'forgotSent') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-citrine-50 flex items-center justify-center">
            <KeyRound size={28} className="text-citrine-400" />
          </div>
          <h1 className="text-2xl font-normal text-canvas-ink tracking-widest mb-3">邮件已发送</h1>
          <p className="text-sm text-canvas-muted/60 tracking-wide leading-relaxed mb-1">
            密码重置链接已发送至
          </p>
          <p className="text-sm text-canvas-ink font-medium tracking-wide mb-6">{email}</p>
          <p className="text-xs text-canvas-muted/40 tracking-wide leading-relaxed">
            点击邮件中的按钮即可设置新密码。<br />
            如未设置过密码，直接设置即可。<br />
            如未收到请检查垃圾邮件箱。
          </p>
          <button
            onClick={goBack}
            className="mt-8 text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (step === 'choose') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-normal text-canvas-ink tracking-widest">工作看板</h1>
            <p className="text-sm text-canvas-muted/60 mt-2 tracking-wide">
              登录后数据自动云端同步
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('magic')}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-canvas-mid/30 hover:border-citrine-400 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-citrine-50 flex items-center justify-center shrink-0 group-hover:bg-citrine-100 transition-colors">
                <Mail size={20} className="text-citrine-500" />
              </div>
              <div>
                <p className="text-sm text-canvas-ink font-medium tracking-wide">免密码登录</p>
                <p className="text-xs text-canvas-muted/50 mt-0.5">发送邮箱链接，点击即登录</p>
              </div>
            </button>

            <button
              onClick={() => setStep('password')}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-canvas-mid/30 hover:border-citrine-400 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-canvas-warm/70 flex items-center justify-center shrink-0 group-hover:bg-canvas-warm transition-colors">
                <KeyRound size={20} className="text-canvas-muted/60" />
              </div>
              <div>
                <p className="text-sm text-canvas-ink font-medium tracking-wide">密码登录</p>
                <p className="text-xs text-canvas-muted/50 mt-0.5">使用邮箱和密码登录</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-canvas-warm/60 transition-colors text-canvas-muted/50 hover:text-canvas-ink"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-medium text-canvas-ink tracking-wide">
            {step === 'magic' ? '免密码登录' : step === 'register' ? '注册账号' : step === 'forgot' ? '重置密码' : '密码登录'}
          </span>
        </div>

        {step === 'magic' ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入邮箱地址"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
            />

            {error && (
              <p className="text-xs text-red-400 tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 transition-all duration-300 disabled:opacity-50 tracking-wide"
            >
              {loading ? '发送中...' : '发送登录链接'}
            </button>
          </form>
        ) : step === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入邮箱地址"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
            />

            <p className="text-xs text-canvas-muted/40 tracking-wide">
              未设置过密码的用户将直接添加密码，已设置的将重置密码
            </p>

            {error && (
              <p className="text-xs text-red-400 tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 transition-all duration-300 disabled:opacity-50 tracking-wide"
            >
              {loading ? '发送中...' : '发送重置邮件'}
            </button>

            <p className="text-center">
              <button
                type="button"
                onClick={() => setStep('password')}
                className="text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
              >
                返回登录
              </button>
            </p>
          </form>
        ) : step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置密码（6位以上）"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
            />
            <p className="text-xs text-canvas-muted/40 tracking-wide">
              注册后数据自动云端同步，双端互通
            </p>

            {error && (
              <p className="text-xs text-red-400 tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 transition-all duration-300 disabled:opacity-50 tracking-wide"
            >
              {loading ? '注册中...' : '注册'}
            </button>

            <p className="text-center">
              <button
                type="button"
                onClick={() => setStep('password')}
                className="text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
              >
                已有账号？去登录
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
            />

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => {
                    setRememberEmail(e.target.checked);
                    if (!e.target.checked) {
                      setRememberPass(false);
                      saveRemembered('', '', false, false);
                    }
                  }}
                  className="w-4 h-4 rounded accent-citrine-400"
                />
                <span className="text-xs text-canvas-muted/60">记住邮箱</span>
              </label>
              {rememberEmail && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberPass}
                    onChange={(e) => setRememberPass(e.target.checked)}
                    className="w-4 h-4 rounded accent-citrine-400"
                  />
                  <span className="text-xs text-canvas-muted/60">记住密码</span>
                </label>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-400 tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 transition-all duration-300 disabled:opacity-50 tracking-wide"
            >
              {loading ? '登录中...' : '登录'}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
              >
                注册账号
              </button>
              <button
                type="button"
                onClick={() => setStep('forgot')}
                className="text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
              >
                修改密码
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
