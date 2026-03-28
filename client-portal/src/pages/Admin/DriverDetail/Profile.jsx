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
const fieldSx = { '& .MuiInputBase-root': { height: 36 } };

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
    transporterId: '',
    onlineTrainingDate: '', safetyTrainingDate: '',
    licenceNumber: '', licenceExpiry: '', licenceCountry: '', dateTestPassed: '',
    idDocumentType: '', idExpiry: '', passportCountry: '',
    rightToWork: '', shareCode: '', niNumber: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '', emergencyEmail: '',
    bankName: '', sortCode: '', accountNumber: '', taxReference: '', vatNumber: '',
    addressLine1: '', addressLine2: '', town: '', county: '', postcode: '',
  });

  // Load full driver profile from API
  React.useEffect(() => {
    const decodedEmail = decodeURIComponent(email || '');
    const driver = drivers.find((d) => d.email === decodedEmail);
    if (!driver?.id) return;

    driversApi.getById(driver.id).then((res) => {
      const d = res.driver;
      if (!d) return;
      setForm({
        firstName: d.first_name || '',
        lastName: d.last_name || '',
        phone: d.phone || '',
        email: d.email || '',
        transporterId: d.amazon_id || '',
        onlineTrainingDate: toDateInput(d.online_training_date),
        safetyTrainingDate: toDateInput(d.safety_training_date),
        licenceNumber: d.licence_number || '',
        licenceExpiry: toDateInput(d.licence_expiry),
        licenceCountry: d.licence_country || '',
        dateTestPassed: toDateInput(d.date_test_passed),
        idDocumentType: d.id_document_type || '',
        idExpiry: toDateInput(d.id_expiry),
        passportCountry: d.passport_country || '',
        rightToWork: d.right_to_work || '',
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
    }).catch((err) => console.error('Failed to load driver profile:', err));
  }, [email, drivers]);

  const [touched, setTouched] = React.useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const phoneErr = !!form.phone && !reUKPhone.test(form.phone);
  const postErr = !!form.postcode && !reUKPostcode.test(form.postcode);
  const shareErr = form.rightToWork?.toLowerCase().includes('share') && !!form.shareCode && !reShareCode.test(form.shareCode);

  return (
    <Box sx={gridContainerSx}>
      {/* Row 1 */}
      <Section icon={<PersonIcon />} title="Personal Details">
        <Grid container spacing={1}>
          <F label="First Name" value={form.firstName} onChange={set('firstName')} />
          <F label="Last Name" value={form.lastName} onChange={set('lastName')} />
          <F label="Phone (+44XXXXXXXXXX)" value={form.phone} onChange={set('phone')} onBlur={blur('phone')}
            error={touched.phone && phoneErr} helperText={touched.phone && phoneErr ? '+44 then 10 digits' : undefined} />
          <F label="Email (ID)" value={form.email} disabled />
        </Grid>
      </Section>

      <Section icon={<LocalShippingIcon />} title="Account ID & Training">
        <Grid container spacing={1}>
          <F label="Account ID" value={form.transporterId} onChange={set('transporterId')} />
          <F label="Online Training Date" type="date" value={form.onlineTrainingDate} onChange={set('onlineTrainingDate')} />
          <F label="Safety Training Date" type="date" value={form.safetyTrainingDate} onChange={set('safetyTrainingDate')} />
        </Grid>
      </Section>

      <Section icon={<DirectionsCarIcon />} title="Driver's Licence">
        <Grid container spacing={1}>
          <F label="Licence Number" value={form.licenceNumber} onChange={set('licenceNumber')} />
          <F label="Licence Expiry" type="date" value={form.licenceExpiry} onChange={set('licenceExpiry')} />
          <F label="Country of Issue" value={form.licenceCountry} onChange={set('licenceCountry')} />
          <F label="Date Test Passed" type="date" value={form.dateTestPassed} onChange={set('dateTestPassed')} />
        </Grid>
      </Section>

      <Section icon={<BadgeIcon />} title="Identification">
        <Grid container spacing={1}>
          <F label="ID Document Type" value={form.idDocumentType} onChange={set('idDocumentType')} />
          <F label="ID Expiry" type="date" value={form.idExpiry} onChange={set('idExpiry')} />
          <F label="Passport Country" value={form.passportCountry} onChange={set('passportCountry')} />
        </Grid>
      </Section>

      {/* Row 3 */}
      <Section icon={<WorkIcon />} title="Right to Work">
        <Grid container spacing={1}>
          <F label="Right to Work" value={form.rightToWork} onChange={set('rightToWork')} md={12} />
          <F label="Share Code (9 chars)" value={form.shareCode} onChange={set('shareCode')} onBlur={blur('shareCode')}
            inputProps={{ maxLength: 9 }} error={touched.shareCode && shareErr}
            helperText={touched.shareCode && shareErr ? 'Must be exactly 9 characters' : undefined} />
          <F label="NI Number" value={form.niNumber} onChange={set('niNumber')} />
        </Grid>
      </Section>

      <Section icon={<ContactEmergencyIcon />} title="Emergency Contact">
        <Grid container spacing={1}>
          <F label="Name" value={form.emergencyName} onChange={set('emergencyName')} />
          <F label="Relationship" value={form.emergencyRelationship} onChange={set('emergencyRelationship')} />
          <F label="Phone" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
          <F label="Email" value={form.emergencyEmail} onChange={set('emergencyEmail')} />
        </Grid>
      </Section>

      {/* Row 4 */}
      <Section icon={<AccountBalanceIcon />} title="Payment & Tax">
        <Grid container spacing={1}>
          <F label="Bank / Building Society" value={form.bankName} onChange={set('bankName')} />
          <F label="Sort Code" value={form.sortCode} onChange={set('sortCode')} />
          <F label="Account Number" value={form.accountNumber} onChange={set('accountNumber')} />
          <F label="Tax Reference" value={form.taxReference} onChange={set('taxReference')} />
          <F label="VAT Number" value={form.vatNumber} onChange={set('vatNumber')} />
        </Grid>
      </Section>

      <Section icon={<HomeIcon />} title="Address">
        <Grid container spacing={1}>
          <F label="Address Line 1" value={form.addressLine1} onChange={set('addressLine1')} />
          <F label="Address Line 2" value={form.addressLine2} onChange={set('addressLine2')} />
          <F label="Town" value={form.town} onChange={set('town')} />
          <F label="County" value={form.county} onChange={set('county')} />
          <F label="Postcode" value={form.postcode} onChange={set('postcode')} onBlur={blur('postcode')}
            error={touched.postcode && postErr} helperText={touched.postcode && postErr ? 'e.g. SW1A 1AA' : undefined} />
        </Grid>
      </Section>
    </Box>
  );
}
