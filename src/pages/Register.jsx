import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import theme from "../theme";

const { colors: c } = theme;

const initialForm = {
  fullName: "",
  regNumber: "",
  email: "",
  password: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.email.endsWith("@lpu.in")) {
      return "Only @lpu.in email addresses are allowed.";
    }
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const { error: err } = await register(form);

      if (err) throw err;

      navigate("/login?registered=1");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.cardWrapper}>
        <Header />
        <div style={styles.card}>
          <h2 style={styles.title}>Create your account</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <Field label="Full Name" value={form.fullName} onChange={(v) => updateField("fullName", v)} />
            <Field label="Registration Number" value={form.regNumber} onChange={(v) => updateField("regNumber", v)} />
            <Field label="LPU Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
            <Field label="Password" type="password" value={form.password} onChange={(v) => updateField("password", v)} />

            {error && <p style={styles.error}>{error}</p>}

            <button disabled={loading} style={styles.button}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Separate Components */
function Header() {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <h1>LPUTown</h1>
      <p>Join the student network</p>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
      />
    </div>
  );
}

/* 🔹 Styles Object (Cleaner than inline spam) */
const styles = {
  page: {
    minHeight: "100vh",
    background: c.bgPage,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    background: c.bgGlass,
    padding: 24,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  error: {
    color: c.error,
    fontSize: 12,
  },
  button: {
    padding: 12,
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    marginTop: 16,
  },
  link: {
    color: c.primary,
  },
};
