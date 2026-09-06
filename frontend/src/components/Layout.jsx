import Navbar from "./Navbar";

// Shared application shell used by the different staff modules.
function Layout({
  children,
  currentPage,
  navItems,
  onNavigate,
  onLogout,
}) {
  return (
    <div className="healthsync-layout">
      {/* Common top navigation shown on authenticated pages. */}
      <Navbar
        currentPage={currentPage}
        navItems={navItems}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Each module renders its own page inside this area. */}
      <main className="healthsync-main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;