"use client"
import { api } from '@/api/axiosInstance';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getProfile } from '@/redux/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// fetching data component every reload
const AuthClientUpload = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await api.get(`/api/auth/profile`);
                dispatch(getProfile(res.data.user));
            } catch {
                router.push("/auth/login");
            }
        }
        
        getUser();

    }, [router]);
    return null;
}

export default AuthClientUpload