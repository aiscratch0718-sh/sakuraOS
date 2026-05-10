/**
 * さくらししまるのマスコット画像コンポーネント。
 *
 * variant:
 *   - "circle"   : 円形クロップアバター(ヘッダー / プロフィール小サイズ)
 *   - "avatar"   : 透過アバター(本体のみ、背景なし)
 *   - "full"     : 全身立ち絵(空状態 / ヒーローセクション)
 *   - "empty"    : 空状態用の横長イラスト(960×540)
 *   - "icon"     : favicon サイズの小アイコン
 */

export type MascotVariant = "circle" | "avatar" | "full" | "empty" | "icon";

const SRC_WEBP: Record<MascotVariant, string> = {
  circle: "/mascot/mascot-avatar-circle-512.webp",
  avatar: "/mascot/mascot-avatar-transparent-512.webp",
  full: "/mascot/mascot-full-512h.webp",
  empty: "/mascot/mascot-empty-state-960x540.webp",
  icon: "/mascot/mascot-icon-circle-128.png",
};

const SRC_FALLBACK: Record<MascotVariant, string> = {
  circle: "/mascot/mascot-avatar-circle-512.png",
  avatar: "/mascot/mascot-avatar-transparent-512.png",
  full: "/mascot/mascot-full-512h.png",
  empty: "/mascot/mascot-empty-state-960x540.webp",
  icon: "/mascot/mascot-icon-circle-128.png",
};

export function MascotImage({
  variant = "avatar",
  size,
  alt = "さくらししまる",
  className = "",
  floating = false,
}: {
  variant?: MascotVariant;
  /** ピクセル指定(width / height 共通)。empty の場合は無視。 */
  size?: number;
  alt?: string;
  className?: string;
  /** ふわふわ浮遊アニメーション付与 */
  floating?: boolean;
}) {
  const px = size ?? defaultSize(variant);
  const animClass = floating ? "animate-floatSlow" : "";

  return (
    <picture className={`inline-block ${animClass} ${className}`}>
      <source srcSet={SRC_WEBP[variant]} type="image/webp" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC_FALLBACK[variant]}
        alt={alt}
        width={px}
        height={variant === "empty" ? Math.round((px * 540) / 960) : px}
        loading="lazy"
        decoding="async"
        style={
          variant === "empty"
            ? { width: "100%", maxWidth: 960, height: "auto" }
            : { width: px, height: px, objectFit: "contain" }
        }
        draggable={false}
      />
    </picture>
  );
}

function defaultSize(variant: MascotVariant): number {
  switch (variant) {
    case "circle":
      return 56;
    case "avatar":
      return 80;
    case "full":
      return 200;
    case "icon":
      return 32;
    case "empty":
    default:
      return 480;
  }
}
