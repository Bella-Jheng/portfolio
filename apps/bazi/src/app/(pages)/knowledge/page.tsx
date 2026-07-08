'use client';

import { useRequireAdmin } from '../../lib/use-require-admin';
import { KnowledgeForm } from '../../common/components/knowledge-form/KnowledgeForm';

export default function KnowledgePage() {
  const { authorized, checking } = useRequireAdmin();

  if (checking || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-bz-muted text-sm">載入中…</p>
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
