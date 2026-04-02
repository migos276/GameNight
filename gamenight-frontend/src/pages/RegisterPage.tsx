import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorAlert from '../components/ErrorAlert';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, user, isLoading, error, setError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data.email, data.name, data.password); // Pass "name" instead of "username"
      // La redirection est gérée par le useEffect ci-dessus
    } catch (err: any) {
      console.error("Registration failed:", err.response?.data || err);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-900"
      style={{
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url(/deux-joueurs.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex w-14 h-14 bg-primary-600 rounded-2xl mb-4 items-center justify-center shadow-lg shadow-primary-600/20 hover:scale-105 transition-transform">
            <span className="text-3xl font-black text-white tracking-tighter">GN</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Join Game Night</h1>
          <p className="text-gray-400">Ready to level up your social gaming?</p>
        </div>

        {/* Formulaire avec effet Verre (Glassmorphism) */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-5 bg-dark-800/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
          {error && (
            <ErrorAlert
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
              className="bg-dark-900/50"
            />

            <Input
              label="Name" // Changed from "Username"
              type="text"
              placeholder="GameMaster99"
              {...register('name')}
              error={errors.name?.message}
              disabled={isLoading}
              className="bg-dark-900/50"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
                className="bg-dark-900/50"
              />

              <Input
                label="Confirm"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                disabled={isLoading}
                className="bg-dark-900/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="mt-2 py-4 shadow-lg shadow-primary-600/30"
          >
            Create Account
          </Button>

          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
        
        {/* Footer discret */}
        <p className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest font-semibold">
          © 2026 Game Night — Play Together
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
