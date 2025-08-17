"use client"
import { api } from '@/api/axiosInstance';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getProfile } from '@/redux/authSlice';
import { getWorkouts } from '@/redux/workoutsSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// fetching data component every reload
const AuthClientUpload = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    useEffect(() => {
        const getUser = async () => {
            try {
                const res1 = await api.get(`/api/auth/profile`);
                const res2 = await api.get(`/api/fitness-plan/workouts`);
                dispatch(getProfile(res1.data.user));
                dispatch(getWorkouts(res2.data));
            } catch {
                router.push("/auth/login");
            }
        }
        
        getUser();

    }, [router]);
    return null;
}

export default AuthClientUpload