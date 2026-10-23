import { useEffect, useState } from "react";
import api from "../services/api";
import "./EditRegistration.css";

function EditRegistration() {
  const [registrations, setRegistrations] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    email: "",
    yearLevel: "",
    course: "BSIT",
    clubId: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch registrations and clubs
  useEffect(() => {
    fetchData();
  }, []);

  const extractArray = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [registrationResponse, clubResponse] = await Promise.all([
        api.get("/registrations"),
        api.get("/clubs"),
      ]);

      const registrationList = extractArray(
        registrationResponse.data,
        "registrations"
      );

      const clubList = extractArray(clubResponse.data, "clubs");

      setRegistrations(registrationList);
      setClubs(clubList);
    } catch (err) {
      console.error("Error loading registration data:", err);

      setError(
        "Unable to load registrations. Please check your backend connection and API routes."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get the registration ID
  const getRegistrationId = (registration) =>
    registration._id || registration.id || "";

  // Get the student name
  const getStudentName = (registration) =>
    registration.studentName ||
    registration.fullName ||
    registration.name ||
    "";

  // Get the club ID, including populated MongoDB references
  const getClubId = (registration) => {
    const club = registration.clubId || registration.club;

    if (club && typeof club === "object") {
      return club._id || club.id || "";
    }

    return club || "";
  };

  // Select a registration to edit
  const handleSelectRegistration = (registration) => {
    setSelectedId(getRegistrationId(registration));

    setFormData({
      studentId: registration.studentId || "",
      studentName: getStudentName(registration),
      email: registration.email || "",
      yearLevel: registration.yearLevel || "",
      course: registration.course || "BSIT",
      clubId: getClubId(registration),
      status: registration.status || "Pending",
    });

    setError("");
    setSuccess("");
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Save registration changes
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedId) {
      setError("Please select a registration to edit.");
      return;
    }

    if (
      !formData.studentId.trim() ||
      !formData.studentName.trim() ||
      !formData.email.trim() ||
      !formData.yearLevel ||
      !formData.clubId
    ) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedData = {
        studentId: formData.studentId.trim(),
        studentName: formData.studentName.trim(),
        email: formData.email.trim(),
        yearLevel: formData.yearLevel,
        course: formData.course,
        clubId: formData.clubId,
        status: formData.status,
      };

      await api.put(`/registrations/${selectedId}`, updatedData);

      setSuccess("Student registration updated successfully!");

      // Refresh the registration list
      const response = await api.get("/registrations");
      const updatedRegistrations = extractArray(
        response.data,
        "registrations"
      );

      setRegistrations(updatedRegistrations);

      // Load the saved registration back into the form
      const updatedRegistration = updatedRegistrations.find(
        (registration) => getRegistrationId(registration) === selectedId
      );

      if (updatedRegistration) {
        handleSelectRegistration(updatedRegistration);
        setSuccess("Student registration updated successfully!");
      }
    } catch (err) {
      console.error("Error updating registration:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update registration. Please check your backend update route."
      );
    } finally {
      setSaving(false);
    }
  };

  // Clear the form
  const handleClear = () => {
    setSelectedId("");

    setFormData({
      studentId: "",
      studentName: "",
      email: "",
      yearLevel: "",
      course: "BSIT",
      clubId: "",
      status: "Pending",
    });

    setError("");
    setSuccess("");
  };

  // Filter registrations by search term
  const filteredRegistrations = registrations.filter((registration) => {
    const search = searchTerm.toLowerCase();

    const studentName = getStudentName(registration).toLowerCase();
    const studentId = (registration.studentId || "").toLowerCase();
    const email = (registration.email || "").toLowerCase();

    const club = registration.clubId || registration.club;

    const clubName =
      typeof club === "object"
        ? club?.clubName || club?.name || ""
        : registration.clubName || "";

    return (
      studentName.includes(search) ||
      studentId.includes(search) ||
      email.includes(search) ||
      clubName.toLowerCase().includes(search)
    );
  });

  return (
    <div className="edit-registration-page">
      {/* Page Header */}
      <div className="edit-registration-header">
        <div>
          <p className="edit-registration-breadcrumb">
            School Club Registration / Student Registrations / Edit
          </p>

          <h1>Edit Registration</h1>

          <p className="edit-registration-subtitle">
            Find a student registration and update its information.
          </p>
        </div>

        <div className="edit-registration-header-icon">✎</div>
      </div>

      {/* Statistics */}
      <div className="edit-registration-statistics">
        <div className="edit-registration-stat-card">
          <div className="edit-stat-icon">▤</div>

          <div>
            <p>Total Registrations</p>
            <h2>{registrations.length}</h2>
          </div>
        </div>

        <div className="edit-registration-stat-card">
          <div className="edit-stat-icon mint-stat-icon">✎</div>

          <div>
            <p>Selected Registration</p>
            <h2>{selectedId ? "1" : "0"}</h2>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="edit-registration-alert edit-alert-error" role="alert">
          <span>⚠</span>
          <p>{error}</p>

          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          className="edit-registration-alert edit-alert-success"
          role="status"
        >
          <span>✓</span>
          <p>{success}</p>

          <button onClick={() => setSuccess("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      {/* Registration List */}
      <div className="edit-registration-list-card">
        <div className="edit-registration-section-header">
          <div>
            <h2>Find Student Registration</h2>
            <p>Select a student below to edit their registration details.</p>
          </div>

          <button
            className="edit-registration-refresh-button"
            onClick={fetchData}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="edit-registration-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by student name, student ID, email, or club..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search student registrations"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="edit-registration-empty">
            <div className="edit-registration-spinner"></div>
            <p>Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="edit-registration-empty">
            <div className="edit-registration-empty-icon">▤</div>

            <h3>No registrations found</h3>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "There are currently no student registrations to display."}
            </p>
          </div>
        ) : (
          <div className="edit-registration-table-wrapper">
            <table className="edit-registration-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Club</th>
                  <th>Year Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.map((registration) => {
                  const registrationId = getRegistrationId(registration);
                  const club = registration.clubId || registration.club;

                  const clubName =
                    typeof club === "object"
                      ? club?.clubName || club?.name || "Club assigned"
                      : registration.clubName ||
                        clubs.find(
                          (item) =>
                            (item._id || item.id) === club
                        )?.clubName ||
                        "Club assigned";

                  const isSelected = registrationId === selectedId;

                  return (
                    <tr
                      key={registrationId}
                      className={isSelected ? "edit-row-selected" : ""}
                    >
                      <td>
                        <div className="edit-student-cell">
                          <div className="edit-student-avatar">
                            {getStudentName(registration)
                              .charAt(0)
                              .toUpperCase() || "S"}
                          </div>

                          <div>
                            <strong>
                              {getStudentName(registration) ||
                                "Unnamed Student"}
                            </strong>

                            <p>{registration.email || "No email provided"}</p>
                          </div>
                        </div>
                      </td>

                      <td>{registration.studentId || "—"}</td>

                      <td>{clubName}</td>

                      <td>{registration.yearLevel || "—"}</td>

                      <td>
                        <span
                          className={`edit-status-badge ${(
                            registration.status || "Pending"
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {registration.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            isSelected
                              ? "edit-selected-button"
                              : "edit-select-button"
                          }
                          onClick={() =>
                            handleSelectRegistration(registration)
                          }
                        >
                          {isSelected ? "Selected ✓" : "Edit"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="edit-registration-list-footer">
          Showing {filteredRegistrations.length} of {registrations.length}{" "}
          registrations
        </div>
      </div>

      {/* Edit Form */}
      {selectedId && (
        <div className="edit-registration-form-card">
          <div className="edit-registration-section-header">
            <div>
              <h2>Student Information</h2>
              <p>Modify the selected student's registration details.</p>
            </div>

            <span className="edit-form-badge">Editing</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="edit-registration-form-grid">
              <div className="edit-registration-form-group">
                <label htmlFor="editStudentId">
                  Student ID <span>*</span>
                </label>

                <input
                  type="text"
                  id="editStudentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Enter student ID"
                  required
                />
              </div>

              <div className="edit-registration-form-group">
                <label htmlFor="editStudentName">
                  Full Name <span>*</span>
                </label>

                <input
                  type="text"
                  id="editStudentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="edit-registration-form-group">
                <label htmlFor="editEmail">
                  Email Address <span>*</span>
                </label>

                <input
                  type="email"
                  id="editEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div className="edit-registration-form-group">
                <label htmlFor="editCourse">Course</label>

                <select
                  id="editCourse"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                >
                  <option value="BSIT">BSIT</option>
                  <option value="BSCS">BSCS</option>
                  <option value="BSBA">BSBA</option>
                  <option value="BSED">BSED</option>
                  <option value="BEED">BEED</option>
                  <option value="BSHM">BSHM</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="edit-registration-form-group">
                <label htmlFor="editYearLevel">
                  Year Level <span>*</span>
                </label>

                <select
                  id="editYearLevel"
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select year level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>

              <div className="edit-registration-form-group">
                <label htmlFor="editClubId">
                  School Club <span>*</span>
                </label>

                <select
                  id="editClubId"
                  name="clubId"
                  value={formData.clubId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a school club</option>

                  {clubs.map((club) => (
                    <option
                      key={club._id || club.id}
                      value={club._id || club.id}
                    >
                      {club.clubName || club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-registration-form-group">
                <label htmlFor="editStatus">Registration Status</label>

                <select
                  id="editStatus"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="edit-registration-form-footer">
              <p>
                Fields marked with <span>*</span> are required.
              </p>

              <div className="edit-registration-form-actions">
                <button
                  type="button"
                  className="edit-registration-cancel-button"
                  onClick={handleClear}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-registration-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "✓ Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Information Card */}
      <div className="edit-registration-info-card">
        <div className="edit-registration-info-icon">ℹ</div>

        <div>
          <h3>Before Saving</h3>
          <p>
            Review the student's information, selected school club, and
            registration status before saving your changes. Updates will be
            sent to the backend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EditRegistration;