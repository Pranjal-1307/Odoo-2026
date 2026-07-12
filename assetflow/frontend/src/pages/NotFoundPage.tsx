import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-3xl shadow-xl border border-surface-200 animate-fade-in">
        <h1 className="text-8xl font-black text-brand-600 tracking-tight animate-bounce">
          404
        </h1>
        <h2 className="text-2xl font-bold text-surface-900 mt-4">
          Page Not Found
        </h2>
        <p className="mt-2 text-surface-500">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition duration-200 cursor-pointer shadow-lg shadow-brand-500/25"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
