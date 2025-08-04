import { useState, useEffect } from "react";

function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true); // NEW STATE
  const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  code: "",
  licenceNumber: "",
  licenceExpiry: "",
  idExpiry: "",
  passportCountry: "",
  rightToWork: "",
  shareCode: "",
  niNumber: "",
  addressLine1: "",
  addressLine2: "",
  town: "",
  county: "",
  postcode: "",
  addressProof: null,
  licenceFront: null,
  licenceBack: null,
  idPassport: null,
  rightToWorkFile: null,
  niDocument: null,
});
  const [error, setError] = useState("");

  const totalSteps = 6;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000); // 2s loading
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
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) {
      setError("Remove leading 0 from phone number");
    } else {
      setError("");
      setFormData({ ...formData, phone: value });
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!formData.email.includes("@")) return setError("Invalid email");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (!formData.phone || formData.phone.length < 10)
      return setError("Invalid phone number");
    setError("");
    setStep(2);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (formData.code === "123456") {
      alert("Email verified!");
      setStep(4); // jump to application
    } else {
      setError("Invalid code");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.email.includes("@") || formData.password.length < 6)
      return setError("Invalid login");
    setError("");
    setStep(4);
  };

  const handleApplicationSubmit = (e) => {
  e.preventDefault();

  const postcodeRegex =
    /^([Gg][Ii][Rr] 0[Aa]{2}|((?:[A-Za-z][0-9]{1,2}|[A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2}|[A-Za-z][0-9][A-Za-z]|[A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]) ?[0-9][A-Za-z]{2}))$/;

  if (!postcodeRegex.test(formData.postcode.trim())) {
    setError("Please enter a valid UK postcode.");
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

      {/* Modern phone input (one-piece look) */}
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
        setStep(5);
      }}
      className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
    >
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
          />
          <label htmlFor="licenceFront" className="cursor-pointer">
            <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
          </label>
          {formData.licenceFront && (
            <p className="mt-2 text-sm text-gray-600">{formData.licenceFront.name}</p>
          )}
        </div>
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
          />
          <label htmlFor="licenceBack" className="cursor-pointer">
            <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
          </label>
          {formData.licenceBack && (
            <p className="mt-2 text-sm text-gray-600">{formData.licenceBack.name}</p>
          )}
        </div>
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
        setStep(6);
      }}
      className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
    >
      {/* Passport/ID Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload ID/Passport
        </label>
        <div className="border-2 border-dashed rounded-lg p-1 text-center text-gray-500 cursor-pointer hover:border-[#2E4C1E] hover:bg-gray-50 transition">
          <input
            type="file"
            name="idPassport"
            id="idPassport"
            onChange={handleChange}
            className="hidden"
            required
          />
          <label htmlFor="idPassport" className="cursor-pointer">
            <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
          </label>
          {formData.idPassport && (
            <p className="mt-2 text-sm text-gray-600">{formData.idPassport.name}</p>
          )}
        </div>
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

      {/* Passport Country */}
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
        setStep(7);
      }}
      className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
    >
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
            />
            <label htmlFor="passportFile" className="cursor-pointer">
              <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
            </label>
            {formData.rightToWorkFile && (
              <p className="mt-2 text-sm text-gray-600">{formData.rightToWorkFile.name}</p>
            )}
          </div>
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
            />
            <label htmlFor="birthCertFile" className="cursor-pointer">
              <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
            </label>
            {formData.rightToWorkFile && (
              <p className="mt-2 text-sm text-gray-600">{formData.rightToWorkFile.name}</p>
            )}
          </div>
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
            placeholder="Enter Share Code"
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
        setStep(8);
      }}
      className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto mb-8 space-y-6"
    >
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
          placeholder="National Insurance Number"
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
          />
          <label htmlFor="niDocument" className="cursor-pointer">
            <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
          </label>
          {formData.niDocument && (
            <p className="mt-2 text-sm text-gray-600">{formData.niDocument.name}</p>
          )}
        </div>
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
              postcode: e.target.value.toUpperCase().replace(/\s+/g, "")
            })
          }
          required
        />
      </div>

      {/* Proof of Address Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload a Proof of Address <span className="font-normal">(not older than 3 months)</span>
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
          />
          <label htmlFor="addressProof" className="cursor-pointer">
            <span className="font-medium text-[#2E4C1E]">Click to upload</span> or drag & drop file
          </label>
          {formData.addressProof && (
            <p className="mt-2 text-sm text-gray-600">{formData.addressProof.name}</p>
          )}
        </div>
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
