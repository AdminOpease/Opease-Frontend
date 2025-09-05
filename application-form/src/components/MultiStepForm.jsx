import { useState, useEffect } from "react";

function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Station / Location
    station: "",
    // Step 1 – Auth
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    code: "",

    // Step 4 – Driver's Licence
    licenceNumber: "",
    licenceExpiry: "",
    licenceCountry: "",            // NEW: Country of Issue (text)
    dateTestPassed: "",            // NEW: Date Test Passed (date)
    licenceFront: null,
    licenceBack: null,

    // Step 5 – Identification
    idDocumentType: "",            // NEW: Document Type (dropdown)
    idExpiry: "",
    passportCountry: "",
    idPassport: null,              // (generic ID upload – keep existing key)

    // Step 6 – Right to Work
    rightToWork: "",
    shareCode: "",
    rightToWorkFile: null,

    // Step 7 – NI
    niNumber: "",
    niDocument: null,

    // Step 8 – Address
    addressLine1: "",
    addressLine2: "",
    town: "",
    county: "",
    postcode: "",
    addressProof: null,
  });
  const [error, setError] = useState("");

  const totalSteps = 6;

  
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Load available stations from a public JSON file (to be managed by client-portal later)
    fetch("/stations.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setStations(data);
        else if (data && Array.isArray(data.stations)) setStations(data.stations);
      })
      .catch(() => {
        // Fallback local defaults
        setStations(["London - Park Royal", "London - Croydon", "Bristol", "Manchester"]);
      });

    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhoneChange = (e) => {
    // Expecting user to enter 10 digits after +44, starting with 7 (e.g., 7XXXXXXXXX)
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) {
      setError("Remove leading 0 from phone number (already using +44).");
    } else if (!/^7?\d{0,9}$/.test(value)) {
      // allow partial typing but only digits; final validation on submit
      setError("UK mobile should start with 7 and be 10 digits total.");
    } else {
      setError("");
    }
    setFormData({ ...formData, phone: value });
  };

  // ---------- Validation Helpers ----------
  const isFuture = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    return d > today;
  };

  const isPast = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    return d < today;
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

  const validateUKMobile = (digits) =>
    /^7\d{9}$/.test(digits); // after +44

  const validateNINumber = (ni) => {
    const compact = (ni || "").toUpperCase().replace(/\s/g, "");
    return /^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]$/.test(compact);
  };

  const validateFile = (file, { maxMB = 10, types = [] } = {}) => {
    if (!file) return false;
    const okSize = file.size <= maxMB * 1024 * 1024;
    const okType = types.length ? types.includes(file.type) : true;
    return okSize && okType;
  };

  const fileTypeHint = "Accepted: PDF or image (JPG/PNG). Max 10MB.";

  const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  // ---------- Auth Handlers ----------
  const handleSignUp = (e) => {
    e.preventDefault();
    // Require station selection
    if (!formData.station) {
      setError("Please select your preferred station/location.");
      return;
    }


    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return setError("Please enter your first and last name.");
    }
    if (!validateEmail(formData.email)) {
      return setError("Please enter a valid email address.");
    }
    if ((formData.password || "").length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (!validateUKMobile(formData.phone)) {
      return setError("Enter a valid UK mobile (format: 7XXXXXXXXX).");
    }

    setError("");
    setStep(2);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (formData.code === "123456") {
      alert("Email verified!");
      setStep(4); // jump to application
    } else {
      setError("Invalid code.");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email) || (formData.password || "").length < 6) {
      return setError("Invalid login details.");
    }
    setError("");
    setStep(4);
  };

  // ---------- Application Step Validations ----------
  const validateLicenceStep = () => {
    if (!formData.licenceNumber.trim()) {
      return "Please enter your licence number.";
    }
    if (!formData.licenceExpiry) {
      return "Please select your licence expiry date.";
    }
    if (!isFuture(formData.licenceExpiry)) {
      return "Your licence appears expired. Please check the expiry date.";
    }
    if (!formData.licenceCountry.trim()) {
      return "Please enter the country of issue.";
    }
    if (!formData.dateTestPassed) {
      return "Please select the date you passed your driving test.";
    }
    if (isFuture(formData.dateTestPassed)) {
      return "Date Test Passed cannot be in the future.";
    }
    if (!validateFile(formData.licenceFront, { types: ACCEPTED_FILE_TYPES })) {
      return `Please upload a valid front image/PDF of your licence. ${fileTypeHint}`;
    }
    if (!validateFile(formData.licenceBack, { types: ACCEPTED_FILE_TYPES })) {
      return `Please upload a valid back image/PDF of your licence. ${fileTypeHint}`;
    }
    return "";
  };

  const validateIdentificationStep = () => {
    if (!formData.idDocumentType) {
      return "Please select an ID document type.";
    }
    if (!validateFile(formData.idPassport, { types: ACCEPTED_FILE_TYPES })) {
      return `Please upload your selected ID (image/PDF). ${fileTypeHint}`;
    }
    if (!formData.idExpiry) {
      return "Please select your ID expiry date.";
    }
    return "";
  };

  const validateRTWStep = () => {
    if (!formData.rightToWork) {
      return "Please select a Right to Work document.";
    }
    if (formData.rightToWork === "Share Code") {
      const code = (formData.shareCode || "").trim().toUpperCase();
      if (!/^[A-Z0-9]{9}$/.test(code)) {
        return "Share Code should be 9 characters (letters/numbers).";
      }
    } else {
      if (!validateFile(formData.rightToWorkFile, { types: ACCEPTED_FILE_TYPES })) {
        return `Please upload your Right to Work document (image/PDF). ${fileTypeHint}`;
      }
    }
    return "";
  };

  const validateNIStep = () => {
    if (!validateNINumber(formData.niNumber)) {
      return "Enter a valid UK National Insurance number (e.g., QQ123456C).";
    }
    if (!validateFile(formData.niDocument, { types: ACCEPTED_FILE_TYPES })) {
      return `Please upload a document that shows your NI number (image/PDF). ${fileTypeHint}`;
    }
    return "";
  };

  const validateAddressStep = () => {
    if (!formData.addressLine1.trim() || !formData.town.trim() || !formData.county.trim()) {
      return "Please complete your full address.";
    }
    const postcodeRegex =
      /^([Gg][Ii][Rr] 0[Aa]{2}|((?:[A-Za-z][0-9]{1,2}|[A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2}|[A-Za-z][0-9][A-Za-z]|[A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]) ?[0-9][A-Za-z]{2}))$/;
    const pc = (formData.postcode || "").toUpperCase().trim();
    if (!postcodeRegex.test(pc)) {
      return "Please enter a valid UK postcode.";
    }
    if (!validateFile(formData.addressProof, { types: ACCEPTED_FILE_TYPES })) {
      return `Please upload a valid Proof of Address (image/PDF). ${fileTypeHint}`;
    }
    return "";
  };

  const handleApplicationSubmit = (e) => {
    e.preventDefault();

    const err = validateAddressStep();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    alert("Application submitted!");
    setStep(10); // final confirmation
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E6E6E6]">
        <img
          src="/logo.png"
          alt="OpEase Logo"
          className="w-[32rem] opacity-0 animate-fade-in-up"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center animate-fade-in"
      style={{ backgroundColor: "#E6E6E6" }}
    >
      {/* Step 0: Welcome */}
      {step === 0 && (
        <div
          className="flex flex-col items-center min-h-screen pt-0"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          <img
            src="/logo.png"
            alt="OpEase Logo"
            className="w-[32rem] drop-shadow-lg"
          />
          {/* New welcome line */}
          <p
            className="text-gray-600 text-lg mt-0 font-medium text-center"
            style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
          >
            Welcome to OPEASE! - We are excited to see you join!
          </p>
          <h2
            className="text-2xl font-bold text-gray-800 text-center mt-8"
            style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
          >
            Your new career is one button away! Press start application to begin.
          </h2>
          <div className="flex flex-col items-center space-y-4 mt-6">
            <button
              onClick={() => setStep(1)}
              className="w-60 bg-[#2E4C1E] hover:bg-[#253d17] text-white py-3 px-6 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
            >
              Start Application
            </button>
            <button
              onClick={() => setStep(3)}
              className="text-[#2E4C1E] hover:underline font-medium"
            >
              Log in to continue
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-4 text-center">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-800">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-gray-800">
              Terms & Conditions
            </a>
            .
          </p>

          {/* Footer Section */}
          <footer className="absolute bottom-4 text-sm text-gray-600 flex space-x-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 1: Sign Up */}
      {step === 1 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Create Your Account
            </h2>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleSignUp}
            className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md mx-auto mb-8 space-y-4"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}


            {/* Station / Location Selection */}

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Station / Location <span className="text-red-500">*</span>
              </label>
              <select
                name="station"
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E] bg-white"
                value={formData.station}
                onChange={handleChange}
                required
              >
                <option value="">Select a station...</option>
                {stations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Please select the station / location that best suits you.
              </p>
            </div>

              <input
  type="text"
  name="firstName"
  placeholder="First Name"
  className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
  value={formData.firstName}
  onChange={handleChange}
  required
/>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
              value={formData.lastName}
              onChange={handleChange}
              required
            />

            {/* Modern phone input */}
            <div className="flex rounded-lg overflow-hidden border focus-within:ring-2 focus-within:ring-[#2E4C1E]">
              <div className="bg-gray-100 px-4 flex items-center justify-center">
                🇬🇧 +44
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="7XXXXXXXXX"
                className="flex-1 p-1 outline-none"
                value={formData.phone}
                onChange={handlePhoneChange}
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-28 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Sign Up
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center mt-4">
              By signing up, you agree to our{" "}
              <a href="#" className="underline hover:text-gray-800">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-gray-800">
                Terms & Conditions
              </a>
              .
            </p>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 2: Verify Email */}
      {step === 2 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Verify Your Email
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              We have sent you a 6-digit verification code.
              Please check your inbox and enter the code below.
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleVerify}
            className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md mx-auto mb-8 space-y-4"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              type="text"
              name="code"
              placeholder="Enter verification code"
              className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
              value={formData.code}
              onChange={handleChange}
              required
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-28 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Verify
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
              <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
              <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 3: Log In */}
      {step === 3 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Log In
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Welcome back! Please enter your credentials to continue.
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleLogin}
            className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md mx-auto mb-8 space-y-4"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-28 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Log In
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 4: Driver's Licence */}
      {step === 4 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Driver's Licence
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Step 1 of {totalSteps}
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const err = validateLicenceStep();
              if (err) return setError(err);
              setError("");
              setStep(5);
            }}
            className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Licence Number */}
            <div>
              <label
                htmlFor="licenceNumber"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Driver's Licence Number
              </label>
              <input
                type="text"
                id="licenceNumber"
                name="licenceNumber"
                placeholder="Enter licence number"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.licenceNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label
                htmlFor="licenceExpiry"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Expiry Date
              </label>
              <input
                type="date"
                id="licenceExpiry"
                name="licenceExpiry"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.licenceExpiry}
                onChange={handleChange}
                required
              />
            </div>

            {/* NEW: Country of Issue */}
            <div>
              <label
                htmlFor="licenceCountry"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Country of Issue
              </label>
              <input
                type="text"
                id="licenceCountry"
                name="licenceCountry"
                placeholder="e.g., United Kingdom"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.licenceCountry}
                onChange={handleChange}
                required
              />
            </div>

            {/* NEW: Date Test Passed */}
            <div>
              <label
                htmlFor="dateTestPassed"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Date Test Passed
              </label>
              <input
                type="date"
                id="dateTestPassed"
                name="dateTestPassed"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.dateTestPassed}
                onChange={handleChange}
                required
              />
            </div>

            {/* Licence Front Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Licence Front (all corners visible)
              </label>
              <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
                <input
                  type="file"
                  name="licenceFront"
                  onChange={handleChange}
                  className="hidden"
                  id="licenceFront"
                  required
                  accept=".pdf,image/jpeg,image/png"
                />
                <label htmlFor="licenceFront" className="cursor-pointer">
                  <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
                </label>
                {formData.licenceFront && (
                  <p className="mt-2 text-sm text-gray-600">{formData.licenceFront.name}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{fileTypeHint}</p>
            </div>

            {/* Licence Back Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Licence Back (all corners visible)
              </label>
              <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
                <input
                  type="file"
                  name="licenceBack"
                  onChange={handleChange}
                  className="hidden"
                  id="licenceBack"
                  required
                  accept=".pdf,image/jpeg,image/png"
                />
                <label htmlFor="licenceBack" className="cursor-pointer">
                  <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
                </label>
                {formData.licenceBack && (
                  <p className="mt-2 text-sm text-gray-600">{formData.licenceBack.name}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{fileTypeHint}</p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-28 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Next
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 5: Identification */}
      {step === 5 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Identification
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Step 2 of {totalSteps}
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const err = validateIdentificationStep();
              if (err) return setError(err);
              setError("");
              setStep(6);
            }}
            className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* NEW: Document Type */}
            <div>
              <label
                htmlFor="idDocumentType"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Document Type
              </label>
              <select
                id="idDocumentType"
                name="idDocumentType"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.idDocumentType}
                onChange={handleChange}
                required
              >
                <option value="">Select document type</option>
                <option value="Passport">Passport</option>
                <option value="EU National ID Card">EU National ID Card</option>
                <option value="Biometric Residence Permit (BRP)">Biometric Residence Permit (BRP)</option>
                <option value="UK Birth Certificate (long form)">UK Birth Certificate (long form)</option>
                <option value="Home Office Travel Document">Home Office Travel Document</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* ID Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Selected ID
              </label>
              <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
                <input
                  type="file"
                  name="idPassport"
                  id="idPassport"
                  onChange={handleChange}
                  className="hidden"
                  required
                  accept=".pdf,image/jpeg,image/png"
                />
                <label htmlFor="idPassport" className="cursor-pointer">
                  <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
                </label>
                {formData.idPassport && (
                  <p className="mt-2 text-sm text-gray-600">{formData.idPassport.name}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{fileTypeHint}</p>
            </div>

            {/* Expiry Date */}
            <div>
              <label
                htmlFor="idExpiry"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Expiry Date
              </label>
              <input
                type="date"
                id="idExpiry"
                name="idExpiry"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.idExpiry}
                onChange={handleChange}
                required
              />
            </div>

            {/* Country (keep existing) */}
            <div>
              <label
                htmlFor="passportCountry"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Country
              </label>
              <input
                type="text"
                id="passportCountry"
                name="passportCountry"
                placeholder="Country"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.passportCountry}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-28 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Next
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 6: Right to Work */}
      {step === 6 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Right to Work
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Step 3 of {totalSteps}
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const err = validateRTWStep();
              if (err) return setError(err);
              setError("");
              setStep(7);
            }}
            className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Document Type */}
            <div>
              <label
                htmlFor="rightToWork"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Select Document
              </label>
              <select
                id="rightToWork"
                name="rightToWork"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.rightToWork}
                onChange={handleChange}
                required
              >
                <option value="">Select document</option>
                <option value="British Passport">British Passport</option>
                <option value="Birth Certificate">British Birth Certificate</option>
                <option value="Share Code">Right to Work Share Code</option>
              </select>
            </div>

            {/* Conditional File Upload or Share Code */}
            {formData.rightToWork === "British Passport" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Passport (all corners visible)
                </label>
                <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
                  <input
                    type="file"
                    name="rightToWorkFile"
                    id="passportFile"
                    onChange={handleChange}
                    className="hidden"
                    required
                    accept=".pdf,image/jpeg,image/png"
                  />
                  <label htmlFor="passportFile" className="cursor-pointer">
                    <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
                  </label>
                  {formData.rightToWorkFile && (
                    <p className="mt-2 text-sm text-gray-600">{formData.rightToWorkFile.name}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{fileTypeHint}</p>
              </div>
            )}

            {formData.rightToWork === "Birth Certificate" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Birth Certificate (all corners visible)
                </label>
                <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
                  <input
                    type="file"
                    name="rightToWorkFile"
                    id="birthCertFile"
                    onChange={handleChange}
                    className="hidden"
                    required
                    accept=".pdf,image/jpeg,image/png"
                  />
                  <label htmlFor="birthCertFile" className="cursor-pointer">
                    <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
                  </label>
                  {formData.rightToWorkFile && (
                    <p className="mt-2 text-sm text-gray-600">{formData.rightToWorkFile.name}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{fileTypeHint}</p>
              </div>
            )}

            {formData.rightToWork === "Share Code" && (
              <div>
                <label
                  htmlFor="shareCode"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Share Code
                </label>
                <input
                  type="text"
                  id="shareCode"
                  name="shareCode"
                  placeholder="Enter Share Code (9 characters)"
                  className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                  value={formData.shareCode}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-28 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Next
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 7: National Insurance */}
      {step === 7 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              National Insurance
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Step 4 of {totalSteps}
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const err = validateNIStep();
              if (err) return setError(err);
              setError("");
              setStep(8);
            }}
            className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* NI Number */}
            <div>
              <label
                htmlFor="niNumber"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                National Insurance Number
              </label>
              <input
                type="text"
                id="niNumber"
                name="niNumber"
                placeholder="e.g., QQ123456C"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.niNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* NI Document Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload a document showing your NI number
              </label>
              <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
                <input
                  type="file"
                  name="niDocument"
                  id="niDocument"
                  onChange={handleChange}
                  className="hidden"
                  required
                  accept=".pdf,image/jpeg,image/png"
                />
                <label htmlFor="niDocument" className="cursor-pointer">
                  <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
                </label>
                {formData.niDocument && (
                  <p className="mt-2 text-sm text-gray-600">{formData.niDocument.name}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{fileTypeHint}</p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-28 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Next
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 8: Address */}
      {step === 8 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Address
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Step 5 of {totalSteps}
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleApplicationSubmit}
            className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
          >
            {/* Error Display */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Address Fields */}
            <div>
              <label
                htmlFor="addressLine1"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                1st line of Address
              </label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                placeholder="First line of address"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.addressLine1 || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="addressLine2"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                2nd of Address <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                placeholder="Second line of address"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.addressLine2 || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="town"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Town
              </label>
              <input
                type="text"
                id="town"
                name="town"
                placeholder="Town"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.town || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="county"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                County
              </label>
              <input
                type="text"
                id="county"
                name="county"
                placeholder="County"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.county || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="postcode"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Postcode
              </label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                placeholder="Postcode"
                className="w-full border p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4C1E]"
                value={formData.postcode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    postcode: e.target.value.toUpperCase().replace(/\s+/g, ""),
                  })
                }
                required
              />
            </div>

            {/* Proof of Address Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload a Proof of Address{" "}
                <span className="font-normal">(not older than 3 months)</span>
              </label>
              <p className="text-gray-600 text-sm mb-2">Acceptable documents:</p>
              <ul className="list-disc list-inside text-gray-600 text-sm mb-2">
                <li>Utility Bill</li>
                <li>Council Tax</li>
                <li>Bank Statement</li>
                <li>NHS/HMRC Letter</li>
                <li>Payslip</li>
                <li>Tenancy Agreement</li>
              </ul>
              <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
                <input
                  type="file"
                  name="addressProof"
                  id="addressProof"
                  onChange={handleChange}
                  className="hidden"
                  required
                  accept=".pdf,image/jpeg,image/png"
                />
                <label htmlFor="addressProof" className="cursor-pointer">
                  <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
                </label>
                {formData.addressProof && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.addressProof.name}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{fileTypeHint}</p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(7)}
                className="w-28 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 shadow"
              >
                Back
              </button>
              <button className="w-44 bg-[#2E4C1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#253d17] shadow">
                Submit Application
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}

      {/* Step 10: Confirmation */}
      {step === 10 && (
        <div
          className="flex flex-col min-h-screen justify-between"
          style={{ backgroundColor: "#E6E6E6" }}
        >
          {/* Top Section - Logo */}
          <div className="flex flex-col items-center mt-0">
            <img
              src="/logo.png"
              alt="OpEase Logo"
              className="w-[20rem] drop-shadow-lg"
            />
            <h2
              className="text-3xl font-bold text-gray-800 text-center mt-0"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Thank You!
            </h2>
            <p
              className="text-gray-600 text-md mt-2 text-center px-4"
              style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}
            >
              Step 6 of {totalSteps}
            </p>
          </div>

          {/* Confirmation Message */}
          <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6 text-center">
            <p className="text-gray-700 text-lg font-medium">
              Your application has been submitted successfully.
            </p>
            <p className="text-gray-600">
              Please download our mobile app to track your progress:
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play"
                  className="h-12 hover:scale-105 transition-transform"
                />
              </a>
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1315440000"
                  alt="App Store"
                  className="h-12 hover:scale-105 transition-transform"
                />
              </a>
            </div>
          </div>

          {/* Footer Section */}
          <footer className="text-sm text-gray-600 flex justify-center space-x-4 mb-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <span>|</span>
            <span>© {new Date().getFullYear()} OPEASE Ltd.</span>
          </footer>
        </div>
      )}
    </div>
  );
}

export default MultiStepForm;
