import { collectionService } from "@/service/common.service";

export const createCollection = async (payload) => {
    try {
        const res = await collectionService(payload);
        console.log(res, "action");
        return res;
    } catch (error) {
        console.error("Action createCollection Error:", error);
        throw error;
    }
};