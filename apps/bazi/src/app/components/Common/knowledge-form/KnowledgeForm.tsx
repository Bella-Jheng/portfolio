'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Knowledge } from '../../../types/bazi';
import { KNOWLEDGE_TAGS } from '../../../types/bazi';
import { useAuth } from '../../../lib/auth-context';

type Mode = 'upload' | 'manual';

interface PendingFile {
  id: string;
  filename: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  tagsLoading: boolean;
}

const CATEGORIES = [
  { value: 'general', label: '一般' },
  { value: 'stems', label: '天干' },
  { value: 'branches', label: '地支' },
  { value: 'elements', label: '五行' },
  { value: 'fortune', label: '運勢' },
  { value: 'romance', label: '感情' },
  { value: 'health', label: '健康' },
  { value: 'career', label: '事業' },
];

const ALL_TAGS = Object.values(KNOWLEDGE_TAGS).flat();

function parseSrt(raw: string): string {
  return raw
    .split('\n')
    .filter(line => {
      const t = line.trim();
      return t &&
        !/^\d+$/.test(t) &&
        !/\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(t) &&
        !/^WEBVTT/.test(t) &&
        !/^NOTE/.test(t) &&
        !/^STYLE/.test(t);
    })
    .join('\n')
    .trim();
}

export function KnowledgeForm() {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('upload');

  // manual form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [manualTagsLoading, setManualTagsLoading] = useState(false);

  // upload
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // youtube
  const [ytUrl, setYtUrl] = useState('');
  const [ytLoading, setYtLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEntries = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/knowledge', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) { setError('無法載入知識庫'); return; }
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setError('無法載入知識庫');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const fetchSuggestedTags = async (title: string, content: string): Promise<string[]> => {
    try {
      const res = await fetch('/api/knowledge/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.tags) ? data.tags : [];
    } catch {
      return [];
    }
  };

  const updatePending = <K extends keyof PendingFile>(id: string, field: K, value: PendingFile[K]) =>
    setPending(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  const addPendingWithTags = async (items: Omit<PendingFile, 'id' | 'tags' | 'tagsLoading'>[]) => {
    const withIds = items.map(i => ({
      ...i,
      id: `${Date.now()}-${Math.random()}`,
      tags: [] as string[],
      tagsLoading: true,
    }));
    setPending(prev => [...prev, ...withIds]);

    // 非同步取得每個 item 的建議標籤
    for (const item of withIds) {
      const tags = await fetchSuggestedTags(item.title, item.content);
      setPending(prev => prev.map(p => p.id === item.id ? { ...p, tags, tagsLoading: false } : p));
    }
  };

  const readFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => /\.(txt|md|srt|vtt)$/i.test(f.name));
    if (!arr.length) { setError('僅支援 .txt · .md · .srt · .vtt 檔案'); return; }
    setError('');
    const items = await Promise.all(
      arr.map(f => new Promise<Omit<PendingFile, 'id' | 'tags' | 'tagsLoading'>>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const raw = (e.target?.result as string) ?? '';
          const isSub = /\.(srt|vtt)$/i.test(f.name);
          resolve({
            filename: f.name,
            title: f.name.replace(/\.(txt|md|srt|vtt)$/i, ''),
            content: isSub ? parseSrt(raw) : raw,
            category: 'general',
          });
        };
        reader.readAsText(f, 'UTF-8');
      }))
    );
    await addPendingWithTags(items);
  };

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    await readFiles(e.dataTransfer.files);
  }, []);

  const handleYoutube = async () => {
    if (!ytUrl.trim()) return;
    setYtLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: ytUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '解析失敗'); return; }
      await addPendingWithTags([{
        filename: `youtube:${data.videoId}`,
        title: data.title,
        content: data.transcript,
        category: 'general',
      }]);
      setYtUrl('');
    } catch {
      setError('無法連線，請稍後再試');
    } finally {
      setYtLoading(false);
    }
  };

  const toggleTag = (id: string, tag: string) =>
    setPending(prev => prev.map(p => {
      if (p.id !== id) return p;
      const tags = p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag];
      return { ...p, tags };
    }));

  const toggleManualTag = (tag: string) =>
    setManualTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const removePending = (id: string) => setPending(prev => prev.filter(p => p.id !== id));

  const postEntry = async (t: string, c: string, cat: string, tags: string[]) => {
    const token = await getToken();
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title: t, content: c, category: cat, tags }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? '新增失敗');
  };

  const handleUploadSubmit = async () => {
    if (!pending.length) return;
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await Promise.all(pending.map(p => postEntry(p.title, p.content, p.category, p.tags)));
      setSuccess(`已成功新增 ${pending.length} 筆知識！`);
      setPending([]);
      await fetchEntries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : '新增失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSuggestTags = async () => {
    if (!content.trim()) return;
    setManualTagsLoading(true);
    const tags = await fetchSuggestedTags(title, content);
    setManualTags(tags);
    setManualTagsLoading(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await postEntry(title, content, category, manualTags);
      setTitle(''); setContent(''); setCategory('general'); setManualTags([]);
      setSuccess('知識已成功加入！');
      await fetchEntries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆知識？')) return;
    try {
      const token = await getToken();
      await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
      setError('刪除失敗');
    }
  };

  return (
    <div className="space-y-10">
      <div className="border border-bz-gold/20 rounded-xl overflow-hidden">
        {/* Mode Tabs */}
        <div className="flex border-b border-bz-gold/20">
          {(['upload', 'manual'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 text-sm tracking-wider transition-colors ${
                mode === m
                  ? 'bg-bz-gold/10 text-bz-gold border-b-2 border-bz-gold'
                  : 'text-bz-muted hover:text-bz-parchment/70'
              }`}
            >
              {m === 'upload' ? '上傳來源' : '手動輸入'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {mode === 'upload' ? (
            <>
              {/* YouTube */}
              <div className="space-y-2">
                <label className="text-bz-parchment/70 text-xs tracking-widest uppercase">YouTube 影片</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleYoutube()}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-white/5 border border-bz-gold/20 rounded-lg px-4 py-2.5 text-bz-parchment placeholder:text-bz-muted/40 focus:outline-none focus:border-bz-gold/60 transition-colors text-sm"
                  />
                  <button
                    onClick={handleYoutube}
                    disabled={ytLoading || !ytUrl.trim()}
                    className="px-4 py-2.5 rounded-lg border border-bz-gold/30 text-bz-gold text-sm hover:bg-bz-gold/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    {ytLoading ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        解析中
                      </span>
                    ) : '解析字幕'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-bz-gold/15" />
                <span className="text-bz-muted/50 text-xs">或上傳檔案</span>
                <div className="flex-1 h-px bg-bz-gold/15" />
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed transition-colors py-10 flex flex-col items-center gap-3 ${
                  dragging ? 'border-bz-gold bg-bz-gold/5' : 'border-bz-gold/25 hover:border-bz-gold/50 hover:bg-white/[0.02]'
                }`}
              >
                <svg className="w-9 h-9 text-bz-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-bz-parchment/70 text-sm">拖曳或點擊上傳</p>
                <p className="text-bz-muted/50 text-xs">.txt · .md · .srt · .vtt，可多選</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".txt,.md,.srt,.vtt" multiple className="hidden"
                onChange={(e) => e.target.files && readFiles(e.target.files)} />

              {/* Pending files */}
              {pending.length > 0 && (
                <div className="space-y-3">
                  <p className="text-bz-muted/60 text-xs">待新增（可調整標題、分類與標籤）</p>
                  {pending.map((p) => (
                    <div key={p.id} className="border border-bz-gold/15 rounded-lg p-4 space-y-3 bg-white/[0.02]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-bz-muted/50 text-xs truncate">
                          {p.filename.startsWith('youtube:') ? <span className="text-bz-red/70">▶ YouTube</span> : p.filename}
                        </span>
                        <button onClick={() => removePending(p.id)}
                          className="text-bz-muted/40 hover:text-bz-red transition-colors text-xs shrink-0">✕</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input value={p.title} onChange={(e) => updatePending(p.id, 'title', e.target.value)}
                          placeholder="標題"
                          className="md:col-span-2 bg-white/5 border border-bz-gold/20 rounded-lg px-3 py-2 text-bz-parchment text-sm focus:outline-none focus:border-bz-gold/60 transition-colors" />
                        <select value={p.category} onChange={(e) => updatePending(p.id, 'category', e.target.value)}
                          className="bg-white/5 border border-bz-gold/20 rounded-lg px-3 py-2 text-bz-parchment text-sm focus:outline-none focus:border-bz-gold/60 transition-colors">
                          {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-bz-dark">{c.label}</option>)}
                        </select>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        {p.tagsLoading ? (
                          <p className="text-bz-muted/50 text-xs flex items-center gap-1.5">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                            AI 分析標籤中…
                          </p>
                        ) : (
                          <TagPicker tags={p.tags} onToggle={(tag) => toggleTag(p.id, tag)} />
                        )}
                      </div>

                      <p className="text-bz-muted/40 text-xs line-clamp-2 leading-relaxed">
                        {p.content.slice(0, 200)}{p.content.length > 200 ? '…' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-bz-red text-sm bg-bz-red/10 border border-bz-red/20 rounded-lg px-4 py-3">{error}</p>}
              {success && <p className="text-bz-jade text-sm bg-bz-jade/10 border border-bz-jade/20 rounded-lg px-4 py-3">{success}</p>}

              {pending.length > 0 && (
                <button onClick={handleUploadSubmit} disabled={submitting}
                  className="bg-bz-gold text-bz-ink font-semibold px-8 py-3 rounded-lg tracking-wider text-sm hover:bg-bz-gold/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? '新增中…' : `新增 ${pending.length} 筆知識`}
                </button>
              )}
            </>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-bz-parchment/70 text-xs tracking-widest uppercase">
                    標題 <span className="text-bz-red">*</span>
                  </label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="例：天干五行特性" required
                    className="w-full bg-white/5 border border-bz-gold/20 rounded-lg px-4 py-3 text-bz-parchment placeholder:text-bz-muted/50 focus:outline-none focus:border-bz-gold/60 transition-colors text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-bz-parchment/70 text-xs tracking-widest uppercase">分類</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-bz-gold/20 rounded-lg px-3 py-3 text-bz-parchment focus:outline-none focus:border-bz-gold/60 transition-colors text-sm">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-bz-dark">{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-bz-parchment/70 text-xs tracking-widest uppercase">
                  內容 <span className="text-bz-red">*</span>
                </label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="輸入命理知識內容，AI 將根據此知識為命主進行分析…"
                  required rows={8}
                  className="w-full bg-white/5 border border-bz-gold/20 rounded-lg px-4 py-3 text-bz-parchment placeholder:text-bz-muted/50 focus:outline-none focus:border-bz-gold/60 transition-colors text-sm resize-y" />
              </div>

              {/* Manual tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-bz-parchment/70 text-xs tracking-widest uppercase">標籤</label>
                  <button type="button" onClick={handleManualSuggestTags}
                    disabled={manualTagsLoading || !content.trim()}
                    className="text-bz-gold/70 hover:text-bz-gold text-xs flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {manualTagsLoading ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        分析中…
                      </>
                    ) : '✨ AI 建議標籤'}
                  </button>
                </div>
                <TagPicker tags={manualTags} onToggle={toggleManualTag} />
              </div>

              {error && <p className="text-bz-red text-sm bg-bz-red/10 border border-bz-red/20 rounded-lg px-4 py-3">{error}</p>}
              {success && <p className="text-bz-jade text-sm bg-bz-jade/10 border border-bz-jade/20 rounded-lg px-4 py-3">{success}</p>}

              <button type="submit" disabled={submitting}
                className="bg-bz-gold text-bz-ink font-semibold px-8 py-3 rounded-lg tracking-wider text-sm hover:bg-bz-gold/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? '新增中…' : '新增知識'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Knowledge List */}
      <div className="space-y-4">
        <h2 className="text-bz-gold font-serif text-lg">知識庫（{entries.length} 筆）</h2>
        {loading ? (
          <p className="text-bz-muted text-sm text-center py-10">載入中…</p>
        ) : entries.length === 0 ? (
          <div className="border border-bz-gold/10 rounded-xl p-10 text-center">
            <p className="text-bz-muted text-sm">尚未新增任何命理知識</p>
            <p className="text-bz-muted/60 text-xs mt-2">新增知識後，AI 將根據這些內容為命主進行更精準的分析</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-bz-gold/20 rounded-xl p-5 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-bz-parchment font-medium text-sm">{entry.title}</h3>
                      <span className="text-bz-muted text-xs bg-white/5 px-2 py-0.5 rounded-full">
                        {CATEGORIES.find(c => c.value === entry.category)?.label ?? entry.category}
                      </span>
                      {entry.tags?.map(tag => (
                        <span key={tag} className="text-bz-gold/70 text-xs bg-bz-gold/10 border border-bz-gold/20 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-bz-muted text-xs leading-relaxed line-clamp-3">{entry.content}</p>
                    <p className="text-bz-muted/50 text-xs mt-2">{new Date(entry.createdAt).toLocaleDateString('zh-TW')}</p>
                  </div>
                  <button onClick={() => handleDelete(entry.id)}
                    className="text-bz-muted/40 hover:text-bz-red transition-colors shrink-0 text-xs opacity-0 group-hover:opacity-100" title="刪除">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TagPicker({ tags, onToggle }: { tags: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="space-y-2">
      {Object.entries(KNOWLEDGE_TAGS).map(([group, groupTags]) => (
        <div key={group} className="flex items-center gap-2 flex-wrap">
          <span className="text-bz-muted/40 text-xs w-6 shrink-0">{group}</span>
          {groupTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                tags.includes(tag)
                  ? 'bg-bz-gold/20 border-bz-gold/60 text-bz-gold'
                  : 'bg-white/3 border-bz-gold/15 text-bz-muted/60 hover:border-bz-gold/35 hover:text-bz-muted'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ))}
      {tags.length > 0 && (
        <p className="text-bz-muted/40 text-xs">已選：{tags.join('、')}</p>
      )}
    </div>
  );
}

export { ALL_TAGS };
