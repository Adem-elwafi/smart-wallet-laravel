import AuthLayout from '../components/AuthLayout'
import Login from '../components/Login'

function LoginPage() {
  return (
    <AuthLayout
      badge="SmartWallet Secure Access"
      title="Welcome back to your money dashboard"
      description="Sign in to track balances, review activity and keep your wallet under control from one polished workspace."
      highlights={[
        'Fast access to balances, transfers and activity.',
        'A clean mobile-first layout that stays readable on every screen.',
      ]}
    >
      <Login />
    </AuthLayout>
  )
}

export default LoginPage