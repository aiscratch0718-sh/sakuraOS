"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createSafetyDoc, recordTemplateUsed, type SafetyDocResult } from "@/features/safety-docs/actions";
import { createClient } from "@/lib/supabase/client";

type Project = { id: string; name: string; customer_id: string | null };
type Customer = { id: string; name: string };
type Template = {
  id: string;
  customer_id: string;
  template_name: string;
  template_url: string;
  template_type: string | null;
  last_used_at: string | null;
};

const initial: SafetyDocResult = { ok: false };

export function SafetyDocForm({
  projects,
  customers,
  templates,
  tenantId,
}: {
  projects: Project[];
  customers: Customer[];
  templates: Template[];
  tenantId: string;
}) {
  const [state, formAction, isPending] = useActionState(createSafetyDoc, initial);
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");
  const [recipientType, setRecipientType] = useState<"contractor" | "subcontractor">("contractor");
  const [recipientName, setRecipientName] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);

  // 選択中の案件の元請(customer_id)に紐づくテンプレート
  const selectedProject = projects.find((p) => p.id === projectId);
  const customerId = selectedProject?.customer_id ?? null;
  const customerName =
    (customers.find((c) => c.id === customerId)?.name) ?? null;

  const matchingTemplates = useMemo(
    () => (customerId ? templates.filter((t) => t.customer_id === customerId) : []),
    [customerId, templates],
  );

  // 自動的に元請名を埋める
  function onProjectChange(pid: string) {
    setProjectId(pid);
    if (recipientType === "contractor") {
      const p = projects.find((x) => x.id === pid);
      const cn = customers.find((c) => c.id === p?.customer_id)?.name;
      if (cn) setRecipientName(cn);
    }
  }

  function onTypeChange(t: "contractor" | "subcontractor") {
    setRecipientType(t);
    if (t === "contractor" && customerName) {
      setRecipientName(customerName);
    } else {
      setRecipientName("");
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setUploadError(null);
    try {
      const sb = createClient();
      const ext = (f.name.split(".").pop() || "pdf").toLowerCase();
      const path = `${tenantId}/${projectId || "misc"}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage
        .from("safety-documents")
        .upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type });
      if (error) {
        setUploadError(error.message);
        setUploading(false);
        return;
      }
      const { data: signed } = await sb.storage
        .from("safety-documents")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      setFileUrl(signed?.signedUrl ?? "");
      setUploading(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
      setUploading(false);
    }
  }

  function applyTemplate(t: Template) {
    if (!confirm(`「${t.template_name}」を本書類のテンプレートとして使用しますか?`)) return;
    setFileUrl(t.template_url);
    void recordTemplateUsed(t.id);
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
            案件 <span className="text-red">*</span>
          </label>
          <select
            name="projectId"
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            required
            className="input"
          >
            <option value="">— 選択してください —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {fe("projectId") && (
            <p className="text-[11px] text-red mt-1 font-bold">{fe("projectId")}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            提出先区分 <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex items-center justify-center p-3 rounded-btn border-2 cursor-pointer text-[12px] font-bold ${recipientType === "contractor" ? "border-purple text-purple bg-purple-bg/40" : "border-line text-ink-2"}`}>
              <input type="radio" name="recipientType" value="contractor" checked={recipientType === "contractor"} onChange={() => onTypeChange("contractor")} className="hidden" />
              元請
            </label>
            <label className={`flex items-center justify-center p-3 rounded-btn border-2 cursor-pointer text-[12px] font-bold ${recipientType === "subcontractor" ? "border-amber text-amber bg-amber-bg/40" : "border-line text-ink-2"}`}>
              <input type="radio" name="recipientType" value="subcontractor" checked={recipientType === "subcontractor"} onChange={() => onTypeChange("subcontractor")} className="hidden" />
              協力会社
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            提出先名 <span className="text-red">*</span>
          </label>
          <input
            name="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
            placeholder={recipientType === "contractor" ? "案件選択で自動入力" : "協力会社名を入力"}
            className="input"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">
            書類名 <span className="text-red">*</span>
          </label>
          <input name="documentName" required className="input" placeholder="例: 〇〇現場 安全書類一式" />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-ink-2 mb-1">状態</label>
          <select name="status" defaultValue="draft" className="input">
            <option value="draft">下書き</option>
            <option value="submitted">提出済</option>
            <option value="approved">承認済</option>
          </select>
        </div>
      </div>

      {/* テンプレート提案 */}
      {customerName && matchingTemplates.length > 0 && recipientType === "contractor" && (
        <div className="panel-pad bg-purple-bg/30 border-purple/30">
          <div className="text-[12px] font-bold text-purple mb-2">
            💡 「{customerName}」さまの過去テンプレートが {matchingTemplates.length} 件あります
          </div>
          <ul className="space-y-1">
            {matchingTemplates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="block w-full text-left bg-white rounded-btn p-2 text-[11px] hover:bg-blue-bg/30 transition-colors border border-purple/20"
                >
                  <div className="font-bold text-navy">{t.template_name}</div>
                  {t.last_used_at && (
                    <div className="text-[10px] text-ink-3">
                      最終使用: {new Date(t.last_used_at).toLocaleDateString("ja-JP")}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ファイルアップロード */}
      <div className="panel-pad space-y-2">
        <label className="block text-[12px] font-bold text-ink-2">書類ファイル</label>
        <p className="text-[10px] text-ink-3">
          Excel / PDF / Word / 画像 形式に対応(50MB 上限)
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg,.webp"
          onChange={handleFile}
          className="hidden"
        />
        {fileUrl ? (
          <div className="flex items-center gap-2 p-2 bg-teal-bg/40 border border-teal/30 rounded-btn">
            <span className="text-teal text-[16px]">📎</span>
            <span className="text-[11px] font-bold text-teal flex-1 truncate">添付済み</span>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue underline">プレビュー</a>
            <button type="button" onClick={() => setFileUrl("")} className="text-[10px] text-red underline font-bold">削除</button>
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
        <input type="hidden" name="fileUrl" value={fileUrl} />
      </div>

      <div className="panel-pad">
        <label className="block text-[12px] font-bold text-ink-2 mb-1">備考</label>
        <textarea name="note" rows={2} className="input" />
      </div>

      <div className="flex gap-2">
        <Link href="/pc/safety-documents" className="btn-ghost py-2.5 px-5 text-[13px] inline-block">
          キャンセル
        </Link>
        <button type="submit" disabled={isPending || uploading} className="btn-primary py-2.5 px-6 text-[13px] flex-1">
          {isPending ? "保存中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
