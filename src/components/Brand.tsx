import Link from "next/link";

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={compact ? "brand-lockup compact" : "brand-lockup"}
      href="/"
      aria-label="Shambunews home"
    >
      <span className="brand-image-wrap">
        <img
          src="/logo.jpeg"
          alt="Shambunews"
          className="brand-image"
        />
      </span>
    </Link>
  );
}
