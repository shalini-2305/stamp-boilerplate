export default function AuthLayout(props: { children: React.ReactNode }) {
  return (
    <div className="auth-layout flex h-screen flex-col items-center justify-center bg-background">
      <div className="children">{props.children}</div>
    </div>
  );
}
