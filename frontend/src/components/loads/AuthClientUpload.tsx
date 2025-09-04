"use client"
import { api } from '@/api/axiosInstance';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getProfile } from '@/redux/authSlice';
import { getMeasurement } from '@/redux/measurementSlice';
import { getNutritionDay } from '@/redux/nutritionDaySlice';
import { getWorkouts } from '@/redux/workoutsSlice';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// fetching data component every reload
const AuthClientUpload = () => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();
    useEffect(() => {
        const getUser = async () => {
            if (pathname === "/") {
                router.push("/dashboard");
            }
            try {
                const res1 = await api.get(`/api/auth/profile`);

                dispatch(getProfile(res1.data.user));


            } catch {
                router.push("/auth/login");
            }
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