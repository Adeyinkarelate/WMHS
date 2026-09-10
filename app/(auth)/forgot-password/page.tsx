import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ForgotPasswordForm token={searchParams.token} />;
}
