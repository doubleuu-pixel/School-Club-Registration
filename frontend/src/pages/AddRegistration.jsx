```jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AddRegistration.css";

function AddRegistration() {
  const [clubs, setClubs] = useState([]);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    email: "",
    yearLevel: "",
    course: "BSIT",
    clubId: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch available clubs from the backend
  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
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
      setLoadingClubs(false);
    }
  };

  // Update form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Submit registration
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

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
      setLoading(true);

      const registrationData = {
        studentId: formData.studentId.trim(),
        studentName: formData.studentName.trim(),
        email: formData.email.trim(),
        yearLevel: formData.yearLevel,
        course: formData.course,
        clubId: formData.clubId,
      };

      await api.post("/registrations", registrationData);

      setSuccess("Student registration added successfully!");

      setFormData({
        studentId: "",
        studentName: "",
        email: "",
        yearLevel: "",
        course: "BSIT",
        clubId: "",
      });
    } catch (err) {
      console.error("Error adding registration:", err);

      setError(
        err.response?.data?.message ||
          "Failed to add registration. Please check your backend API."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-registration-page">
      <div className="registration-header">
        <div>
          <p className="registration-breadcrumb">
            School Club Registration / Student Registrations
          </p>

          <h1>Add Student Registration</h1>

          <p className="registration-subtitle">
            Register a student to join one of the available school clubs.
          </p>
        </div>

        <div className="registration-header-icon">✚</div>
      </div>

      <div className="registration-card">
        <div className="registration-card-header">
          <div>
            <h2>Student Information</h2>
            <p>Enter the student's details below.</p>
          </div>

          <span className="required-label">* Required fields</span>
        </div>

        {error && (
          <div className="registration-alert error-alert" role="alert">
            <span>⚠</span>
            {error}
          </div>
        )}

        {success && (
          <div className="registration-alert success-alert" role="status">
            <span>✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="registration-form-grid">
            <div className="registration-form-group">
              <label htmlFor="studentId">
                Student ID <span>*</span>
              </label>

              <input
                type="text"
                id="studentId"
                name="studentId"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="registration-form-group">
              <label htmlFor="studentName">
                Full Name <span>*</span>
              </label>

              <input
                type="text"
                id="studentName"
                name="studentName"
                placeholder="Enter student's full name"
                value={formData.studentName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="registration-form-group">
              <label htmlFor="email">
                Email Address <span>*</span>
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="registration-form-group">
              <label htmlFor="course">Course</label>

              <select
                id="course"
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

            <div className="registration-form-group">
              <label htmlFor="yearLevel">
                Year Level <span>*</span>
              </label>

              <select
                id="yearLevel"
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

            <div className="registration-form-group">
              <label htmlFor="clubId">
                School Club <span>*</span>
              </label>

              <select
                id="clubId"
                name="clubId"
                value={formData.clubId}
                onChange={handleChange}
                required
                disabled={loadingClubs || clubs.length === 0}
              >
                <option value="">
                  {loadingClubs
                    ? "Loading clubs..."
                    : clubs.length === 0
                    ? "No clubs available"
                    : "Select a school club"}
                </option>

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
          </div>

          <div className="registration-form-footer">
            <p>
              Fields marked with <span>*</span> are required.
            </p>

            <div className="registration-form-buttons">
              <button
                type="button"
                className="registration-cancel-btn"
                onClick={() => {
                  setFormData({
                    studentId: "",
                    studentName: "",
                    email: "",
                    yearLevel: "",
                    course: "BSIT",
                    clubId: "",
                  });
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="registration-submit-btn"
                disabled={loading || loadingClubs || clubs.length === 0}
              >
                {loading ? "Submitting..." : "+ Add Registration"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="registration-info-card">
        <div className="registration-info-icon">ℹ</div>

        <div>
          <h3>Registration Reminder</h3>
          <p>
            Please ensure that the student's information is correct and that
            the selected club is the one they wish to join.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddRegistration;
```