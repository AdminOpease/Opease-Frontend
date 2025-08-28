import * as React from 'react'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'


export default function Login() {
return (
<Box className="flex items-center justify-center min-h-[60vh]">
<Paper className="p-6 w-full max-w-sm">
<Typography variant="h6" className="mb-4">Sign in</Typography>
<form onSubmit={(e) => e.preventDefault()} className="space-y-4">
<TextField label="Email" type="email" fullWidth required />
<TextField label="Password" type="password" fullWidth required />
<Button type="submit" variant="contained" fullWidth>Continue</Button>
</form>
</Paper>
</Box>
)
}