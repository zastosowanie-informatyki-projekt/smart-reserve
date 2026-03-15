import { userRepository } from "../repositories/user.repository";

export const userService = {
  async getRole(userId: string) {
    const user = await userRepository.findRoleById(userId);
    return user?.role ?? "USER";
  },

  async isOnboarded(userId: string) {
    const user = await userRepository.findOnboardedById(userId);
    return user?.onboarded ?? false;
  },
};
