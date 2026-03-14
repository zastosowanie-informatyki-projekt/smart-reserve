import { authService } from "@/server/auth/services/auth.service";
import { employeeRepository } from "@/server/employees/repositories/employee.repository";
import { notificationService } from "@/server/notifications/services/notification.service";
import { invitationRepository } from "../repositories/invitation.repository";
import type { SendInvitationInput } from "../types";

export const invitationService = {
  async send(data: SendInvitationInput) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, data.restaurantId);

    const alreadyEmployee = await employeeRepository.existsByUserAndRestaurant(
      data.userId,
      data.restaurantId,
    );
    if (alreadyEmployee) {
      throw new Error("This person is already an employee at this restaurant");
    }

    const existingInvitation =
      await invitationRepository.findPendingByUserAndRestaurant(
        data.userId,
        data.restaurantId,
      );
    if (existingInvitation) {
      throw new Error("This person already has a pending invitation");
    }

    const invitation = await invitationRepository.create({
      restaurantId: data.restaurantId,
      userId: data.userId,
    });

    await notificationService.create(
      data.userId,
      "Restaurant Invitation",
      `You have been invited to work at ${invitation.restaurant.name}.`,
      "employee_invitation",
      `/invitations`,
    );

    return invitation;
  },

  async accept(id: string) {
    const session = await authService.requireAuth();

    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    if (invitation.userId !== session.user.id) {
      throw new Error("This invitation was not sent to you");
    }
    if (invitation.acceptedAt) {
      throw new Error("This invitation has already been accepted");
    }
    if (invitation.declinedAt) {
      throw new Error("This invitation has already been declined");
    }

    const alreadyEmployee = await employeeRepository.existsByUserAndRestaurant(
      session.user.id,
      invitation.restaurantId,
    );
    if (alreadyEmployee) {
      throw new Error("You are already an employee at this restaurant");
    }

    await employeeRepository.create(
      session.user.id,
      invitation.restaurantId,
    );

    await invitationRepository.accept(id);

    await notificationService.create(
      invitation.restaurant.ownerId,
      "Invitation Accepted",
      `${session.user.name} accepted your invitation to work at ${invitation.restaurant.name}.`,
      "invitation_accepted",
      `/dashboard/${invitation.restaurantId}`,
    );

    return { restaurantId: invitation.restaurantId, restaurantName: invitation.restaurant.name };
  },

  async decline(id: string) {
    const session = await authService.requireAuth();

    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    if (invitation.userId !== session.user.id) {
      throw new Error("This invitation was not sent to you");
    }
    if (invitation.acceptedAt) {
      throw new Error("This invitation has already been accepted");
    }
    if (invitation.declinedAt) {
      throw new Error("This invitation has already been declined");
    }

    await invitationRepository.decline(id);

    await notificationService.create(
      invitation.restaurant.ownerId,
      "Invitation Declined",
      `${session.user.name} declined your invitation to work at ${invitation.restaurant.name}.`,
      "invitation_declined",
      `/dashboard/${invitation.restaurantId}`,
    );
  },

  async getForRestaurant(restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);
    return invitationRepository.findByRestaurantId(restaurantId);
  },

  async getMyInvitations() {
    const session = await authService.requireAuth();
    return invitationRepository.findPendingByUser(session.user.id);
  },

  async revoke(id: string, restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);

    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    if (invitation.acceptedAt || invitation.declinedAt) {
      throw new Error("Cannot revoke an invitation that has already been responded to");
    }

    return invitationRepository.revoke(id);
  },

  async searchUsersToInvite(query: string, restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantOwner(session.user.id, restaurantId);

    if (!query || query.length < 2) {
      return [];
    }

    return invitationRepository.searchUsersToInvite(query, restaurantId);
  },
};
