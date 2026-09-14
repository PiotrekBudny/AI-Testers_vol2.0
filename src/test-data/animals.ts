import type { AnimalFormData } from "../models/Animal";

/**
 * Valid animal types available in the animal form dropdown
 */
export const VALID_ANIMAL_TYPES = ["sheep", "goat", "cow", "pig", "chicken"];

/**
 * Factory function to create a test animal with a valid type
 */
export function createTestAnimal(
  overrides?: Partial<AnimalFormData>,
): AnimalFormData {
  const randomType =
    VALID_ANIMAL_TYPES[Math.floor(Math.random() * VALID_ANIMAL_TYPES.length)];

  return {
    type: randomType,
    amount: (Date.now() % 9_000_000) + 1,
    ...overrides,
  };
}
