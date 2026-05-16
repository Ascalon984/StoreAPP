import { create } from 'zustand';

// Sementara — ganti dengan data dari store/session setelah integrasi auth
export const mockUser = {
    name: 'Ahmad Fauzi',
    avatar: null as string | null,
};

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
};

interface UserState {
    user: typeof mockUser;
}

export const useUserStore = create<UserState>(() => ({
    user: mockUser,
}));