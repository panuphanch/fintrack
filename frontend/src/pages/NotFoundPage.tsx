import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-gold-400/30">404</h1>
        <p className="mt-4 text-xl text-[#f0ece4]">Page not found</p>
        <p className="mt-2 text-[#6b6560]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-block btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
