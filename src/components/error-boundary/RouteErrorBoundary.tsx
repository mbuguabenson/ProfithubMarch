import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

const RouteErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = 'Something went wrong';
    let message = 'An unexpected error occurred. Please try again.';
    let status: number | null = null;

    if (isRouteErrorResponse(error)) {
        status = error.status;
        if (error.status === 404) {
            title = 'Page Not Found';
            message = "The page you're looking for doesn't exist.";
        } else if (error.status === 403) {
            title = 'Access Denied';
            message = "You don't have permission to view this page.";
        } else {
            message = error.data?.message || error.statusText || message;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-primary, #0a0e1a)',
                color: 'var(--text-general, #ffffff)',
                padding: '2rem',
                textAlign: 'center',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {status && (
                <div
                    style={{
                        fontSize: '6rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                        marginBottom: '1rem',
                    }}
                >
                    {status}
                </div>
            )}

            <h1
                style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    marginBottom: '0.75rem',
                }}
            >
                {title}
            </h1>

            <p
                style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.5)',
                    maxWidth: '400px',
                    marginBottom: '2rem',
                    lineHeight: 1.6,
                }}
            >
                {message}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    Go to Dashboard
                </button>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '0.75rem',
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
};

export default RouteErrorBoundary;
