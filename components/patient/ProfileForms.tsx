"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { toInputDate } from "@/lib/utils/formatters";

type Patient = {
  id: string;
  phone: string;
  address: string;
  lmp: string | Date | null;
  parity: number;
  heightCm: number | null;
  weightKg: number | null;
  locationLat: number | null;
  locationLng: number | null;
  preExistingConditions: string[];
  notifyAlerts: boolean;
  user: { name: string; email: string };
};

function FormMessage({ ok, msg }: { ok: boolean; msg: string }) {
  if (!msg) return null;
  return (
    <p className={`text-sm ${ok ? "text-success-ink" : "text-danger-ink"}`} role={ok ? "status" : "alert"}>
      {msg}
    </p>
  );
}

export function ProfileForms({ patient }: { patient: Patient }) {
  const router = useRouter();
  const [profileMsg, setProfileMsg] = useState("");
  const [profileOk, setProfileOk] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordOk, setPasswordOk] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [lat, setLat] = useState(patient.locationLat?.toString() ?? "");
  const [lng, setLng] = useState(patient.locationLng?.toString() ?? "");
  const [geoBusy, setGeoBusy] = useState(false);

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.locationLat = lat;
    payload.locationLng = lng;
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setProfileOk(res.ok);
      setProfileMsg(
        res.ok
          ? "Profile saved."
          : typeof data.error === "string"
            ? data.error
            : "Could not save profile."
      );
      if (res.ok) router.refresh();
    } catch {
      setProfileOk(false);
      setProfileMsg("Could not save profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg("");
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const data = await res.json().catch(() => ({}));
      setPasswordOk(res.ok);
      setPasswordMsg(
        res.ok ? "Password updated." : typeof data.error === "string" ? data.error : "Could not update password."
      );
      if (res.ok) formEl.reset();
    } catch {
      setPasswordOk(false);
      setPasswordMsg("Could not update password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setProfileOk(false);
      setProfileMsg("Location is not available in this browser.");
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
        setGeoBusy(false);
        setProfileOk(true);
        setProfileMsg("Location captured. Save profile to keep it.");
      },
      () => {
        setGeoBusy(false);
        setProfileOk(false);
        setProfileMsg("Could not read your location. Enter coordinates manually.");
      }
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-heading text-xl text-navy">Personal information</h2>
        <FormMessage ok={profileOk} msg={profileMsg} />
        <Input name="name" label="Full name" defaultValue={patient.user.name} required />
        <Input label="Email" value={patient.user.email} readOnly />
        <Input name="phone" label="Phone" defaultValue={patient.phone} required />
        <Input name="address" label="Address" defaultValue={patient.address} required />
        <Input name="lmp" type="date" label="Last menstrual period" defaultValue={toInputDate(patient.lmp)} />
        <Input name="parity" type="number" min={0} label="Parity" defaultValue={patient.parity} />
        <Input name="heightCm" type="number" step="0.1" label="Height (cm)" defaultValue={patient.heightCm ?? ""} />
        <Input name="weightKg" type="number" step="0.1" label="Weight (kg)" defaultValue={patient.weightKg ?? ""} />
        <Textarea
          name="preExistingConditions"
          label="Pre-existing conditions"
          defaultValue={(Array.isArray(patient.preExistingConditions) ? patient.preExistingConditions : []).join(", ")}
          placeholder="Hypertension, sickle cell, diabetes"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            name="locationLat"
            type="number"
            step="0.00001"
            label="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            hint="Used to rank nearby facilities"
          />
          <Input
            name="locationLng"
            type="number"
            step="0.00001"
            label="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />
        </div>
        <Button type="button" variant="outline" size="sm" loading={geoBusy} onClick={useMyLocation}>
          Use my location
        </Button>
        <input type="hidden" name="notifyAlerts" value="false" />
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            name="notifyAlerts"
            value="true"
            defaultChecked={patient.notifyAlerts}
            className="h-4 w-4 rounded border-line"
          />
          Notify me about clinical alerts and referral updates
        </label>
        <Button type="submit" loading={profileLoading}>
          Save profile
        </Button>
      </form>
      <form onSubmit={changePassword} className="space-y-4 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-heading text-xl text-navy">Change password</h2>
        <FormMessage ok={passwordOk} msg={passwordMsg} />
        <Input name="currentPassword" type="password" label="Current password" required />
        <Input name="newPassword" type="password" label="New password" required minLength={8} />
        <Input name="confirmPassword" type="password" label="Confirm new password" required />
        <Button type="submit" variant="secondary" loading={passwordLoading}>
          Update password
        </Button>
      </form>
    </div>
  );
}
