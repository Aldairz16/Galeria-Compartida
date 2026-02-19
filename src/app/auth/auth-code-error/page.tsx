
export default function AuthCodeError() {
    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Authentication Error</h1>
                <p className="message message-error">
                    There was a problem signing you in. The link may have expired or is invalid.
                </p>
                <div className="text-center mt-4">
                    <a href="/login" className="btn btn-primary">Back to Login</a>
                </div>
            </div>
        </div>
    )
}
