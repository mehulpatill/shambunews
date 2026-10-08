import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="container" style={{ textAlign: "center", padding: "90px 0" }}>
        <div className="eyebrow">404</div>
        <h1 style={{ fontSize: 56, margin: "10px 0" }}>Story not found</h1>
        <p className="meta" style={{ marginBottom: 22 }}>
          The story may have been unpublished or the address is incorrect.
        </p>
        <Link className="btn primary" href="/">Back to home</Link>
      </div>
    </div>
  );
}
