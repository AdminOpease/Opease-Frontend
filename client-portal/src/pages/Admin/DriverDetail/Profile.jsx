// src/pages/Admin/DriverDetail/Profile.jsx
import * as React from 'react';
import { Box, Typography, Grid, TextField, Paper } from '@mui/material';

// --- Simple validators (frontend-only) ---
const reUKPhone = /^\+44\d{10}$/; // +44 then 10 digits (no leading 0)
const reUKPostcode =
  /^([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i; // pragmatic UK postcode
const reShareCode = /^[A-Za-z0-9]{9}$/; // exactly 9 chars

export default function DriverProfile() {
  // Controlled form state (stub data for now)
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',

    licenceNumber: '',
    licenceExpiry: '',
    licenceCountry: '',
    dateTestPassed: '',

    idDocumentType: '',
    idExpiry: '',
    passportCountry: '',

    rightToWork: '',
    shareCode: '',
    niNumber: '',

    addressLine1: '',
    addressLine2: '',
    town: '',
    county: '',
    postcode: '',
  });

  const [touched, setTouched] = React.useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const onBlur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  // Derived validation
  const phoneError = !!form.phone && !reUKPhone.test(form.phone);
  const postcodeError = !!form.postcode && !reUKPostcode.test(form.postcode);
  const shareCodeError =
    form.rightToWork?.toLowerCase().includes('share') && !!form.shareCode && !reShareCode.test(form.shareCode);

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
        Profile
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Personal Details
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="First Name" value={form.firstName} onChange={set('firstName')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Last Name" value={form.lastName} onChange={set('lastName')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Phone (+44XXXXXXXXXX)"
              value={form.phone}
              onChange={set('phone')}
              onBlur={onBlur('phone')}
              error={touched.phone && phoneError}
              helperText={touched.phone && phoneError ? 'Format: +44 then 10 digits (no leading 0)' : ' '}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Email (ID)" value={form.email} disabled />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Driver’s Licence
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Licence Number" value={form.licenceNumber} onChange={set('licenceNumber')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Licence Expiry"
              InputLabelProps={{ shrink: true }}
              value={form.licenceExpiry}
              onChange={set('licenceExpiry')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Country of Issue" value={form.licenceCountry} onChange={set('licenceCountry')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date Test Passed"
              InputLabelProps={{ shrink: true }}
              value={form.dateTestPassed}
              onChange={set('dateTestPassed')}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Identification
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="ID Document Type" value={form.idDocumentType} onChange={set('idDocumentType')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="ID Expiry"
              InputLabelProps={{ shrink: true }}
              value={form.idExpiry}
              onChange={set('idExpiry')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Passport Country" value={form.passportCountry} onChange={set('passportCountry')} />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Right to Work
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Right to Work (British Passport / Birth Certificate / Share Code)"
              value={form.rightToWork}
              onChange={set('rightToWork')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Share Code (9 chars)"
              value={form.shareCode}
              onChange={set('shareCode')}
              onBlur={onBlur('shareCode')}
              inputProps={{ maxLength: 9 }}
              error={touched.shareCode && shareCodeError}
              helperText={
                touched.shareCode && shareCodeError
                  ? 'If using Share Code, it must be exactly 9 characters'
                  : ' '
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="NI Number" value={form.niNumber} onChange={set('niNumber')} />
          </Grid>
        </Grid>
      </Paper>

      
      <Paper sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Emergency Contact
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Name" value={form.emergencyName} onChange={set('emergencyName')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Relationship" value={form.emergencyRelationship} onChange={set('emergencyRelationship')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Phone" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" type="email" label="Email" value={form.emergencyEmail} onChange={set('emergencyEmail')} />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Payment & Tax Details
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Bank / Building Society" value={form.bankName} onChange={set('bankName')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Sort Code" value={form.sortCode} onChange={set('sortCode')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Account Number" value={form.accountNumber} onChange={set('accountNumber')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Unique Tax Reference" value={form.taxReference} onChange={set('taxReference')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="VAT Number (If applicable)" value={form.vatNumber} onChange={set('vatNumber')} />
          </Grid>
        </Grid>
      </Paper>
<Paper>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Address
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Address Line 1" value={form.addressLine1} onChange={set('addressLine1')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Address Line 2 (optional)" value={form.addressLine2} onChange={set('addressLine2')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Town" value={form.town} onChange={set('town')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="County" value={form.county} onChange={set('county')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Postcode"
              value={form.postcode}
              onChange={set('postcode')}
              onBlur={onBlur('postcode')}
              error={touched.postcode && postcodeError}
              helperText={
                touched.postcode && postcodeError ? 'Enter a valid UK postcode (e.g., SW1A 1AA)' : ' '
              }
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
