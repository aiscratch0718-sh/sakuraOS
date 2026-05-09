"use client";

import { useActionState, useRef, useState } from "react";
import { submitReceipt, type ReceiptActionResult, RECEIPT_CATEGORIES, RECEIPT_SUBCATEGORIES } from "@/features/receipts/actions";
import { createClient } from "@/lib/supabase/client";

type Project = { id: string; name: string };
const initial: ReceiptActionResult = { ok: false };

export function ReceiptForm({ projects, tenantId }: { projects: Project[]; tenantId: string }) {
  const [state, formAction, isPending] = useActionState(submitReceipt, initial);
  const [category, setCategory] = useState<string>("消耗品");
  const [paymentMethod, setPaymentMethod] = useState<"company_card" | "personal_advance">("company_card");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fe = (k: string) => (!state.ok ? state.fieldErrors?.[k]?.[0] : undefined);
  const subs = RECEIPT_SUBCATEGORIES[category] ?? [];

  const todayJP = (() => {
    const t = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setUploadError(null);
    try {
      const sb = createClient();
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${tenantId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage
        .from("receipts")
        .upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type });
      if (error) {
        setUploadError(error.message);
        setUploading(false);
        return;
      }
      const { data: signed } = await sb.storage
        .from("receipts")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      setPhotoUrl(signed?.signedUrl ?? "");
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
          <label className="block text-[11px] font-bold text-ink-2 mb-1">領収日 <span className="text-red">*</span></label>
          <input name="receiptDate" type="date" required defaultValue={todayJP} className="input" />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-ink-2 mb-1">金額(円) <span className="text-red">*</span></label>
          <input name="amountYen" type="number" inputMode="numeric" required min={0} placeholder="例: 3500" className="input" />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-ink-2 mb-1">関連現場(任意)</label>
          <select name="projectId" className="input">
            <option value="">— 選択しない —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-ink-2 mb-1">カテゴリ <span className="text-red">*</span></label>
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {RECEIPT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {subs.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-ink-2 mb-1">サブカテゴリ</label>
            <select name="subcategory" className="input">
              <option value="">— 選択しない —</option>
              {subs.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {category === "食事代" && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-ink-2 mb-1">同行者(食事代の場合)</label>
              <input name="companions" placeholder="例: 〇〇商事 山田様、自社 鈴木" className="input" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-2 mb-1">食事区分</label>
              <select name="mealType" className="input">
                <option value="">— 選択しない —</option>
                <option value="business_entertainment">接待交際費</option>
                <option value="welfare">福利厚生費</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="panel-pad space-y-3 bg-amber-bg/20">
        <label className="block text-[11px] font-bold text-amber">支払方法 <span className="text-red">*</span></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center justify-center p-3 rounded-btn border-2 cursor-pointer text-[12px] font-bold ${paymentMethod === "company_card" ? "border-teal text-teal bg-teal-bg/40" : "border-line text-ink-2"}`}>
            <input type="radio" name="paymentMethod" value="company_card" checked={paymentMethod === "company_card"} onChange={() => setPaymentMethod("company_card")} className="hidden" />
            会社カード
          </label>
          <label className={`flex items-center justify-center p-3 rounded-btn border-2 cursor-pointer text-[12px] font-bold ${paymentMethod === "personal_advance" ? "border-amber text-amber bg-amber-bg/40" : "border-line text-ink-2"}`}>
            <input type="radio" name="paymentMethod" value="personal_advance" checked={paymentMethod === "personal_advance"} onChange={() => setPaymentMethod("personal_advance")} className="hidden" />
            個人立替
          </label>
        </div>
        <p className="text-[10px] text-ink-3">
          会社カード(ガソリンカード/ETC等)= 提出のみ / 個人立替 = 精算申請可能
        </p>
        {paymentMethod === "personal_advance" && (
          <label className="flex items-center gap-2 text-[12px]">
            <input type="checkbox" name="needsReimbursement" defaultChecked className="w-4 h-4 accent-blue" />
            <span className="font-bold text-ink-2">精算を申請する</span>
          </label>
        )}
      </div>

      <div className="panel-pad space-y-2">
        <label className="block text-[11px] font-bold text-ink-2">領収書の写真</label>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" capture="environment" onChange={handleFile} className="hidden" />
        {photoUrl ? (
          <div className="flex items-center gap-2 p-2 bg-teal-bg/40 border border-teal/30 rounded-btn">
            <span className="text-teal text-[16px]">📷</span>
            <span className="text-[11px] font-bold text-teal flex-1">添付済み</span>
            <button type="button" onClick={() => setPhotoUrl("")} className="text-[10px] text-red underline font-bold">削除</button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full py-2 border-2 border-dashed border-line rounded-btn text-[11px] font-bold text-ink-2 hover:border-blue hover:text-blue disabled:opacity-50">
            {uploading ? "アップロード中..." : "📷 領収書を撮影 / 選択"}
          </button>
        )}
        {uploadError && <p className="text-[11px] text-red font-bold">{uploadError}</p>}
        <input type="hidden" name="photoUrl" value={photoUrl} />
      </div>

      <div className="panel-pad">
        <label className="block text-[11px] font-bold text-ink-2 mb-1">備考</label>
        <textarea name="note" rows={2} className="input" />
        {fe("amountYen") && <p className="text-[11px] text-red mt-1 font-bold">{fe("amountYen")}</p>}
      </div>

      <button type="submit" disabled={isPending || uploading} className="btn-primary w-full py-3 text-[15px]">
        {isPending ? "送信中..." : "提出する"}
      </button>
    </form>
  );
}
