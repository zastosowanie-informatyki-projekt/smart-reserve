import { authService } from "@/server/auth/services/auth.service";
import { photoRepository } from "../repositories/photo.repository";

export const photoService = {
  async upload(file: File, restaurantId: string) {
    const session = await authService.requireAuth();
    await authService.requireRestaurantAccess(session.user.id, restaurantId);

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return photoRepository.create({
      url: dataUrl,
      restaurantId,
    });
  },

  async delete(photoId: string) {
    const session = await authService.requireAuth();
    const photo = await photoRepository.findById(photoId);

    if (!photo) {
      throw new Error("Photo not found");
    }

    await authService.requireRestaurantAccess(
      session.user.id,
      photo.restaurantId,
    );

    return photoRepository.delete(photoId);
  },
};
