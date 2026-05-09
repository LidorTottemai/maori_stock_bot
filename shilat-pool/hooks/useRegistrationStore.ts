"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FamilyMemberInput = {
  firstName: string;
  lastName: string;
  relation: string;
};

export type RegistrationState = {
  // Step 1 – personal
  firstName: string;
  lastName: string;
  israeliId: string;
  email: string;
  phone: string;
  city: string;
  familyMembers: FamilyMemberInput[];

  // Step 2 – plan
  membershipTypeId: string;
  membershipTypeSlug: string;
  membershipTypeName: string;
  priceCharged: number;

  // Early access
  isEarlyAccess: boolean;
  earlyAccessWindowId: string;

  // Step 3 – payment (mock)
  mockTransactionId: string;

  // Step 4 – confirmation
  confirmationNumber: string;
  registrationId: string;

  // Actions
  setPersonal: (data: Partial<RegistrationState>) => void;
  setPlan: (data: Partial<RegistrationState>) => void;
  setEarlyAccess: (windowId: string) => void;
  setPayment: (transactionId: string) => void;
  setConfirmation: (id: string, confirmationNumber: string) => void;
  reset: () => void;
};

const defaults = {
  firstName: "",
  lastName: "",
  israeliId: "",
  email: "",
  phone: "",
  city: "",
  familyMembers: [],
  membershipTypeId: "",
  membershipTypeSlug: "",
  membershipTypeName: "",
  priceCharged: 0,
  isEarlyAccess: false,
  earlyAccessWindowId: "",
  mockTransactionId: "",
  confirmationNumber: "",
  registrationId: "",
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      ...defaults,
      setPersonal: (data) => set(data),
      setPlan: (data) => set(data),
      setEarlyAccess: (windowId) => set({ isEarlyAccess: true, earlyAccessWindowId: windowId }),
      setPayment: (transactionId) => set({ mockTransactionId: transactionId }),
      setConfirmation: (id, confirmationNumber) => set({ registrationId: id, confirmationNumber }),
      reset: () => set(defaults),
    }),
    {
      name: "shilat-registration",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as any)
      ),
    }
  )
);
