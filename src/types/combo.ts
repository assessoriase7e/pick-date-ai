import { Combo, ComboService, ClientCombo, ClientComboSession, Client } from "@prisma/client";
import { ServiceFullData } from "./service";

export type ComboWithServices = Combo & {
  comboServices: (ComboService & {
    service: ServiceFullData;
  })[];
};

export type ClientComboWithDetails = ClientCombo & {
  combo: ComboWithServices;
  sessions: (ClientComboSession & {
    service: ServiceFullData;
  })[];
  client: Client;
};

export type ComboServiceWithService = ComboService & {
  service: ServiceFullData;
};

export interface ComboCalculation {
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}