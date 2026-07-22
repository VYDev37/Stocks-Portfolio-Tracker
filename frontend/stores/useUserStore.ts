import { create } from "zustand";
import Cookies from "js-cookie";
import { UserProfileSchema, type UserProfile } from "@/schemas/auth.schema";
import { axios } from "@/lib";

interface UserStore {
    user: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    init: () => Promise<void>;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: (silent?: boolean) => Promise<void>;
}

export const useUser = create<UserStore>((set, get) => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,

    init: async () => {
        set({ isLoading: true });
        try {
            await get().refreshProfile();
        } catch (err) {
            set({ isAuthenticated: false, user: null });
            console.error("Error when trying to initiate user:", err);
        } finally {
            set({ isLoading: false });
        }
    },
    login: async (token: string) => {
        set({ isLoading: true });
        try {
            Cookies.set("token", token, { path: "/" });
            await get().refreshProfile();
        } catch (err) {
            console.error(err);
            set({ isAuthenticated: false, user: null });
        } finally {
            set({ isLoading: false });
        }
    },
    logout: async () => {
        set({ isLoading: true });
        try {
            await axios.post("/account/logout");
        } catch (err) {
            //console.log("Error when trying to log out:", err)
        } finally {
            Cookies.remove("token", { path: "/" });
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    refreshProfile: async (silent = false) => {
        if (!silent) set({ isLoading: true });
        try {
            const { data } = await axios.get("/user/me");
            const parsed = UserProfileSchema.parse(data.data);
            set({ user: parsed, isAuthenticated: true });
        } catch (err) {
            console.error("Error when trying to load user data:", err);
            Cookies.remove("token", { path: "/" });
            set({ user: null, isAuthenticated: false });
        } finally {
            if (!silent) set({ isLoading: false });
        }
    }
}));