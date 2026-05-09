"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { uploadContractorTemplate, type SafetyDocResult } from "@/features/safety-docs/actions";
import { createClient } from "@/lib/supabase/client";

type Customer = { id: string; name: string };
const initial: SafetyDocResult = { ok: false };

export function TemplateForm({ customers, tenantId }: { customers: Customer[]; tenantId: string }) {
  const [state, formAction, isPending] = useActionState(uploadContractorTemplate, initial);
  const [templateUrl, setTemplateUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setUploadError(null);
    try {
      const sb = createClient();
      const ext = (f.name.split(".").pop() || "pdf").toLowerCase();
      const path = `${tenantId}/templates/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage
        .from("contractor-templates")
        .upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type });
      if (error) {
        setUploadError(error.message);
        setUploading(false);
        return;
      }
      const { data: signed } = await sb.storage
        .from("contractor-templates")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      setTemplateUrl(signed?.signedUrl ?? "");
      setUploading(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-3">
      {!state.ok && state.formError && (
        <div className="px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-bold">
          {state.formError}
        </div>
      )}
      <div className="panel-pad space-y-3">
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            元請(顧客)<span className="text-red">*</span>
          </label>
          <select name="customerId" required className="input">
            <option value="">— 選択してください —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {fe("customerId") && <p className="text-[11px] text-red mt-1 font-bold">{fe("customerId")}</p>}
        </div>
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            テンプレート名 <span className="text-red">*</span>
          </label>
          <input name="templateName" required className="input" placeholder="例: 〇〇電気 安全書類フォーマット 2026年版" />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">種別(任意)</label>
          <input name="templateType" className="input" placeholder="例: 入構申請書 / 工事計画書" />
        </div>
      </div>

      <div className="panel-pad space-y-2">
        <label className="block text-[12px] font-bold text-ink-2">
          ファイル <span className="text-red">*</span>
        </label>
        <p className="text-[10px] text-ink-3">Excel / PDF / Word / 画像(50MB 上限)</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg,.webp"
          onChange={handleFile}
          className="hidden"
        />
        {templateUrl ? (
          <div className="flex items-center gap-2 p-2 bg-teal-bg/40 border border-teal/30 rounded-btn">
            <span className="text-teal text-[16px]">📎</span>
            <span className="text-[11px] font-bold text-teal flex-1 truncate">添付済み</span>
            <a href={templateUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue underline">プレビュー</a>
            <button type="button" onClick={() => setTemplateUrl("")} className="text-[10px] text-red underline font-bold">削除</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 border-2 border-dashed border-line rounded-btn text-[11px] font-bold text-ink-2 hover:border-blue hover:text-blue disabled:opacity-50"
          >
            {uploading ? "アップロード中..." : "📎 ファイルを選択 / アップロード"}
          </button>
        )}
        {uploadError && <p className="text-[11px] text-red font-bold">{uploadError}</p>}
        <input type="hidden" name="templateUrl" value={templateUrl} />
        {fe("templateUrl") && <p className="text-[11px] text-red font-bold">{fe("templateUrl")}</p>}
      </div>

      <div className="flex gap-2">
        <Link href="/pc/contractor-templates" className="btn-ghost py-2.5 px-5 text-[13px] inline-block">
          キャンセル
        </Link>
        <button type="submit" disabled={isPending || uploading || !templateUrl} className="btn-primary py-2.5 px-6 text-[13px] flex-1">
          {isPending ? "保存中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
