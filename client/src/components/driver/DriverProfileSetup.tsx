/**
 * DriverProfileSetup — post-payment profile completion for drivers.
 */
import { useEffect, useState } from "react";
import { Camera, Truck, MapPin, Check } from "lucide-react";
import { getDriverProfile, upsertDriverProfile } from "@/lib/db";
import {
  TRUCK_MAKES,
  TRUCK_MODELS_BY_MAKE,
  TRUCK_TYPES,
  TRUCK_YEARS,
  SERVICE_AREA_CITIES,
  DRIVER_TAGLINE_EXAMPLES,
} from "@/lib/truckData";
import { toast } from "sonner";

interface DriverProfileSetupProps {
  userId: string;
  onComplete: () => void;
}

export function DriverProfileSetup({ userId, onComplete }: DriverProfileSetupProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [truckMake, setTruckMake] = useState("");
  const [truckModel, setTruckModel] = useState("");
  const [truckYear, setTruckYear] = useState("");
  const [truckType, setTruckType] = useState("pickup");
  const [serviceArea, setServiceArea] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

  useEffect(() => {
    getDriverProfile(userId).then(({ data }) => {
      if (data) {
        setTruckMake(data.truck_make ?? "");
        setTruckModel(data.truck_model ?? "");
        setTruckYear(data.truck_year ? String(data.truck_year) : "");
        setTruckType(data.truck_type ?? "pickup");
        setServiceArea(data.service_area ?? "");
        setBio(data.bio ?? "");
        setProfilePhotoUrl(data.profile_photo_url ?? "");
      }
      setLoading(false);
    });
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceArea.trim()) {
      toast.error("Please select your service area.");
      return;
    }

    setSaving(true);
    const { error } = await upsertDriverProfile({
      user_id: userId,
      truck_make: truckMake || null,
      truck_model: truckModel || null,
      truck_year: truckYear ? parseInt(truckYear, 10) : null,
      truck_type: truckType || null,
      truck_capacity: null,
      license_plate: null,
      service_area: serviceArea,
      service_radius_miles: 25,
      bio: bio.trim() || null,
      profile_photo_url: profilePhotoUrl.trim() || null,
      is_verified: false,
      is_active: true,
      rating: 0,
      total_jobs: 0,
    });
    setSaving(false);

    if (error) {
      toast.error(error.message ?? "Could not save profile.");
      return;
    }

    toast.success("Profile saved! You're ready to browse jobs.");
    onComplete();
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-8">
      <div className="mb-6 text-center">
        <Truck className="mx-auto size-10 text-primary" />
        <h2 className="font-heading mt-4 text-2xl font-bold uppercase tracking-wide text-foreground">
          Complete Your Dude Profile
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Add a photo and finish your truck details so customers can find and book you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Profile photo URL
          </label>
          <div className="relative">
            <Camera className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={profilePhotoUrl}
              onChange={(e) => setProfilePhotoUrl(e.target.value)}
              placeholder="https://… (link to your photo)"
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Service area *
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              required
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select your metro…</option>
              {SERVICE_AREA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <select
            value={truckMake}
            onChange={(e) => {
              setTruckMake(e.target.value);
              setTruckModel("");
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">Make</option>
            {TRUCK_MAKES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={truckModel}
            onChange={(e) => setTruckModel(e.target.value)}
            disabled={!truckMake}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:opacity-50"
          >
            <option value="">Model</option>
            {(TRUCK_MODELS_BY_MAKE[truckMake] ?? []).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={truckYear}
            onChange={(e) => setTruckYear(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">Year</option>
            {TRUCK_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <select
          value={truckType}
          onChange={(e) => setTruckType(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          {TRUCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-1.5">
          <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bio / tagline
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder={DRIVER_TAGLINE_EXAMPLES[0]}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="font-heading mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80 disabled:opacity-60"
        >
          <Check className="size-4" />
          {saving ? "Saving…" : "Save & Go to Dashboard"}
        </button>
      </form>
    </div>
  );
}
