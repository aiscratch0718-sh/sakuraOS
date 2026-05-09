"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateBranding,
  resetBranding,
  type BrandingActionResult,
} from "@/features/branding/actions";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  sidebarColor: string;
};

const initial: BrandingActionResult = { ok: false };

const PRESETS = [
  { name: "デフォルト(navy)", primary: "#1a3a6a", accent: "#2568c8", bg: "#e8f0f8", sidebar: "#ffffff" },
  { name: "森林グリーン", primary: "#1f5f3a", accent: "#0da870", bg: "#eef5ee", sidebar: "#ffffff" },
  { name: "サンセット", primary: "#8a3d2a", accent: "#d88000", bg: "#fff5ec", sidebar: "#fffbf3" },
  { name: "モノクロ", primary: "#222222", accent: "#555555", bg: "#f5f5f5", sidebar: "#ffffff" },
  { name: "ダーク", primary: "#1a1a2a", accent: "#7040c8", bg: "#252535", sidebar: "#1f1f30" },
];

export function BrandingForm({
  tenantId,
  initial: init,
}: {
  tenantId: string;
  initial: Initial;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateBranding, initial);
  const [isResetPending, startReset] = useTransition();

  const [logoUrl, setLogoUrl] = useState(init.logoUrl);
  const [primary, setPrimary] = useState(init.primaryColor);
  const [accent, setAccent] = useState(init.accentColor);
  const [bg, setBg] = useState(init.bgColor);
  const [sidebar, setSidebar] = useState(init.sidebarColor);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setUploadError(null);
    try {
      const sb = createClient();
      const ext = (f.name.split(".").pop() || "png").toLowerCase();
      const path = `${tenantId}/logo-${Date.now()}.${ext}`;
      const { error } = await sb.storage
        .from("tenant-logos")
        .upload(path, f, { cacheControl: "3600", upsert: true, contentType: f.type });
      if (error) {
        setUploadError(error.message);
        setUploading(false);
        return;
      }
      const { data: pub } = sb.storage.from("tenant-logos").getPublicUrl(path);
      setLogoUrl(pub.publicUrl);
      setUploading(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
      setUploading(false);
    }
  }

  function applyPreset(p: typeof PRESETS[number]) {
    setPrimary(p.primary);
    setAccent(p.accent);
    setBg(p.bg);
    setSidebar(p.sidebar);
  }

  function doReset() {
    if (!confirm("外観設定をデフォルトに戻します。よろしいですか?")) return;
    startReset(async () => {
      const r = await resetBranding();
      if (r.ok) router.refresh();
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      {!state.ok && state.formError && (
        <div className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold">
          {state.formError}
        </div>
      )}
      {state.ok && (
        <div className="px-3 py-2.5 rounded-btn bg-teal-bg border border-teal/30 text-teal text-[12px] font-bold">
          ✓ 外観設定を保存しました。画面に反映されます。
        </div>
      )}

      {/* ロゴ */}
      <div className="panel-pad space-y-3">
        <h3 className="text-[13px] font-bold text-navy">会社ロゴ</h3>
        <p className="text-[11px] text-ink-3">
          推奨: 透過 PNG / 横長(高さ 32px 程度で表示) / 5MB 以下。SVG も対応。
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleLogoFile}
          className="hidden"
        />

        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="flex-1 panel-pad bg-graybg flex items-center justify-center min-h-[80px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="ロゴ" className="max-h-16 max-w-full object-contain" />
            </div>
          ) : (
            <div className="flex-1 panel-pad bg-graybg text-center text-[11px] text-ink-3 py-6">
              ロゴ未設定
            </div>
          )}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-primary py-2 px-3 text-[11px] disabled:opacity-50"
            >
              {uploading ? "アップロード中..." : "ロゴをアップロード"}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="btn-ghost py-1.5 px-3 text-[11px]"
              >
                ロゴを削除
              </button>
            )}
          </div>
        </div>
        {uploadError && (
          <p className="text-[11px] text-red font-bold" role="alert">
            {uploadError}
          </p>
        )}
        <input type="hidden" name="logoUrl" value={logoUrl} />
      </div>

      {/* プリセット */}
      <div className="panel-pad space-y-2">
        <h3 className="text-[13px] font-bold text-navy">カラープリセット</h3>
        <p className="text-[11px] text-ink-3">クリックして基本配色を一括適用できます(後で個別調整可)。</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="border-2 border-line rounded-btn p-2 hover:border-blue transition-colors text-left"
            >
              <div className="flex gap-1 mb-1">
                <span className="w-4 h-4 rounded" style={{ background: p.primary }} />
                <span className="w-4 h-4 rounded" style={{ background: p.accent }} />
                <span className="w-4 h-4 rounded border border-line" style={{ background: p.bg }} />
                <span className="w-4 h-4 rounded border border-line" style={{ background: p.sidebar }} />
              </div>
              <div className="text-[10px] font-bold">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 個別カラー */}
      <div className="panel-pad space-y-3">
        <h3 className="text-[13px] font-bold text-navy">配色カスタマイズ</h3>
        <ColorRow
          label="プライマリカラー(ヘッダー)"
          name="primaryColor"
          value={primary}
          onChange={setPrimary}
          desc="画面上部ヘッダーの背景色"
          err={fe("primaryColor")}
        />
        <ColorRow
          label="アクセントカラー(ボタン・リンク)"
          name="accentColor"
          value={accent}
          onChange={setAccent}
          desc="プライマリボタン・リンク・KPI 強調色"
          err={fe("accentColor")}
        />
        <ColorRow
          label="サイドバー背景"
          name="sidebarColor"
          value={sidebar}
          onChange={setSidebar}
          desc="左サイドナビゲーションの背景色"
          err={fe("sidebarColor")}
        />
        <ColorRow
          label="ページ背景"
          name="bgColor"
          value={bg}
          onChange={setBg}
          desc="コンテンツエリアの背景色"
          err={fe("bgColor")}
        />
      </div>

      {/* プレビュー */}
      <div className="panel-pad space-y-2">
        <h3 className="text-[13px] font-bold text-navy">プレビュー</h3>
        <div
          className="rounded-panel overflow-hidden border border-line"
          style={{ background: bg }}
        >
          <div className="px-4 py-2.5 text-white flex items-center gap-2" style={{ background: primary }}>
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt="ロゴ" className="h-5" />
            ) : (
              <span className="font-extrabold text-[12px]">SAKURA OS</span>
            )}
            <span className="text-[10px] opacity-80">/ プレビュー</span>
          </div>
          <div className="flex">
            <div className="w-32 py-3 px-2 space-y-1 text-[10px]" style={{ background: sidebar }}>
              <div className="font-bold px-2 py-1 rounded" style={{ background: accent + "22", color: accent }}>
                🏠 ダッシュボード
              </div>
              <div className="px-2 py-1 text-ink-2">📋 日報一覧</div>
              <div className="px-2 py-1 text-ink-2">✓ 承認待ち</div>
            </div>
            <div className="flex-1 p-3 text-[11px]">
              <div className="font-bold mb-1" style={{ color: primary }}>本文サンプル</div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-btn text-white text-[10px] font-bold"
                style={{ background: accent }}
              >
                プライマリボタン
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={doReset}
          disabled={isResetPending || isPending}
          className="btn-ghost py-2.5 px-4 text-[12px] disabled:opacity-50"
        >
          {isResetPending ? "..." : "デフォルトに戻す"}
        </button>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="btn-primary py-2.5 px-6 text-[13px] flex-1"
        >
          {isPending ? "保存中..." : "保存して反映"}
        </button>
      </div>
    </form>
  );
}

function ColorRow({
  label,
  name,
  value,
  onChange,
  desc,
  err,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  desc?: string;
  err?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-ink-2 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-btn border border-line cursor-pointer"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$"
          className="input font-mono text-[12px] flex-1"
          placeholder="#1a3a6a"
        />
      </div>
      {desc && <p className="text-[10px] text-ink-3 mt-1">{desc}</p>}
      {err && <p className="text-[11px] text-red font-bold mt-1">{err}</p>}
    </div>
  );
}
