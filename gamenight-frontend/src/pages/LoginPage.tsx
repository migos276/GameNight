import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorAlert from '../components/ErrorAlert';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isLoading, error, setError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Nettoyage au montage/démontage et redirection
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    // Nettoie l'erreur globale quand on quitte la page
    return () => setError(null);
  }, [user, navigate, setError]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null); 
    await login(data.email, data.password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-900"
      style={{
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url(/2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex w-14 h-14 bg-primary-600 rounded-2xl mb-4 items-center justify-center shadow-lg shadow-primary-600/30 hover:scale-105 transition-transform duration-200">
            <span className="text-3xl font-black text-white tracking-tighter">GN</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400">Ready for another game night?</p>
        </div>

        {/* Form Container (Glassmorphism) */}
        <div className="relative group">
          {/* Effet de lueur derrière la carte au focus (optionnel) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="relative space-y-6 bg-dark-800/70 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
          >
            {error && (
              <ErrorAlert
                message={error}
                onDismiss={() => setError(null)}
              />
            )}

            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
                className="bg-dark-900/50 border-dark-600 focus:border-primary-500"
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                  disabled={isLoading}
                  className="bg-dark-900/50 border-dark-600 focus:border-primary-500"
                />
                <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="py-4 shadow-lg shadow-primary-600/20"
            >
              Sign In
            </Button>

            <div className="pt-6 border-t border-white/5 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-500 hover:text-primary-400 font-bold transition-colors">
                  Join the club
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer simple */}
        <p className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest">
          Secure Login • Game Night v2.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
