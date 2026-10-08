import Brand from "@/components/Brand";
import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <Brand compact />
        </div>
        <div className="kicker">Editorial access</div>
        <h1 className="admin-login-title">Sign in to the newsroom</h1>
        <p className="admin-login-copy">
          Publish, schedule and manage Shambunews stories.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
