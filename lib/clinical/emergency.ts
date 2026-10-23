import { mapsDirectionsUrl } from "@/lib/utils/haversine";
import { telHref } from "@/lib/utils/helpers";

export const NATIONAL_EMERGENCY_NUMBER = "112";

export type EmergencyContacts = {
  facilityName: string | null;
  facilityPhone: string | null;
  facilityLat: number | null;
  facilityLng: number | null;
  origin: { lat: number; lng: number } | null;
  clinicianName: string | null;
};

export function contactsFromBooking(input: {
  facility?: {
    name: string;
    contactPhone: string;
    locationLat: number;
    locationLng: number;
  } | null;
  originLat?: number | null;
  originLng?: number | null;
  clinicianName?: string | null;
}): EmergencyContacts {
  const origin =
    input.originLat != null && input.originLng != null
      ? { lat: input.originLat, lng: input.originLng }
      : null;
  return {
    facilityName: input.facility?.name ?? null,
    facilityPhone: input.facility?.contactPhone ?? null,
    facilityLat: input.facility?.locationLat ?? null,
    facilityLng: input.facility?.locationLng ?? null,
    origin,
    clinicianName: input.clinicianName ?? null,
  };
}

export function emergencyLinks(contacts: EmergencyContacts) {
  const facilityTel = contacts.facilityPhone ? telHref(contacts.facilityPhone) : null;
  const directions =
    contacts.facilityLat != null && contacts.facilityLng != null
      ? mapsDirectionsUrl(
          { lat: contacts.facilityLat, lng: contacts.facilityLng },
          contacts.origin
        )
      : null;
  return {
    facilityTel,
    directions,
    nationalTel: telHref(NATIONAL_EMERGENCY_NUMBER),
  };
}
