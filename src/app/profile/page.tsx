"use client";

import { useEffect, useState } from "react";
import { getUserProfileAction, updateProfileAction } from "@/app/actions/authActions";
import { User, Phone, MapPin, Building, ShieldCheck, CheckCircle2, Sparkles, ArrowRight, Save, Lock } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    institution: "",
    role: "STUDENT",
  });

  const loadProfile = async () => {
    setLoading(true);
    const res = await getUserProfileAction();
    if (res.success && res.user) {
      setProfileData({
        id: res.user.id || "",
        name: res.user.name || "",
        phone: res.user.phone || "",
        address: res.user.address || "",
        institution: res.user.institution || "",
        role: res.user.role || "STUDENT",
      });
    } else {
      setErrorMsg(res.error || "Please sign in to view your profile.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const res = await updateProfileAction({
      name: profileData.name,
      phone: profileData.phone,
      address: profileData.address,
      institution: profileData.institution,
    });

    if (res.success) {
      setSuccessMsg("Your profile information has been updated successfully!");
    } else {
      setErrorMsg(res.error || "Failed to update profile.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0" }}>
        <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading User Profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "90vh", padding: "3rem 1rem" }}>
      <div className="container" style={{ maxWidth: "680px" }}>
        
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: "2.5rem", borderRadius: "1.5rem" }}>
          
          {/* Header Banner */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                background: profileData.role === "ADMIN" ? "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)" : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                width: "60px",
                height: "60px",
                borderRadius: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)"
              }}>
                <User size={32} />
              </div>

              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.2rem", letterSpacing: "-0.02em" }}>
                  {profileData.name || "User Profile"}
                </h1>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "9999px",
                  background: profileData.role === "ADMIN" ? "#e0e7ff" : "#dcfce7",
                  color: profileData.role === "ADMIN" ? "#3730a3" : "#15803d"
                }}>
                  {profileData.role === "ADMIN" ? "🛡️ Admin Account" : "🎓 Student Account"}
                </span>
              </div>
            </div>

            <Link href="/exams/history" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.55rem 1rem", borderRadius: "0.75rem" }}>
              View History & Results <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feedback Alerts */}
          {successMsg && (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "0.85rem 1rem",
              borderRadius: "0.85rem",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}>
              <CheckCircle2 size={18} color="#166534" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.85rem 1rem",
              borderRadius: "0.85rem",
              fontSize: "0.9rem",
              marginBottom: "1.5rem"
            }}>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Username / Name */}
            <div>
              <label className="input-label">Username / Full Name *</label>
              <div style={{ position: "relative" }}>
                <User size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your username or name"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="input-label">Mobile Number *</label>
              <div style={{ position: "relative" }}>
                <Phone size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="e.g. 01700000000"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="input-label">Address *</label>
              <div style={{ position: "relative" }}>
                <MapPin size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="e.g. House 12, Road 4, Dhaka"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Institution / Class */}
            <div>
              <label className="input-label">Institution / Class (Optional)</label>
              <div style={{ position: "relative" }}>
                <Building size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={profileData.institution}
                  onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                  placeholder="e.g. Dhaka College / Class 10"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", marginTop: "0.5rem" }}
            >
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="animate-spin">⏳</span> Saving Profile Changes...
                </span>
              ) : (
                <>
                  <Save size={18} /> Save Profile Information
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
