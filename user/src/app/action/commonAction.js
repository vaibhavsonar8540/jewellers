import { LoggedInService, signUpService } from "../service/commonService";

export const LoginUser = async (payload) => {
  try {
    const res = await LoggedInService(payload);
    console.log(res, "Action Login");
    return res;
  } catch (error) {
    console.log("LoginUser action error:", error);
  }
};

export const signUpUser = async (payload) => {
  try {
    const res = await signUpService(payload);
    console.log(res, "Action signup");
    return res;
  } catch (error) {
    console.log("signUpUser action error:", error);
  }
};