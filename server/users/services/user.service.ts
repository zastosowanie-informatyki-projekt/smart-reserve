import { userRepository } from "../repositories/user.repository";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    return {
      role: user?.role ?? "USER",
      onboarded: user?.onboarded ?? false,
    };
  },

  async getRole(userId: string) {
    const user = await userRepository.findById(userId);
    return user?.role ?? "USER";
  },

  async isOnboarded(userId: string) {
    const user = await userRepository.findById(userId);
    return user?.onboarded ?? false;
  },
};
