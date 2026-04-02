// src/pages/Admin/DriverDetail/Profile.jsx
import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, TextField, Paper, Divider,
} from '@mui/material';
import { drivers as driversApi } from '../../../services/api';
import { useAppStore } from '../../../state/AppStore';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WorkIcon from '@mui/icons-material/Work';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// --- Validators ---
const reUKPhone = /^\+44\d{10}$/;
const reUKPostcode = /^([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i;
const reShareCode = /^[A-Za-z0-9]{9}$/;

// --- Styles ---
const gridContainerSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: 1.5,
};

const sectionPaperSx = {
  p: 1.5,
  borderRadius: 2,
  bgcolor: '#fff',
};

const sectionHeaderSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  mb: 1,
};

const sectionTitleSx = { fontSize: 12, fontWeight: 700, color: 'text.primary' };
const sectionIconSx = { fontSize: 16, color: 'primary.main' };
const fieldSx = {
  '& .MuiInputBase-root': { height: 40, fontSize: 14, fontWeight: 600, color: '#111827' },
  '& .MuiInputBase-input': { color: '#111827', fontWeight: 600 },
  '& .MuiInputLabel-root': { fontSize: 13, fontWeight: 600, color: '#6B7280' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
};

function Section({ icon, title, children }) {
  return (
    <Paper elevation={0} sx={sectionPaperSx}>
      <Box sx={sectionHeaderSx}>
        {React.cloneElement(icon, { sx: sectionIconSx })}
        <Typography sx={sectionTitleSx}>{title}</Typography>
      </Box>
      <Divider sx={{ mb: 1.25 }} />
      {children}
    </Paper>
  );
}

function F({ label, value, onChange, onBlur, error, helperText, type, disabled, inputProps, md = 6 }) {
  return (
    <Grid item xs={12} md={md}>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
        type={type}
        disabled={disabled}
        inputProps={inputProps}
        InputLabelProps={type === 'date' ? { shrink: true } : undefined}
        sx={fieldSx}
      />
    </Grid>
  );
}

/** Convert a Unix-ms timestamp or ISO string to yyyy-mm-dd for date inputs */
function toDateInput(val) {
  if (!val) return '';
  const n = typeof val === 'string' ? Number(val) : val;
  if (typeof n === 'number' && !isNaN(n) && n > 1e9) {
    return new Date(n).toISOString().slice(0, 10);
  }
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}/)) return val.slice(0, 10);
  return String(val);
}

