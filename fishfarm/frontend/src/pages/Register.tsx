import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authApi from '../api/endpoints/auth.api';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await authApi.register({ fullName, email, password, confirmPassword: password } as any);
      if (response.success) {
        toast.success('Registration successful! You can now log in.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
        <div>
          <div className="text-5xl text-center mb-4">🐟</div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Join FishFarm Manager today
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="Ramesh Kumar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="farmer@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Sign up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <span className="text-slate-400 text-sm">Already have an account? </span>
          <Link to="/login" className="text-sm font-medium text-sky-500 hover:text-sky-400">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
