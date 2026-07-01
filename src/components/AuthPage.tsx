import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, KeyRound } from 'lucide-react';

type Mode = 'magic' | 'password' | 'sent';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (err) throw err;
      setMode('sent');
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
      if (isRegister) {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setError('注册成功！请返回免密码登录或直接登录。');
        setIsRegister(false);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'sent') {
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
            点击邮件中的按钮即可登录，链接 60 分钟内有效。<br />
            如未收到请检查垃圾邮件箱。
          </p>
          <button
            onClick={() => setMode('magic')}
            className="mt-8 text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
          >
            更换邮箱
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-normal text-canvas-ink tracking-widest">工作看板</h1>
          <p className="text-sm text-canvas-muted/60 mt-2 tracking-wide">
            登录后数据自动云端同步
          </p>
        </div>

        {mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入邮箱地址"
                required
                className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
              />
            </div>

            {error && (
              <p className={`text-xs tracking-wide ${error.includes('成功') ? 'text-citrine-500' : 'text-red-400'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 transition-all duration-300 disabled:opacity-50 tracking-wide"
            >
              {loading ? '发送中...' : '发送登录链接'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱"
                required
                className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码（6位以上）"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white text-canvas-ink text-sm outline-none border border-canvas-mid/40 focus:border-citrine-400 transition-colors placeholder:text-canvas-muted/30 tracking-wide"
              />
            </div>

            {error && (
              <p className={`text-xs tracking-wide ${error.includes('成功') ? 'text-citrine-500' : 'text-red-400'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 transition-all duration-300 disabled:opacity-50 tracking-wide"
            >
              {loading ? '处理中...' : isRegister ? '注册' : '登录'}
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-canvas-mid/30" />
          <span className="text-xs text-canvas-muted/30">或</span>
          <div className="h-px flex-1 bg-canvas-mid/30" />
        </div>

        <p className="text-center mt-4 text-xs text-canvas-muted/50">
          {mode === 'magic' ? (
            <button
              onClick={() => setMode('password')}
              className="flex items-center gap-1 mx-auto hover:text-citrine-400 transition-colors"
            >
              <KeyRound size={12} /> 使用密码登录
            </button>
          ) : (
            <>
              <button
                onClick={() => { setMode('magic'); setError(''); }}
                className="flex items-center gap-1 mx-auto hover:text-citrine-400 transition-colors"
              >
                <Mail size={12} /> 免密码登录
              </button>
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="mt-3 block mx-auto text-canvas-muted/50 hover:text-citrine-400 transition-colors"
              >
                {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
