import AuthForm from './AuthForm';

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Welcome to LancerWallet
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Sign in to your account or create a new one
        </p>
        <AuthForm />
      </div>
    </div>
  );
}
