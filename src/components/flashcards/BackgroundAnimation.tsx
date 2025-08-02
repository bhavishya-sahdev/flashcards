export const BackgroundAnimation = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
            className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl"
            style={{
                animation: 'float 8s ease-in-out infinite',
                animationDelay: '0s'
            }}
        />
        <div
            className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 blur-3xl"
            style={{
                animation: 'float 10s ease-in-out infinite reverse',
                animationDelay: '2s'
            }}
        />
        <div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-green-500/5 to-emerald-500/5 blur-3xl"
            style={{
                animation: 'float 12s ease-in-out infinite',
                animationDelay: '4s'
            }}
        />
    </div>
);
