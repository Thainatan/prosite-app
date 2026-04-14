'use client';
import { useEffect } from 'react';

export default function AdminRoot() {
  useEffect(() => { window.location.replace('/admin/dashboard'); }, []);
  return null;
}
