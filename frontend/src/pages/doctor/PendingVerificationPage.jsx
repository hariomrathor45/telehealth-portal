import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingVerificationPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: '#f8fafc',
            }}
        >
            <div
                className="card"
                style={{
                    maxWidth: '650px',
                    width: '100%',
                    textAlign: 'center',
                    padding: '48px 32px',
                }}
            >
                <div
                    style={{
                        fontSize: '64px',
                        marginBottom: '20px',
                    }}
                >
                    ⏳
                </div>

                <h1 style={{ marginBottom: '12px' }}>
                    Account Verification Pending
                </h1>

                <p
                    style={{
                        color: 'var(--text-secondary)',
                        lineHeight: '1.7',
                        marginBottom: '24px',
                    }}
                >
                    Hello Dr. {user?.profile?.full_name || user?.fullName || 'Doctor'},
                    <br />
                    your doctor account has been successfully registered.
                </p>

                <div
                    style={{
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                        textAlign: 'left',
                    }}
                >
                    <h3 style={{ marginBottom: '10px' }}>
                        🩺 Verification in Progress
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            lineHeight: '1.6',
                            color: '#7c2d12',
                        }}
                    >
                        Your medical registration details and professional information
                        are currently being reviewed by the TeleHealth administration team.
                    </p>
                </div>

                <div
                    style={{
                        textAlign: 'left',
                        marginBottom: '28px',
                    }}
                >
                    <h3>What happens next?</h3>

                    <ul style={{ lineHeight: '1.8' }}>
                        <li>Admin will review your professional details.</li>
                        <li>Your medical registration information will be verified.</li>
                        <li>Your account will be approved or rejected by the admin.</li>
                        <li>After approval, you can access the Doctor Dashboard.</li>
                    </ul>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <button
                        className="btn btn-outline"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        🔄 Check Status
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingVerificationPage;