import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [clubs, setClubs] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [clubResponse, registrationResponse] = await Promise.all([
        api.get("/clubs"),
        api.get("/registrations"),
      ]);

      const extractArray = (response) => {
        const data = response.data;

        if (Array.isArray(data)) return data;
        if (Array.isArray(data.clubs)) return data.clubs;
        if (Array.isArray(data.registrations)) return data.registrations;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.results)) return data.results;

        return [];
      };

      setClubs(extractArray(clubResponse));
      setRegistrations(extractArray(registrationResponse));
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load data. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = registrations.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const approvedCount = registrations.filter(
    (item) => item.status?.toLowerCase() === "approved"
  ).length;

  const filteredClubs = useMemo(() => {
    const query = search.toLowerCase();

    return clubs.filter((club) =>
      [club.clubName, club.category, club.description]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [clubs, search]);

  const filteredRegistrations = useMemo(() => {
    const query = search.toLowerCase();

    return registrations.filter((item) => {
      const clubName =
        typeof item.clubId === "object"
          ? item.clubId?.clubName
          : item.clubName;

      return [
        item.studentName,
        item.studentId,
        item.email,
        item.yearLevel,
        item.status,
        clubName,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [registrations, search]);

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Club Management", icon: "♧" },
    { name: "Student Registrations", icon: "▤" },
  ];

  function changePage(page) {
    setActivePage(page);
    setSearch("");
  }

  function getClubName(registration) {
    if (typeof registration.clubId === "object") {
      return registration.clubId?.clubName || "Unknown Club";
    }

    return registration.clubName || "Club";
  }

  function getStudentName(registration) {
    return (
      registration.studentName ||
      registration.fullName ||
      registration.name ||
      "Unnamed Student"
    );
  }

  function getInitials(name) {
    return String(name)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function StatusBadge({ status }) {
    const value = status || "Pending";

    return (
      <span className={`status-badge ${value.toLowerCase()}`}>
        <span className="status-dot" />
        {value}
      </span>
    );
  }

  function renderClubs() {
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>Club Management</h1>
            <p>Explore and manage your school's student organizations.</p>
          </div>
          <span className="count-label">{clubs.length} clubs</span>
        </div>

        <div className="club-grid">
          {filteredClubs.map((club) => (
            <article className="club-card" key={club._id}>
              <div className="club-card-top">
                <div className="club-icon">
                  {getInitials(club.clubName || "Club")}
                </div>
                <span className="category-badge">
                  {club.category || "General"}
                </span>
              </div>

              <h3>{club.clubName || "Unnamed Club"}</h3>

              <p className="club-description">
                {club.description || "No description available for this club."}
              </p>

              <div className="club-card-footer">
                <span>School Organization</span>
                <span className="club-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="empty-state">
            <span>♧</span>
            <h3>No clubs found</h3>
            <p>Try another search term.</p>
          </div>
        )}
      </>
    );
  }

  function renderRegistrations() {
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>Student Registrations</h1>
            <p>Review student applications and their registration status.</p>
          </div>
          <span className="count-label">
            {registrations.length} registrations
          </span>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Registration Records</h2>
              <p>Student registration information</p>
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>STUDENT ID</th>
                  <th>CLUB</th>
                  <th>YEAR LEVEL</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.map((item) => {
                  const name = getStudentName(item);

                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="student-cell">
                          <div className="avatar">
                            {getInitials(name)}
                          </div>
                          <div>
                            <strong>{name}</strong>
                            <small>{item.email || "No email provided"}</small>
                          </div>
                        </div>
                      </td>
                      <td>{item.studentId || "—"}</td>
                      <td>{getClubName(item)}</td>
                      <td>{item.yearLevel || "—"}</td>
                      <td>{formatDate(item.createdAt || item.date)}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="empty-state">
              <span>▤</span>
              <h3>No registrations found</h3>
              <p>Try another search term.</p>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderDashboard() {
    const stats = [
      {
        title: "Total Clubs",
        value: clubs.length,
        icon: "♧",
        color: "purple",
        note: "Available organizations",
      },
      {
        title: "Total Registrations",
        value: registrations.length,
        icon: "▤",
        color: "blue",
        note: "Student applications",
      },
      {
        title: "Pending Requests",
        value: pendingCount,
        icon: "◷",
        color: "orange",
        note: "Awaiting review",
      },
      {
        title: "Approved Students",
        value: approvedCount,
        icon: "✓",
        color: "green",
        note: "Successfully approved",
      },
    ];

    return (
      <>
        <div className="welcome-banner">
          <div>
            <span className="eyebrow">SCHOOL CLUB PORTAL</span>
            <h1>Welcome to your Dashboard!</h1>
            <p>
              Manage school clubs and keep track of student registrations
              in one place.
            </p>
            <button
              className="primary-button"
              onClick={() => changePage("Student Registrations")}
            >
              View Registrations <span>→</span>
            </button>
          </div>

          <div className="welcome-illustration" aria-hidden="true">
            <div className="illustration-circle">
              <span>♧</span>
              <span>✦</span>
              <span>✓</span>
            </div>
          </div>
        </div>

        <section className="stats-grid">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-info">
                <span>{stat.title}</span>
                <strong>{stat.value}</strong>
                <small>{stat.note}</small>
              </div>
            </article>
          ))}
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>School Clubs</h2>
              <p>Discover the organizations students can join.</p>
            </div>
            <button
              className="text-button"
              onClick={() => changePage("Club Management")}
            >
              View all clubs →
            </button>
          </div>

          <div className="club-grid">
            {clubs.slice(0, 3).map((club) => (
              <article className="club-card" key={club._id}>
                <div className="club-card-top">
                  <div className="club-icon">
                    {getInitials(club.clubName || "Club")}
                  </div>
                  <span className="category-badge">
                    {club.category || "General"}
                  </span>
                </div>
                <h3>{club.clubName || "Unnamed Club"}</h3>
                <p className="club-description">
                  {club.description || "No description available for this club."}
                </p>
                <div className="club-card-footer">
                  <span>School Organization</span>
                  <span className="club-arrow">↗</span>
                </div>
              </article>
            ))}
          </div>

          {clubs.length === 0 && (
            <div className="empty-state">
              <span>♧</span>
              <h3>No clubs available</h3>
              <p>Check your database and API response.</p>
            </div>
          )}
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Recent Registrations</h2>
              <p>A quick overview of student applications.</p>
            </div>
            <button
              className="text-button"
              onClick={() => changePage("Student Registrations")}
            >
              View all →
            </button>
          </div>

          <div className="table-card">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>STUDENT ID</th>
                    <th>CLUB</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.slice(0, 5).map((item) => {
                    const name = getStudentName(item);

                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="student-cell">
                            <div className="avatar">{getInitials(name)}</div>
                            <div>
                              <strong>{name}</strong>
                              <small>{item.email || "No email provided"}</small>
                            </div>
                          </div>
                        </td>
                        <td>{item.studentId || "—"}</td>
                        <td>{getClubName(item)}</td>
                        <td><StatusBadge status={item.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {registrations.length === 0 && (
                <div className="empty-state">
                  <p>No registrations available.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">SC</div>
          <div>
            <strong>ClubSphere</strong>
            <span>STUDENT PORTAL</span>
          </div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => changePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {activePage === item.name && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Stay involved!</strong>
            <p>Find a club that matches your interests and passion.</p>
            <button onClick={() => changePage("Club Management")}>
              Explore clubs →
            </button>
          </div>

          <div className="sidebar-footer">
            <span className="footer-dot" />
            School Club Registration System
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="refresh-button"
              onClick={loadData}
              disabled={loading}
              title="Refresh data"
            >
              ↻ <span>Refresh</span>
            </button>

            <div className="admin-profile">
              <div className="admin-avatar">A</div>
              <div className="admin-info">
                <strong>Administrator</strong>
                <span>System Manager</span>
              </div>
            </div>
          </div>
        </header>

        <div className="main-content">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={loadData}>Try again</button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loader" />
              <p>Loading your school club data...</p>
            </div>
          ) : (
            <>
              {activePage === "Dashboard" && renderDashboard()}
              {activePage === "Club Management" && renderClubs()}
              {activePage === "Student Registrations" && renderRegistrations()}

              <footer className="page-footer">
                <span>© 2026 ClubConnect</span>
                <span>School Club Registration System</span>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;