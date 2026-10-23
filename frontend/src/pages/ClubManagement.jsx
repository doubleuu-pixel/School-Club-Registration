import { useEffect, useState } from "react";
import api from "../services/api";
import "./ClubManagement.css";

function ClubManagement() {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    clubName: "",
    description: "",
    category: "",
    adviser: "",
    meetingSchedule: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch all clubs
  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clubs");
      const data = response.data;

      const clubList = Array.isArray(data)
        ? data
        : data.clubs || data.data || data.results || [];

      setClubs(clubList);
    } catch (err) {
      console.error("Error fetching clubs:", err);
      setError("Unable to load clubs. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Open the form for adding a club
  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open the form for editing a club
  const handleEdit = (club) => {
    setEditingId(club._id || club.id);

    setFormData({
      clubName: club.clubName || club.name || "",
      description: club.description || "",
      category: club.category || "",
      adviser: club.adviser || "",
      meetingSchedule: club.meetingSchedule || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Add or update a club
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.clubName.trim()) {
      setError("Please enter the club name.");
      return;
    }

    try {
      setSaving(true);

      const clubData = {
        clubName: formData.clubName.trim(),
        description: formData.description.trim(),
        category: formData.category,
        adviser: formData.adviser.trim(),
        meetingSchedule: formData.meetingSchedule.trim(),
      };

      if (editingId) {
        await api.put(`/clubs/${editingId}`, clubData);
        setSuccess("Club updated successfully!");
      } else {
        await api.post("/clubs", clubData);
        setSuccess("Club added successfully!");
      }

      setFormData(initialForm);
      setShowForm(false);
      setEditingId(null);

      await fetchClubs();
    } catch (err) {
      console.error("Error saving club:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save the club. Please check your backend routes."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete a club
  const handleDelete = async (club) => {
    const clubId = club._id || club.id;
    const name = club.clubName || club.name || "this club";

    if (!clubId) {
      setError("Cannot delete this club because its ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/clubs/${clubId}`);

      setSuccess("Club deleted successfully!");
      await fetchClubs();
    } catch (err) {
      console.error("Error deleting club:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete the club. It may have existing registrations."
      );
    }
  };

  // Close the form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
    setError("");
  };

  // Search clubs
  const filteredClubs = clubs.filter((club) => {
    const search = searchTerm.toLowerCase();

    return (
      (club.clubName || club.name || "").toLowerCase().includes(search) ||
      (club.description || "").toLowerCase().includes(search) ||
      (club.category || "").toLowerCase().includes(search) ||
      (club.adviser || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="club-management-page">
      {/* Page Header */}
      <div className="club-management-header">
        <div>
          <p className="club-management-breadcrumb">
            School Club Registration / Club Management
          </p>

          <h1>Club Management</h1>

          <p className="club-management-subtitle">
            Manage school clubs, their details, and their assigned advisers.
          </p>
        </div>

        <button className="add-club-button" onClick={handleAdd}>
          <span>+</span> Add New Club
        </button>
      </div>

      {/* Statistics */}
      <div className="club-statistics">
        <div className="club-stat-card">
          <div className="club-stat-icon green-icon">▦</div>
          <div>
            <p>Total Clubs</p>
            <h2>{clubs.length}</h2>
          </div>
        </div>

        <div className="club-stat-card">
          <div className="club-stat-icon mint-icon">✓</div>
          <div>
            <p>Matching Clubs</p>
            <h2>{filteredClubs.length}</h2>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="club-alert club-error" role="alert">
          <span>⚠</span> {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="club-alert club-success" role="status">
          <span>✓</span> {success}
          <button
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="club-form-card">
          <div className="club-form-heading">
            <div>
              <h2>{editingId ? "Edit Club" : "Add New Club"}</h2>
              <p>
                {editingId
                  ? "Update the information for this school club."
                  : "Enter the details of the new school club."}
              </p>
            </div>

            <button
              className="club-close-button"
              onClick={handleCancel}
              type="button"
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="club-form-grid">
              <div className="club-form-group">
                <label htmlFor="clubName">
                  Club Name <span>*</span>
                </label>

                <input
                  type="text"
                  id="clubName"
                  name="clubName"
                  placeholder="Enter club name"
                  value={formData.clubName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="club-form-group">
                <label htmlFor="category">Club Category</label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="Academic">Academic</option>
                  <option value="Technology">Technology</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts and Culture">Arts and Culture</option>
                  <option value="Community Service">Community Service</option>
                  <option value="Special Interest">Special Interest</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="club-form-group">
                <label htmlFor="adviser">Club Adviser</label>

                <input
                  type="text"
                  id="adviser"
                  name="adviser"
                  placeholder="Enter adviser name"
                  value={formData.adviser}
                  onChange={handleChange}
                />
              </div>

              <div className="club-form-group">
                <label htmlFor="meetingSchedule">Meeting Schedule</label>

                <input
                  type="text"
                  id="meetingSchedule"
                  name="meetingSchedule"
                  placeholder="e.g. Every Friday, 3:00 PM"
                  value={formData.meetingSchedule}
                  onChange={handleChange}
                />
              </div>

              <div className="club-form-group club-full-width">
                <label htmlFor="description">Club Description</label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the club's purpose and activities..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>

            <div className="club-form-actions">
              <button
                type="button"
                className="club-secondary-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="club-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Changes"
                  : "+ Add Club"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Club List */}
      <div className="club-list-card">
        <div className="club-list-header">
          <div>
            <h2>School Clubs</h2>
            <p>View and manage all registered school clubs.</p>
          </div>

          <button
            className="club-refresh-button"
            onClick={fetchClubs}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Search */}
        <div className="club-search-wrapper">
          <span className="club-search-icon">⌕</span>

          <input
            type="search"
            placeholder="Search by club name, category, or adviser..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search school clubs"
          />

          {searchTerm && (
            <button
              className="club-clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="club-empty-state">
            <div className="club-loading-spinner"></div>
            <p>Loading school clubs...</p>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="club-empty-state">
            <div className="club-empty-icon">▦</div>

            <h3>
              {searchTerm ? "No matching clubs found" : "No clubs available"}
            </h3>

            <p>
              {searchTerm
                ? "Try searching with a different keyword."
                : "Add your first school club to get started."}
            </p>

            {!searchTerm && (
              <button className="club-primary-button" onClick={handleAdd}>
                + Add New Club
              </button>
            )}
          </div>
        ) : (
          <div className="club-table-wrapper">
            <table className="club-table">
              <thead>
                <tr>
                  <th>Club Information</th>
                  <th>Category</th>
                  <th>Adviser</th>
                  <th>Meeting Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredClubs.map((club) => {
                  const clubId = club._id || club.id;

                  return (
                    <tr key={clubId}>
                      <td>
                        <div className="club-information">
                          <div className="club-avatar">
                            {(club.clubName || club.name || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {club.clubName || club.name || "Unnamed Club"}
                            </strong>

                            <p>
                              {club.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="club-category-badge">
                          {club.category || "Uncategorized"}
                        </span>
                      </td>

                      <td>{club.adviser || "Not assigned"}</td>

                      <td>{club.meetingSchedule || "Not scheduled"}</td>

                      <td>
                        <div className="club-action-buttons">
                          <button
                            className="club-edit-button"
                            onClick={() => handleEdit(club)}
                            title="Edit club"
                          >
                            Edit
                          </button>

                          <button
                            className="club-delete-button"
                            onClick={() => handleDelete(club)}
                            title="Delete club"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="club-list-footer">
          Showing {filteredClubs.length} of {clubs.length} clubs
        </div>
      </div>
    </div>
  );
}

export default ClubManagement;