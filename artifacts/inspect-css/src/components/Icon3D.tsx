import type { CSSProperties, HTMLAttributes } from "react";

export type Icon3DName =
  | "external-link"
  | "scan-line"
  | "warning"
  | "credit-card"
  | "download"
  | "arrow-down"
  | "help"
  | "shield-check"
  | "lock"
  | "check"
  | "chevron-right"
  | "globe-lock"
  | "lock-keyhole"
  | "badge-check"
  | "info"
  | "arrow-right"
  | "file-text"
  | "arrow-left"
  | "rotate"
  | "success"
  | "printer"
  | "shield-alert"
  | "landmark"
  | "alert-circle";

type Icon3DProps = Omit<HTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  name: Icon3DName;
  size?: number;
  width?: number;
  height?: number;
  scale?: number;
  alt?: string;
};

const iconStyle: CSSProperties = {
  display: "block",
  objectFit: "contain",
  filter: "drop-shadow(0 1px 1px rgba(16, 47, 67, 0.18))",
  flex: "none",
  border: 0,
  borderRadius: 0,
  background: "transparent",
};

export function Icon3D({ name, size, width, height, scale = 1.3, style, alt = "", ...props }: Icon3DProps) {
  const dimension = size ?? width ?? height;
  const renderedWidth = width ?? (dimension ? Math.round(dimension * scale) : undefined);
  const renderedHeight = height ?? (dimension ? Math.round(dimension * scale) : undefined);
  return (
    <img
      {...props}
      src={`${import.meta.env.BASE_URL}ui-icons-3d-color/${name}.png`}
      alt={alt}
      width={renderedWidth}
      height={renderedHeight}
      style={{ ...iconStyle, ...style }}
    />
  );
}