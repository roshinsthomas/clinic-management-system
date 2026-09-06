// Shared navigation bar used across all frontend modules.
function Navbar({ title, onLogout }) {
  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <span className="navbar-brand mb-0 h1">
        {title}
      </span>

      <button
        className="btn btn-outline-light"
        onClick={onLogout}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;