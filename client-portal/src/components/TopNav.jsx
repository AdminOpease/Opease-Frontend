import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Toolbar, Button } from '@mui/material'


export default function TopNav() {
const { pathname } = useLocation()
const link = (to, label) => (
<Button key={to} component={Link} to={to} variant={pathname === to ? 'contained' : 'text'} sx={{ mr: 1 }}>
{label}
</Button>
)
return (
<Toolbar>
{link('/dashboard', 'Dashboard')}
{link('/documents', 'Documents')}
{link('/notifications', 'Notifications')}
{link('/profile', 'Profile')}
</Toolbar>
)
}