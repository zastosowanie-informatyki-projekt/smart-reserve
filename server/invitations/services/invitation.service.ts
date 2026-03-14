import { authService } from "@/server/auth/services/auth.service";
import { employeeRepository } from "@/server/employees/repositories/employee.repository";
import { restaurantRepository } from "@/server/restaurants/repositories/restaurant.repository";
import { notificationService } from "@/server/notifications/services/notification.service";
import { invitationRepository } from "../repositories/invitation.repository";
import type { SendInvitationInput } from "../types";

const INVITATION_EXPIRES_DAYS = 7;

export const invitationService = {
  async send(data: SendInvitationInput) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, data.restaurantId);

    const existing = await invitationRepository.findPendingByEmailAndRestaurant(
      data.email,
      data.restaurantId,
    );
    if (existing) {
      throw new Error("An active invitation for this email already exists");
    }

    const alreadyEmployee = await employeeRepository.existsByEmailAndRestaurant(
      data.email,
      data.restaurantId,
    );
    if (alreadyEmployee) {
      throw new Error("This person is already an employee at this restaurant");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRES_DAYS);

    return invitationRepository.create({
      restaurantId: data.restaurantId,
      email: data.email,
      expiresAt,
    });
  },

  async accept(token: string) {
    const session = await authService.requireAuth();

    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    if (invitation.acceptedAt) {
      throw new Error("This invitation has already been accepted");
    }
    if (invitation.expiresAt < new Date()) {
      throw new Error("This invitation has expired");
    }
    if (invitation.email !== session.user.email) {
      throw new Error("This invitation was sent to a different email address");
    }

    const alreadyEmployee = await employeeRepository.existsByUserAndRestaurant(
      session.user.id,
      invitation.restaurantId,
    );
    if (alreadyEmployee) {
      throw new Error("You are already an employee at this restaurant");
    }

    await employeeRepository.createWithRoleUpdate(
      session.user.id,
      invitation.restaurantId,
    );

    await invitationRepository.accept(invitation.id);

    const restaurant = await restaurantRepository.findById(invitation.restaurantId);
    if (restaurant) {
      await notificationService.create(
        restaurant.ownerId,
        "Invitation Accepted",
        `${session.user.name} accepted your invitation to work at ${invitation.restaurant.name}.`,
        "invitation_accepted",
        `/dashboard/${invitation.restaurantId}`,
      );
    }

    return {
      restaurantId: invitation.restaurantId,
      restaurantName: invitation.restaurant.name,
    };
  },

  async getForRestaurant(restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);
    return invitationRepository.findByRestaurantId(restaurantId);
  },

  async revoke(id: string, restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);
    return invitationRepository.revoke(id);
  },
};
