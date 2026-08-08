import {
    signUpService,
    signInService,
    signOutService,
    getCurrentSessionService,
} from "@/service/auth.service";

export const registerUserAction = async (payload) => {
    try {
        const res = await signUpService(payload);
        return res;
    } catch (error) {
        console.error("Action registerUserAction Error:", error);
        throw error;
    }
};

export const loginUserAction = async (payload) => {
    try {
        const res = await signInService(payload);
        return res;
    } catch (error) {
        console.error("Action loginUserAction Error:", error);
        throw error;
    }
};

export const logoutUserAction = async () => {
    try {
        const res = await signOutService();
        return res;
    } catch (error) {
        console.error("Action logoutUserAction Error:", error);
        throw error;
    }
};

export const checkAuthSessionAction = async () => {
    try {
        const res = await getCurrentSessionService();
        return res;
    } catch (error) {
        console.error("Action checkAuthSessionAction Error:", error);
        return { user: null, session: null };
    }
};
