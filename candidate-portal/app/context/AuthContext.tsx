// app/context/AuthContext.tsx — Auth state for candidate-portal
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { auth as authApi, setToken, getToken } from '../lib/api';

type Driver = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  depot: string | null;
  amazon_id: string | null;
  transporter_id: string | null;
  cognito_sub: string | null;
  licence_number: string | null;
  licence_expiry: string | null;
  licence_country: string | null;
  date_test_passed: string | null;
  id_document_type: string | null;
  id_expiry: string | null;
  passport_country: string | null;
  right_to_work: string | null;
  share_code: string | null;
  ni_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  town: string | null;
  county: string | null;
  postcode: string | null;
  emergency_name: string | null;
  emergency_relationship: string | null;
  emergency_phone: string | null;
  emergency_email: string | null;
  bank_name: string | null;
  sort_code: string | null;
  account_number: string | null;
  tax_reference: string | null;
  vat_number: string | null;
  last_dvla_check: string | null;
  visa_expiry: string | null;
  dvla_check_code: string | null;
  dvla_code_submitted_at: string | null;
  rtw_share_code_new: string | null;
  rtw_code_submitted_at: string | null;
};

type Application = {
  id: string;
  driver_id: string;
  date_applied: string;
  pre_dcc: string;
  fir_missing_docs: string | null;
  bgc: string;
  training_date: string | null;
  contract_signing: string;
  dcc_date: string | null;
  activated_at: string | null;
  removed_at: string | null;
  flex_confirmed: boolean;
  dl_verification: string | null;
  dl_confirmed: boolean;
  driving_test_slots: string | null;
  driving_test_result: string | null;
  training_slots: string | null;
  training_message: string | null;
  training_booked: string | null;
};

type AuthState = {
  isLoggedIn: boolean;
  driver: Driver | null;
  application: Application | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  // Auto-restore session from persisted token
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me().then((me) => {
        setDriver(me.driver);
        setApplication(me.application);
      }).catch(() => {
        setToken(null); // token expired or invalid
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setToken(res.accessToken);
    if (res.driver) {
      setDriver(res.driver);
    }
    // Fetch full profile + application via /me
    try {
      const me = await authApi.me();
      setDriver(me.driver);
      setApplication(me.application);
    } catch {
      // /me might fail if driver not found, keep what we have from login
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setDriver(null);
    setApplication(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const me = await authApi.me();
      setDriver(me.driver);
      setApplication(me.application);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!driver, driver, application, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
