import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setError('注册成功！请检查邮箱确认链接。');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-normal text-canvas-ink tracking-widest">工作看板</h1>
          <p className="text-sm text-canvas-muted/60 mt-2 tracking-wide">
            登录后数据自动云端同步
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="密码"
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
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-canvas-muted/50">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="hover:text-citrine-400 transition-colors"
          >
            {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
