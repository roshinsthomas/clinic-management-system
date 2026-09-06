// Shared top navigation bar used across the Clinic Management System.
function Navbar({
  currentPage,
  navItems = [],
  onNavigate,
  onLogout,
}) {
  const username =
    localStorage.getItem("username") || "User";

  const role =
    localStorage.getItem("role") || "";

  return (
    <nav className="healthsync-navbar">
      {/* Application branding */}
      <div className="healthsync-brand">
        <div className="healthsync-logo">
          +
        </div>

        <div>
          <h4>HealthSync</h4>
          <span>Clinic Management System</span>
        </div>
      </div>

      {/* Navigation links are supplied by each module. */}
      <div className="healthsync-nav-links">
        {navItems.map((item) => (
          <button
            key={item.page}
            type="button"
            className={
              currentPage === item.page
                ? "healthsync-nav-link active"
                : "healthsync-nav-link"
            }
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Logged-in staff information */}
      <div className="healthsync-profile">
        <div className="healthsync-avatar">
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="healthsync-user-info">
          <strong>{username}</strong>
          <span>
            {role.replaceAll("_", " ")}
          </span>
        </div>

        <button
          type="button"
          className="healthsync-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;