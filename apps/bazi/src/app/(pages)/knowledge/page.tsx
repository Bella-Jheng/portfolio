'use client';

import { useAuth } from '../../lib/auth-context';
import { KnowledgeForm } from '../../components/Common/knowledge-form/KnowledgeForm';

export default function KnowledgePage() {
  const { user, loading, isAdmin, login } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-bz-muted text-sm">載入中…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 px-5">
        <p className="text-bz-muted text-center">請先登入</p>
        <button
          onClick={login}
          className="border border-bz-gold/40 text-bz-gold px-6 py-3 rounded-full text-sm tracking-wider hover:bg-bz-gold/10 transition-all"
        >
          Google 登入
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-5">
        <p className="text-bz-muted text-center">此頁面僅限管理員使用</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="space-y-2 mb-10">
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">知識庫管理</h1>
        <p className="text-bz-muted text-sm">
          在此新增命理知識，AI 將根據這些內容為每位命主提供更精準的分析
        </p>
      </div>

      <KnowledgeForm />
    </div>
  );
}
