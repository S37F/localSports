import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="text-6xl mb-4">🏟️</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404 — Page Not Found</h1>
      <p className="text-gray-500 mb-6">
        Looks like this play area doesn't exist. Let's get you back in the game.
      </p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
