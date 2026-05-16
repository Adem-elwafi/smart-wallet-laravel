import AuthLayout from '../components/AuthLayout'
import Register from '../components/Register'

function RegisterPage() {
  return (
    <AuthLayout
      badge="SmartWallet Account Setup"
      title="Create your wallet account in a minute"
      description="Set up a secure profile to manage spending, organize your finances and unlock the full SmartWallet experience."
      highlights={[
        'Simple signup flow with clear steps and validation.',
        'Designed to feel premium without getting in the way.',
      ]}
    >
      <Register />
    </AuthLayout>
  )
}

export default RegisterPage