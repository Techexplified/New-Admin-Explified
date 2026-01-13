import React, { useState } from "react";
import { X, Upload, RefreshCw, User, Bell, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// SettingsModal — enhanced with Framer Motion micro-interactions
// Presentational-only: mount this component to show the modal.
export default function SettingsModal() {
  const [tab, setTab] = useState("profile");

  // Profile
  const [logoFile, setLogoFile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  // Notifications
  const [productUpdates, setProductUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Account
  const [twoFA, setTwoFA] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setLogoFile(Object.assign(f, { preview: URL.createObjectURL(f) }));
  };

  const resetToDefaults = () => {
    setLogoFile(null);
    setFullName("");
    setEmail("");
    setTimezone("UTC");
    setProductUpdates(true);
    setSecurityAlerts(true);
    setMarketingEmails(false);
    setTwoFA(false);
  };

  const handleSave = () => {
    const payload = { profile: { fullName, email, timezone, logoFile }, notifications: { productUpdates, securityAlerts, marketingEmails }, account: { twoFA } };
    console.log("Save settings ->", payload);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: ShieldAlert },
  ];

  // Motion variants
  const cardHover = { hover: { y: -6, boxShadow: "0 14px 40px rgba(15,23,42,0.12)", transition: { duration: 0.18 } }, tap: { scale: 0.995 } };
  const tabContent = { hidden: { opacity: 0, y: 8 }, enter: { opacity: 1, y: 0, transition: { duration: 0.18 } }, exit: { opacity: 0, y: -8, transition: { duration: 0.12 } } };

  // Floating label input component using framer for label micro-motion
  const FloatingInput = ({ label, value, onChange, type = "text", className = "" }) => {
    const [focused, setFocused] = useState(false);
    const isActive = focused || (value && value.length > 0);
    return (
      <div className={`relative ${className}`}>
        <motion.label
          animate={isActive ? { y: -18, scale: 0.9, x: 2 } : { y: 0, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`absolute left-3 top-3 text-xs origin-left text-slate-500 pointer-events-none`}
        >
          {label}
        </motion.label>

        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-3 pt-5 pb-3 border border-gray-100 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          whileFocus={{ boxShadow: "0 8px 30px rgba(99,102,241,0.08)" }}
        />
      </div>
    );
  };

  const Card = ({ children, className = "" }) => (
    <motion.div whileHover="hover" whileTap="tap" variants={cardHover} className={`bg-white rounded-lg border border-gray-100 p-4 ${className}`}>
      {children}
    </motion.div>
  );

  return (
    <>
      {/* Backdrop with subtle blur */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.56 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" aria-hidden />

      {/* Centered modal with entrance animation */}
      <motion.div initial={{ y: 10, opacity: 0, scale: 0.99 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_18px_60px_rgba(15,23,42,0.12)] overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
              <p className="text-xs text-slate-500 mt-1">Customize your account and preferences</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={resetToDefaults} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 text-sm text-slate-600 hover:bg-gray-100 transition">
                <RefreshCw className="w-4 h-4 text-slate-600" />
                Reset
              </motion.button>

              {/* visual X (no close behavior) */}
              <div className="p-2 rounded-full bg-gray-50">
                <X className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Tabs top bar — pill style */}
          <div className="px-6 pt-4 pb-2">
            <nav className="flex gap-3">
              {tabs.map(({ id, label, icon: Icon }) => (
                <motion.button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${tab === id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-600 bg-white hover:bg-gray-50"}`} whileTap={{ scale: 0.97 }}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[72vh] overflow-auto space-y-6">
            <AnimatePresence mode="wait">
              {/* PROFILE */}
              {tab === "profile" && (
                <motion.div key="profile" variants={tabContent} initial="hidden" animate="enter" exit="exit">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="md:col-span-2 space-y-3">
                          <FloatingInput label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                          <FloatingInput label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

                          <div className="mt-2">
                            <label className="block text-xs text-slate-500 mb-2">Timezone</label>
                            <motion.select whileTap={{ scale: 0.995 }} value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-48 px-3 py-2 border border-gray-100 rounded-lg shadow-sm">
                              <option>UTC</option>
                              <option>GMT</option>
                              <option>Asia/Kolkata</option>
                              <option>America/New_York</option>
                            </motion.select>
                          </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-3">
                          <div className="w-24 h-24 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                            {logoFile ? <img src={logoFile.preview} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-slate-400 text-xs">No avatar</div>}
                          </div>

                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 text-sm">
                            <Upload className="w-4 h-4 text-slate-600" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                            Upload
                          </label>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label className="block text-xs text-slate-500 mb-2">About</label>
                        <motion.textarea whileFocus={{ boxShadow: "0 8px 30px rgba(99,102,241,0.08)" }} placeholder="A short bio" className="w-full min-h-[90px] p-3 border border-gray-100 rounded-lg shadow-sm" />
                      </div>
                    </Card>

                    <Card>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Profile visibility</h4>
                      <p className="text-xs text-slate-500 mb-4">Control if your profile is visible to teammates or public.</p>
                      <div className="flex gap-3">
                        <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-indigo-600 text-white">Only me</motion.button>
                        <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">Team</motion.button>
                        <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">Public</motion.button>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* NOTIFICATIONS */}
              {tab === "notifications" && (
                <motion.div key="notifications" variants={tabContent} initial="hidden" animate="enter" exit="exit">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Notifications</h4>
                      <p className="text-xs text-slate-500">Choose how you'd like to be notified.</p>

                      <div className="mt-4 space-y-3">
                        {[{ id: "productUpdates", title: "Product updates", desc: "News, improvements and beta features", value: productUpdates, set: (v) => setProductUpdates(v) }, { id: "securityAlerts", title: "Security alerts", desc: "Important account activity", value: securityAlerts, set: (v) => setSecurityAlerts(v) }, { id: "marketingEmails", title: "Marketing emails", desc: "Offers and partner news", value: marketingEmails, set: (v) => setMarketingEmails(v) }].map((opt) => (
                          <div key={opt.id} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-slate-800">{opt.title}</div>
                              <div className="text-xs text-slate-500">{opt.desc}</div>
                            </div>

                            <motion.label className={`relative inline-flex items-center w-12 h-7 rounded-full transition-colors ${opt.value ? "bg-indigo-600" : "bg-gray-200"}`} whileTap={{ scale: 0.96 }}>
                              <input type="checkbox" className="sr-only" checked={opt.value} onChange={(e) => opt.set(e.target.checked)} />
                              <motion.span className={`transform transition-transform bg-white w-5 h-5 rounded-full absolute left-1 ${opt.value ? "translate-x-5" : "translate-x-0"}`} layout transition={{ type: "spring", stiffness: 500, damping: 28 }} />
                            </motion.label>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Delivery settings</h4>
                      <p className="text-xs text-slate-500 mb-4">Select where we should send alerts</p>
                      <div className="flex flex-wrap gap-2">
                        <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">Email</motion.button>
                        <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">SMS</motion.button>
                        <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">In-app</motion.button>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* ACCOUNT */}
              {tab === "account" && (
                <motion.div key="account" variants={tabContent} initial="hidden" animate="enter" exit="exit">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">Security</h4>
                          <p className="text-xs text-slate-500">Manage account protection</p>
                        </div>
                        <div className="text-sm text-slate-600">Settings</div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">Two-factor authentication</div>
                            <div className="text-xs text-slate-500">Use an authenticator app for stronger security</div>
                          </div>
                          <motion.label className={`relative inline-flex items-center w-12 h-7 rounded-full transition-colors ${twoFA ? "bg-indigo-600" : "bg-gray-200"}`} whileTap={{ scale: 0.96 }}>
                            <input type="checkbox" className="sr-only" checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
                            <motion.span className={`transform transition-transform bg-white w-5 h-5 rounded-full absolute left-1 ${twoFA ? "translate-x-5" : "translate-x-0"}`} layout transition={{ type: "spring", stiffness: 500, damping: 28 }} />
                          </motion.label>
                        </div>

                        <div className="flex gap-3">
                          <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">Change password</motion.button>
                          <motion.button whileTap={{ scale: 0.98 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">Manage sessions</motion.button>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Danger zone</h4>
                          <div className="grid gap-3">
                            <motion.button whileTap={{ scale: 0.98 }} className="w-full px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-100">Delete account</motion.button>
                            <motion.button whileTap={{ scale: 0.98 }} className="w-full px-3 py-2 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-100">Export data</motion.button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-slate-500">Changes are saved locally. Click Save to persist.</div>
              <div className="flex items-center gap-3">
                <motion.button onClick={resetToDefaults} whileTap={{ scale: 0.97 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">Reset</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} className="px-3 py-2 rounded-md bg-white border border-gray-100">Cancel</motion.button>
                <motion.button onClick={handleSave} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg">Save preferences</motion.button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}
