import { useState } from "react";

function MultiStepForm() {
  const [step, setStep] = useState(0);
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
    addressProof: null,
    licenceFront: null,
    licenceBack: null,
    idPassport: null,
    rightToWorkFile: null,
    niDocument: null,
  });
  const [error, setError] = useState("");

  const totalSteps = 6;

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
    alert("Application submitted!");
    setStep(10); // final confirmation
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6">
      {/* Step 0: Welcome */}
      {step === 0 && (
  <div className="flex flex-col items-center justify-center h-full space-y-10">
    <img src="/logo.png" alt="OpEase Logo" className="w-64 drop-shadow-lg" />
    <h2 className="text-2xl font-bold text-gray-800 text-center" style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif' }}>
      Start your application to become a driver
    </h2>
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={() => setStep(1)}
        className="w-60 bg-[#4B5320] hover:bg-[#3b421a] text-white py-3 px-6 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
      >
        Start Application
      </button>
      <button 
        onClick={() => setStep(3)}
        className="text-[#4B5320] hover:underline font-medium"
      >
        Log in to continue.
      </button>
    </div>
  </div>
)}




      {/* Step 1: Sign Up */}
      {step === 1 && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <h2 className="text-2xl font-bold">Sign Up</h2>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="w-full border p-2 rounded"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="w-full border p-2 rounded"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <div className="flex gap-2 items-center">
            <span className="p-2 border rounded bg-gray-100">🇬🇧 +44</span>
            <input
              type="tel"
              name="phone"
              placeholder="7XXXXXXXXX"
              className="w-full border p-2 rounded"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Sign Up
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Verify Email */}
      {step === 2 && (
        <form onSubmit={handleVerify} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
          <p className="text-gray-600">
            We have sent you a 6-digit verification code.
          </p>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="text"
            name="code"
            placeholder="Enter verification code"
            className="w-full border p-2 rounded"
            value={formData.code}
            onChange={handleChange}
            required
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Verify
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Log In */}
      {step === 3 && (
        <form onSubmit={handleLogin} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Log In</h2>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Log In
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Driver's Licence */}
      {step === 4 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(5); }} className="space-y-4">
          <p className="text-gray-500">Step 1 of {totalSteps}</p>
          <h2 className="text-2xl font-bold">Driver's Licence</h2>
          <input
            type="text"
            name="licenceNumber"
            placeholder="Driver's Licence Number"
            className="w-full border p-2 rounded"
            value={formData.licenceNumber}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="licenceExpiry"
            className="w-full border p-2 rounded"
            value={formData.licenceExpiry}
            onChange={handleChange}
            required
          />
          <p>Please upload a photo of your licence front (all corners visible)</p>
          <input type="file" name="licenceFront" onChange={handleChange} required />
          <p>Please upload a photo of your licence back (all corners visible)</p>
          <input type="file" name="licenceBack" onChange={handleChange} required />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Next
            </button>
          </div>
        </form>
      )}

      {/* Step 5: Identification */}
      {step === 5 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(6); }} className="space-y-4">
          <p className="text-gray-500">Step 2 of {totalSteps}</p>
          <h2 className="text-2xl font-bold">Identification</h2>
          <p>Please upload a photo of your ID/Passport</p>
          <input type="file" name="idPassport" onChange={handleChange} required />
          <input
            type="date"
            name="idExpiry"
            className="w-full border p-2 rounded"
            value={formData.idExpiry}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="passportCountry"
            placeholder="Passport Issuing Country"
            className="w-full border p-2 rounded"
            value={formData.passportCountry}
            onChange={handleChange}
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Next
            </button>
          </div>
        </form>
      )}

      {/* Step 6: Right to Work */}
      {step === 6 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(7); }} className="space-y-4">
          <p className="text-gray-500">Step 3 of {totalSteps}</p>
          <h2 className="text-2xl font-bold">Right to Work</h2>
          <select
            name="rightToWork"
            className="w-full border p-2 rounded"
            value={formData.rightToWork}
            onChange={handleChange}
            required
          >
            <option value="">Select document</option>
            <option value="British Passport">British Passport</option>
            <option value="Birth Certificate">British Birth Certificate</option>
            <option value="Share Code">Right to Work Share Code</option>
          </select>

          {formData.rightToWork === "British Passport" && (
            <>
              <p>Upload a clear photo of your passport (all corners visible)</p>
              <input type="file" name="rightToWorkFile" onChange={handleChange} required />
            </>
          )}

          {formData.rightToWork === "Birth Certificate" && (
            <>
              <p>Upload a clear photo of your birth certificate (all corners visible)</p>
              <input type="file" name="rightToWorkFile" onChange={handleChange} required />
            </>
          )}

          {formData.rightToWork === "Share Code" && (
            <input
              type="text"
              name="shareCode"
              placeholder="Enter Share Code"
              className="w-full border p-2 rounded"
              value={formData.shareCode}
              onChange={handleChange}
              required
            />
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Next
            </button>
          </div>
        </form>
      )}

      {/* Step 7: National Insurance */}
      {step === 7 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(8); }} className="space-y-4">
          <p className="text-gray-500">Step 4 of {totalSteps}</p>
          <h2 className="text-2xl font-bold">National Insurance</h2>
          <input
            type="text"
            name="niNumber"
            placeholder="National Insurance Number"
            className="w-full border p-2 rounded"
            value={formData.niNumber}
            onChange={handleChange}
            required
          />
          <p>Upload a document showing your NI number</p>
          <input type="file" name="niDocument" onChange={handleChange} required />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(6)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Next
            </button>
          </div>
        </form>
      )}

      {/* Step 8: Address */}
      {step === 8 && (
        <form onSubmit={handleApplicationSubmit} className="space-y-4">
          <p className="text-gray-500">Step 5 of {totalSteps}</p>
          <h2 className="text-2xl font-bold">Address</h2>
          <p>Upload proof of address (Utility Bill, Council Tax, Bank Statement, NHS/HMRC Letter, Payslip, Tenancy Agreement) - not older than 3 months</p>
          <input type="file" name="addressProof" onChange={handleChange} required />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(7)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Application
            </button>
          </div>
        </form>
      )}

      {/* Step 10: Confirmation */}
      {step === 10 && (
        <div className="text-center space-y-4">
          <p className="text-gray-500">Step 6 of {totalSteps}</p>
          <h2 className="text-2xl font-bold">Thank You!</h2>
          <p>Your application has been submitted successfully.</p>
          <p>Please download our mobile app to track your progress:</p>
          <div className="flex justify-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              className="h-12"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29_badge.svg"
              alt="App Store"
              className="h-12"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiStepForm;
