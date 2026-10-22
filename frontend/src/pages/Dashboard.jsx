
import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [clubs, setClubs] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [clubsResponse, registrationsResponse] =
          await Promise.all([
            api.get("/clubs"),
            api.get("/registrations"),
          ]);

        const clubsData = clubsResponse.data;
        setClubs(
            Array.isArray(clubsData)
            ? clubsData
            : clubsData.clubs || clubsData.data || []
        );

        const registrationsData = registrationsResponse.data;

        setRegistrations(
            Array.isArray(registrationsData)
            ? registrationsData
            : registrationsData.registrations || registrationsData.data || []
        );
        
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data. Check your backend."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const pendingCount = registrations.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = registrations.filter(
    (item) => item.status === "Approved"
  ).length;

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  const stats = [
    { title: "Total Clubs", value: clubs.length },
    { title: "Total Registrations", value: registrations.length },
    { title: "Pending", value: pendingCount },
    { title: "Approved", value: approvedCount },
  ];

  return (
    <main className="dashboard">
      <h1>School Club Registration</h1>
      <p>Dashboard overview of school clubs and student registrations.</p>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.title}>
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="clubs-section">
        <h2>Available Clubs</h2>

        {clubs.length === 0 ? (
          <p>No clubs found.</p>
        ) : (
          <div className="clubs-grid">
            {clubs.map((club) => (
              <article className="club-card" key={club._id}>
                <h3>{club.clubName}</h3>
                <p>{club.description || "No description available."}</p>
                <p>
                  <strong>Category:</strong>{" "}
                  {club.category || "General"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