export default function DriverProfile() {
  const { email } = useParams();
  const { drivers } = useAppStore();

  const [form, setForm] = React.useState({
    firstName: '', lastName: '', phone: '', email: '',
    transporterId: '', accountId: '',
    onlineTrainingDate: '', safetyTrainingDate: '',
    licenceNumber: '', licenceExpiry: '', licenceCountry: '', dateTestPassed: '', lastDvlaCheck: '', dvlaCheckCode: '',
    idDocumentType: '', idExpiry: '', passportCountry: '',
    rightToWork: '', shareCode: '', niNumber: '', visaExpiry: '', rtwShareCodeNew: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '', emergencyEmail: '',
    bankName: '', sortCode: '', accountNumber: '', taxReference: '', vatNumber: '',
    addressLine1: '', addressLine2: '', town: '', county: '', postcode: '',
  });

  const [loaded, setLoaded] = React.useState(false);
  const driverIdRef = React.useRef(null);

  // Load full driver profile from API — only once per driver
  React.useEffect(() => {
    const decodedEmail = decodeURIComponent(email || '');
    const driver = drivers.find((d) => d.email === decodedEmail);
    if (loaded && driverIdRef.current === driver?.id) return; // skip re-polling updates
    if (!driver?.id) return;

    driversApi.getById(driver.id).then((res) => {
      const d = res.driver;
      if (!d) return;
      setForm({
        firstName: d.first_name || '',
        lastName: d.last_name || '',
        phone: d.phone || '',
        email: d.email || '',
        transporterId: d.transporter_id || '',
        accountId: d.amazon_id || '',
        onlineTrainingDate: toDateInput(d.online_training_date),
        safetyTrainingDate: toDateInput(d.safety_training_date),
        licenceNumber: d.licence_number || '',
        licenceExpiry: toDateInput(d.licence_expiry),
        licenceCountry: d.licence_country || '',
        dateTestPassed: toDateInput(d.date_test_passed),
        lastDvlaCheck: toDateInput(d.last_dvla_check),
        dvlaCheckCode: d.dvla_check_code || '',
        idDocumentType: d.id_document_type || '',
        idExpiry: toDateInput(d.id_expiry),
        passportCountry: d.passport_country || '',
        rightToWork: d.right_to_work || '',
        visaExpiry: toDateInput(d.visa_expiry),
        rtwShareCodeNew: d.rtw_share_code_new || '',
        shareCode: d.share_code || '',
        niNumber: d.ni_number || '',
        emergencyName: d.emergency_name || '',
        emergencyRelationship: d.emergency_relationship || '',
        emergencyPhone: d.emergency_phone || '',
        emergencyEmail: d.emergency_email || '',
        bankName: d.bank_name || '',
        sortCode: d.sort_code || '',
        accountNumber: d.account_number || '',
        taxReference: d.tax_reference || '',
        vatNumber: d.vat_number || '',
        addressLine1: d.address_line1 || '',
        addressLine2: d.address_line2 || '',
        town: d.town || '',
        county: d.county || '',
        postcode: d.postcode || '',
      });
      driverIdRef.current = driver.id;
      setLoaded(true);
    }).catch((err) => console.error('Failed to load driver profile:', err));
  }, [email, drivers, loaded]);

  // Map form keys to API field names for auto-save
  const FIELD_MAP = {
    firstName: 'first_name', lastName: 'last_name', phone: 'phone',
    transporterId: 'transporter_id', accountId: 'amazon_id',
    onlineTrainingDate: 'online_training_date', safetyTrainingDate: 'safety_training_date',
    licenceNumber: 'licence_number', licenceExpiry: 'licence_expiry',
    licenceCountry: 'licence_country', dateTestPassed: 'date_test_passed',
    lastDvlaCheck: 'last_dvla_check', visaExpiry: 'visa_expiry',
    idDocumentType: 'id_document_type', idExpiry: 'id_expiry',
    passportCountry: 'passport_country',
    rightToWork: 'right_to_work', shareCode: 'share_code', niNumber: 'ni_number',
    emergencyName: 'emergency_name', emergencyRelationship: 'emergency_relationship',
    emergencyPhone: 'emergency_phone', emergencyEmail: 'emergency_email',
    bankName: 'bank_name', sortCode: 'sort_code', accountNumber: 'account_number',
    taxReference: 'tax_reference', vatNumber: 'vat_number',
    addressLine1: 'address_line1', addressLine2: 'address_line2',
    town: 'town', county: 'county', postcode: 'postcode',
  };

  const [touched, setTouched] = React.useState({});
  const lastKeyRef = React.useRef(null);
  const set = (key) => (e) => {
    lastKeyRef.current = key;
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  // Auto-save on blur — saves the field that was just edited
  const autoSave = React.useCallback(async (key, value) => {
    if (!driverIdRef.current) return;
    const apiKey = FIELD_MAP[key];
    if (!apiKey) return;
    try {
      await driversApi.update(driverIdRef.current, { [apiKey]: value || null });
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
    }
  }, []);

  const blur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    autoSave(key, form[key]);
  };

  const phoneErr = !!form.phone && !reUKPhone.test(form.phone);
  const postErr = !!form.postcode && !reUKPostcode.test(form.postcode);
  const shareErr = form.rightToWork?.toLowerCase().includes('share') && !!form.shareCode && !reShareCode.test(form.shareCode);

  return (
    <Box sx={gridContainerSx}>
      {/* Row 1 */}
      <Section icon={<PersonIcon />} title="Personal Details">
        <Grid container spacing={1}>
          <F label="First Name" value={form.firstName} onChange={set('firstName')} onBlur={blur('firstName')} />
          <F label="Last Name" value={form.lastName} onChange={set('lastName')} onBlur={blur('lastName')} />
          <F label="Phone (+44XXXXXXXXXX)" value={form.phone} onChange={set('phone')} onBlur={blur('phone')}
            error={touched.phone && phoneErr} helperText={touched.phone && phoneErr ? '+44 then 10 digits' : undefined} />
          <F label="Email (ID)" value={form.email} disabled />
        </Grid>
      </Section>

      <Section icon={<LocalShippingIcon />} title="Account ID & Training">
        <Grid container spacing={1}>
          <F label="Account ID" value={form.accountId} onChange={set('accountId')} onBlur={blur('accountId')} />
          <F label="Transporter ID" value={form.transporterId} onChange={set('transporterId')} onBlur={blur('transporterId')} />
          <F label="Online Training Date" type="date" value={form.onlineTrainingDate} onChange={set('onlineTrainingDate')} onBlur={blur('onlineTrainingDate')} />
          <F label="Safety Training Date" type="date" value={form.safetyTrainingDate} onChange={set('safetyTrainingDate')} onBlur={blur('safetyTrainingDate')} />
        </Grid>
      </Section>

      <Section icon={<DirectionsCarIcon />} title="Driver's Licence">
        <Grid container spacing={1}>
          <F label="Licence Number" value={form.licenceNumber} onChange={set('licenceNumber')} onBlur={blur('licenceNumber')} />
          <F label="Licence Expiry" type="date" value={form.licenceExpiry} onChange={set('licenceExpiry')} onBlur={blur('licenceExpiry')} />
          <F label="Country of Issue" value={form.licenceCountry} onChange={set('licenceCountry')} onBlur={blur('licenceCountry')} />
          <F label="Date Test Passed" type="date" value={form.dateTestPassed} onChange={set('dateTestPassed')} onBlur={blur('dateTestPassed')} />
          <F label="Last DVLA Check" type="date" value={form.lastDvlaCheck} onChange={set('lastDvlaCheck')} onBlur={blur('lastDvlaCheck')} />
          <F label="DVLA Check Code (from candidate)" value={form.dvlaCheckCode} disabled />
        </Grid>
      </Section>

      <Section icon={<BadgeIcon />} title="Identification">
        <Grid container spacing={1}>
          <F label="ID Document Type" value={form.idDocumentType} onChange={set('idDocumentType')} onBlur={blur('idDocumentType')} />
          <F label="ID Expiry" type="date" value={form.idExpiry} onChange={set('idExpiry')} onBlur={blur('idExpiry')} />
          <F label="Passport Country" value={form.passportCountry} onChange={set('passportCountry')} onBlur={blur('passportCountry')} />
        </Grid>
      </Section>

      {/* Row 3 */}
      <Section icon={<WorkIcon />} title="Right to Work">
        <Grid container spacing={1}>
          <F label="Right to Work" value={form.rightToWork} onChange={set('rightToWork')} onBlur={blur('rightToWork')} md={12} />
          <F label="Share Code (9 chars)" value={form.shareCode} onChange={set('shareCode')} onBlur={blur('shareCode')}
            inputProps={{ maxLength: 9 }} error={touched.shareCode && shareErr}
            helperText={touched.shareCode && shareErr ? 'Must be exactly 9 characters' : undefined} />
          {!['British Passport', 'Birth Certificate', ''].includes(form.rightToWork) && (
            <F label="RTW Expiry Date" type="date" value={form.visaExpiry} onChange={set('visaExpiry')} onBlur={blur('visaExpiry')} />
          )}
          <F label="New Share Code (from candidate)" value={form.rtwShareCodeNew} disabled />
          <F label="NI Number" value={form.niNumber} onChange={set('niNumber')} onBlur={blur('niNumber')} />
        </Grid>
      </Section>

      <Section icon={<ContactEmergencyIcon />} title="Emergency Contact">
        <Grid container spacing={1}>
          <F label="Name" value={form.emergencyName} onChange={set('emergencyName')} onBlur={blur('emergencyName')} />
          <F label="Relationship" value={form.emergencyRelationship} onChange={set('emergencyRelationship')} onBlur={blur('emergencyRelationship')} />
          <F label="Phone" value={form.emergencyPhone} onChange={set('emergencyPhone')} onBlur={blur('emergencyPhone')} />
          <F label="Email" value={form.emergencyEmail} onChange={set('emergencyEmail')} onBlur={blur('emergencyEmail')} />
        </Grid>
      </Section>

      {/* Row 4 */}
      <Section icon={<AccountBalanceIcon />} title="Payment & Tax">
        <Grid container spacing={1}>
          <F label="Bank / Building Society" value={form.bankName} onChange={set('bankName')} onBlur={blur('bankName')} />
          <F label="Sort Code" value={form.sortCode} onChange={set('sortCode')} onBlur={blur('sortCode')} />
          <F label="Account Number" value={form.accountNumber} onChange={set('accountNumber')} onBlur={blur('accountNumber')} />
          <F label="Tax Reference" value={form.taxReference} onChange={set('taxReference')} onBlur={blur('taxReference')} />
          <F label="VAT Number" value={form.vatNumber} onChange={set('vatNumber')} onBlur={blur('vatNumber')} />
        </Grid>
      </Section>

      <Section icon={<HomeIcon />} title="Address">
        <Grid container spacing={1}>
          <F label="Address Line 1" value={form.addressLine1} onChange={set('addressLine1')} onBlur={blur('addressLine1')} />
          <F label="Address Line 2" value={form.addressLine2} onChange={set('addressLine2')} onBlur={blur('addressLine2')} />
          <F label="Town" value={form.town} onChange={set('town')} onBlur={blur('town')} />
          <F label="County" value={form.county} onChange={set('county')} onBlur={blur('county')} />
          <F label="Postcode" value={form.postcode} onChange={set('postcode')} onBlur={blur('postcode')}
            error={touched.postcode && postErr} helperText={touched.postcode && postErr ? 'e.g. SW1A 1AA' : undefined} />
        </Grid>
      </Section>
    </Box>
  );
}
