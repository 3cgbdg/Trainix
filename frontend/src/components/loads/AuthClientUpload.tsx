"use client"
import { api } from '@/api/axiosInstance';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getProfile } from '@/redux/authSlice';
import { getMeasurement } from '@/redux/measurementSlice';
import { getNutritionDay } from '@/redux/nutritionDaySlice';
import { getWorkouts } from '@/redux/workoutsSlice';
import axios from 'axios';
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
                dispatch(getProfile(res1.data.user));
            } catch {
                router.push("/auth/login");
            }
            // ping python server to wake up

            await axios.get(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/ping`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            });
            const res4 = await api.get("api/measurement/measurements");
            dispatch(getMeasurement(res4.data));
            const res2 = await api.get(`/api/fitness-plan/workouts`);
            dispatch(getWorkouts(res2.data));
            const res3 = await api.get("api/nutrition-plan/nutrition-plans");
            dispatch(getNutritionDay(res3.data));


        }

        getUser();

    }, []);
    return null;
}

export default AuthClientUpload