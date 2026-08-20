import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import { FaHeartbeat } from 'react-icons/fa';
import {
  HiOutlineViewGrid, HiOutlineUserGroup, HiOutlineClipboardCheck,
  HiOutlineCalendar, HiOutlineBell, HiOutlineCog, HiOutlineLogout,
  HiOutlineMenu, HiOutlineX, HiOutlineSearch, HiOutlineDocumentText,
  HiOutlineChartBar, HiOutlineUserCircle, HiOutlineClock,
  HiOutlineClipboardList, HiOutlineShieldCheck, HiOutlineUsers,
  HiOutlineSparkles, HiOutlineChevronDown,
} from 'react-icons/hi';
import notificationApi from '../../services/notificationApi';
import '../../styles/dashboard.css';

// Navigation configuration per role
const navConfig = {
  PATIENT: [
    { section: 'Main' },
    { to: '/patient/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/patient/smart-consultation', icon: <HiOutlineSparkles />, label: 'Smart Triage' },
    { to: '/patient/doctors', icon: <HiOutlineSearch />, label: 'Find Doctors' },
    { to: '/patient/appointments', icon: <HiOutlineCalendar />, label: 'Appointments' },
    { section: 'Health' },
    { to: '/patient/records', icon: <HiOutlineDocumentText />, label: 'Medical Records' },
    { section: 'Settings' },
    { to: '/patient/notifications', icon: <HiOutlineBell />, label: 'Notifications' },
    { to: '/patient/profile', icon: <HiOutlineUserCircle />, label: 'My Profile' },
  ],
  DOCTOR: [
    { section: 'Clinical' },
    { to: '/doctor/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/doctor/queue', icon: <HiOutlineClock />, label: 'Priority Queue' },
    { to: '/doctor/appointments', icon: <HiOutlineCalendar />, label: 'Appointments' },
    { section: 'Practice' },
    { to: '/doctor/patients', icon: <HiOutlineUsers />, label: 'My Patients' },
    { to: '/doctor/records', icon: <HiOutlineDocumentText />, label: 'Medical Records' },
    { section: 'Settings' },
    { to: '/doctor/availability', icon: <HiOutlineCog />, label: 'Availability' },
    { to: '/doctor/notifications', icon: <HiOutlineBell />, label: 'Notifications' },
    { to: '/doctor/profile', icon: <HiOutlineUserCircle />, label: 'My Profile' },
  ],
  ADMIN: [
    { section: 'Overview' },
    { to: '/admin/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { section: 'Management' },
    { to: '/admin/doctors', icon: <HiOutlineShieldCheck />, label: 'Doctor Verification' },
    { to: '/admin/all-doctors', icon: <HiOutlineUsers />, label: 'All Doctors' },
    { to: '/admin/patients', icon: <HiOutlineUserGroup />, label: 'Patients' },
    { to: '/admin/appointments', icon: <HiOutlineCalendar />, label: 'Appointments' },
    { section: 'Intelligence' },
    { to: '/admin/analytics', icon: <HiOutlineChartBar />, label: 'Analytics' },
    { to: '/admin/audit-logs', icon: <HiOutlineClipboardList />, label: 'Audit Trail' },
    { to: '/admin/settings', icon: <HiOutlineCog />, label: 'Settings' },
  ],
};

const roleLabels = { PATIENT: 'Patient Portal', DOCTOR: 'Doctor Portal', ADMIN: 'System Administrator' };

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const role = user?.role || 'PATIENT';
  const navItems = navConfig[role] || [];

  // Determine current page title from path
  const currentNavItem = navItems.find((item) => item.to && location.pathname.startsWith(item.to));
  const pageTitle = currentNavItem?.label || 'Dashboard';

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.getNotifications({ unreadOnly: true, limit: 1 });
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (err) {
        // silent
      }
    };
    fetchUnread();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    if (e) e.stopPropagation();
    setProfileDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = () => {
    const name = user?.profile?.fullName || user?.email || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.profile?.fullName || (user?.role === 'DOCTOR' ? `Dr. ${user?.email?.split('@')[0]}` : user?.email?.split('@')[0]);

  const profilePath = role === 'ADMIN' ? '/admin/settings' : `/${role.toLowerCase()}/profile`;
  const notificationsPath = role === 'ADMIN' ? '/admin/audit-logs' : `/${role.toLowerCase()}/notifications`;
  const dashboardPath = `/${role.toLowerCase()}/dashboard`;

  return (
    <div className="dashboard-wrapper">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate(dashboardPath)} style={{ cursor: 'pointer' }}>
            <div className="sidebar-logo-icon">
              <FaHeartbeat />
            </div>
            <div className="sidebar-logo-text">
              Tele<span>Health</span>
            </div>
          </div>
          <div className="sidebar-role-badge">{roleLabels[role]}</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) =>
            item.section ? (
              <div key={idx} className="sidebar-section-label">
                {item.section}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="sidebar-link-badge" style={{ background: 'var(--danger)', color: '#fff' }}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => navigate(profilePath)} title="View profile">
            <div className="sidebar-user-avatar">{getInitials()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <HiOutlineLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <header className="topnav">
          <div className="topnav-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>
            <div className="topnav-breadcrumb-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => navigate(dashboardPath)}
              >
                {roleLabels[role]}
              </span>
              <span style={{ color: 'var(--border-color)' }}>/</span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 600 }}>{pageTitle}</span>
            </div>
          </div>

          <div className="topnav-right">
            <ThemeToggle />
            
            <button
              className="topnav-btn"
              title="Notifications"
              onClick={() => navigate(notificationsPath)}
              style={{ position: 'relative' }}
            >
              <HiOutlineBell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--danger)',
                  }}
                />
              )}
            </button>

            {/* Profile Dropdown Container */}
            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <div
                className="topnav-profile-btn"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                title="Account Menu"
                aria-expanded={profileDropdownOpen}
              >
                <div className="sidebar-user-avatar" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>
                  {getInitials()}
                </div>
                <HiOutlineChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'transform 0.2s ease',
                    transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>

              {profileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                    <div className="sidebar-user-avatar" style={{ width: 40, height: 40, fontSize: '0.95rem' }}>
                      {getInitials()}
                    </div>
                    <div className="profile-dropdown-user-details">
                      <div className="profile-dropdown-name">{displayName}</div>
                      <div className="profile-dropdown-email">{user?.email}</div>
                      <span className="profile-dropdown-role">{role}</span>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider" />

                  <div className="profile-dropdown-items">
                    <button
                      className="profile-dropdown-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate(profilePath);
                      }}
                    >
                      <HiOutlineUserCircle size={17} />
                      <span>My Profile</span>
                    </button>

                    <button
                      className="profile-dropdown-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate(role === 'DOCTOR' ? '/doctor/availability' : profilePath);
                      }}
                    >
                      <HiOutlineCog size={17} />
                      <span>Account Settings</span>
                    </button>

                    <button
                      className="profile-dropdown-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate(notificationsPath);
                      }}
                    >
                      <HiOutlineBell size={17} />
                      <span>Notifications</span>
                    </button>
                  </div>

                  <div className="profile-dropdown-divider" />

                  <button className="profile-dropdown-item dropdown-logout-btn" onClick={handleLogout}>
                    <HiOutlineLogout size={17} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
