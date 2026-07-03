import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { KeyRound } from 'lucide-react';

interface SetPasswordPageProps {
  email: string;
  onDone: () => void;
}

export default function SetPasswordPage({ email, onDone }: SetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '设置失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-citrine-50 flex items-center justify-center">
            <KeyRound size={28} className="text-citrine-500" />
          </div>
          <h1 className="text-2xl font-normal text-canvas-ink tracking-widest mb-3">密码已设置</h1>
          <p className="text-sm text-canvas-muted/60 tracking-wide mb-6">
            下次可以用邮箱和密码直接登录
          </p>
          <button
            onClick={onDone}
            className="px-6 py-2.5 rounded-xl text-sm text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 transition-all duration-300 tracking-wide"
          >
            进入看板
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-citrine-50 flex items-center justify-center">
            <KeyRound size={24} className="text-citrine-400" />
          </div>
          <h1 className="text-xl font-normal text-canvas-ink tracking-widest mb-2">设置登录密码</h1>
          <p className="text-sm text-canvas-muted/60 tracking-wide leading-relaxed">
            为 <span className="text-canvas-ink font-medium">{email}</span> 设置密码，<br />
            以后可直接用密码登录，无需等待邮件
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="设置密码（6位以上）"
            required
            minLength={6}
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
            {loading ? '设置中...' : '设置密码'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-canvas-mid/30" />
          <span className="text-xs text-canvas-muted/30">或</span>
          <div className="h-px flex-1 bg-canvas-mid/30" />
        </div>

        <p className="text-center mt-4">
          <button
            onClick={onDone}
            className="text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
          >
            暂不设置，直接进入
          </button>
        </p>
      </div>
    </div>
  );
}
