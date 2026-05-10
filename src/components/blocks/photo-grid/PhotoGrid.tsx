"use client";

import { useEffect, useId, useMemo, useRef } from "react";

/**
 * 日報・ヒヤリハット・安全書類などで使う「写真複数アップロード」グリッド。
 *
 * - 4 列 grid (モバイル 2 列 / PC 4 列)
 * - 各サムネイル 1:1 / 角丸 16px
 * - アップロード進捗 (idle / uploading / done / error) を視覚化
 * - 「+ 追加」ボタンで複数枚同時選択 / モバイルではカメラ直結 (capture)
 * - 削除はサムネ右上 ✕ (hover で表示, touch では常時)
 *
 * セキュリティ:
 * - クライアント側は accept="image/*" + 親側でサイズ検証
 * - サーバー側 (Server Action) で MIME 型再検証する前提
 *
 * パフォーマンス:
 * - blobUrl は親側で `URL.createObjectURL(file)` を作って渡す。
 * - 親が unmount 時に `URL.revokeObjectURL` する責務を持つ。
 *   (このコンポーネント内で revoke すると親で引き続き使えなくなるため)
 */

export type Photo = {
  id: string;
  url?: string;
  blobUrl?: string;
  file?: File;
  status: "idle" | "uploading" | "done" | "error";
  progress?: number;
  error?: string;
};

export type PhotoGridProps = {
  photos: Photo[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  maxPhotos?: number;
  acceptCamera?: boolean;
  className?: string;
};

export function PhotoGrid({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 8,
  acceptCamera = true,
  className = "",
}: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const remaining = Math.max(0, maxPhotos - photos.length);
  const canAdd = remaining > 0;

  // アップロード中のサムネ件数を aria-live で通知
  const uploadingCount = useMemo(
    () => photos.filter((p) => p.status === "uploading").length,
    [photos],
  );

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // remaining までで切り捨て
    const picked = Array.from(fileList).slice(0, remaining);
    if (picked.length > 0) {
      onAdd(picked);
    }
    // 同じファイルを連続選択できるようにリセット
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={className}>
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        role="list"
        aria-label="添付写真"
      >
        {photos.map((photo, idx) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            index={idx + 1}
            onRemove={() => onRemove(photo.id)}
          />
        ))}

        {canAdd && (
          <AddTile
            inputId={inputId}
            onClick={() => inputRef.current?.click()}
            remaining={remaining}
          />
        )}
      </div>

      {/* file input — visually hidden, label 経由でクリック可能 */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept="image/*"
        {...(acceptCamera ? { capture: "environment" as const } : {})}
        onChange={handleSelect}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* 進捗を SR にアナウンス */}
      <div role="status" aria-live="polite" className="sr-only">
        {uploadingCount > 0
          ? `${uploadingCount} 枚の写真をアップロード中です`
          : ""}
      </div>
    </div>
  );
}

function PhotoTile({
  photo,
  index,
  onRemove,
}: {
  photo: Photo;
  index: number;
  onRemove: () => void;
}) {
  const src = photo.url ?? photo.blobUrl ?? "";
  const isUploading = photo.status === "uploading";
  const isError = photo.status === "error";
  const isDone = photo.status === "done";

  return (
    <div
      role="listitem"
      className="relative aspect-square rounded-[16px] overflow-hidden bg-graybg ring-1 ring-line group focus-within:ring-2 focus-within:ring-blue"
    >
      {src ? (
        // ローカル blob または既アップロード URL
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`添付写真 ${index}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ink-3 text-[24px]">
          🖼
        </div>
      )}

      {/* uploading / idle: 半透明オーバーレイ + 進捗バー */}
      {(isUploading || photo.status === "idle") && (
        <div
          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-end p-2"
          aria-live="polite"
          aria-label={
            isUploading
              ? `写真 ${index} をアップロード中... ${Math.round(photo.progress ?? 0)}%`
              : `写真 ${index} を準備中`
          }
        >
          <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, photo.progress ?? 0))}%` }}
            />
          </div>
          <span className="mt-1 text-[10px] font-bold text-white tabular-nums">
            {isUploading ? `${Math.round(photo.progress ?? 0)}%` : "準備中"}
          </span>
        </div>
      )}

      {/* done: 右下にチェック */}
      {isDone && (
        <div
          className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-status-done text-white text-[12px] font-bold flex items-center justify-center shadow"
          aria-hidden
        >
          ✓
        </div>
      )}

      {/* error: 全面赤オーバーレイ + 再選択用削除リンク */}
      {isError && (
        <div className="absolute inset-0 bg-red-600/70 flex flex-col items-center justify-center text-white p-2 text-center">
          <span aria-hidden className="text-[20px]">
            ⚠
          </span>
          <span className="text-[11px] font-bold mt-0.5">アップロード失敗</span>
          {photo.error && (
            <span className="text-[10px] text-white/80 line-clamp-2">
              {photo.error}
            </span>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="mt-1 text-[10px] underline decoration-white/80 underline-offset-2 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            削除して選び直す
          </button>
        </div>
      )}

      {/* 削除ボタン: hover で表示 / touch では常時 */}
      {!isError && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`写真 ${index} を削除`}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-[12px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span aria-hidden>✕</span>
        </button>
      )}
    </div>
  );
}

function AddTile({
  inputId,
  onClick,
  remaining,
}: {
  inputId: string;
  onClick: () => void;
  remaining: number;
}) {
  return (
    <label
      htmlFor={inputId}
      className="block aspect-square cursor-pointer"
      role="listitem"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`写真を追加 (あと ${remaining} 枚)`}
        className="w-full h-full rounded-[16px] border-2 border-dashed border-line bg-white hover:bg-graybg hover:border-blue/60 transition-colors flex flex-col items-center justify-center gap-1 text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
      >
        <span aria-hidden className="text-[28px] leading-none">
          +
        </span>
        <span className="text-[11px] font-bold">写真を追加</span>
        <span className="text-[10px] text-ink-3">あと {remaining} 枚</span>
      </button>
    </label>
  );
}

/**
 * 親側で blobUrl を扱う際のヘルパ — unmount 時の revoke を忘れないため。
 *
 * 使い方:
 *   const photos = useMemo(() => state.map(...), [state]);
 *   useRevokeBlobUrls(photos);
 */
export function useRevokeBlobUrls(photos: Photo[]) {
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.blobUrl) URL.revokeObjectURL(p.blobUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
