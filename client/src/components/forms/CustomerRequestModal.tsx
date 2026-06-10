/**
 * CustomerRequestModal — Customer move request submission form.
 *
 * On submit:
 *  1. Calls createMoveRequest() to insert a row into public.move_requests
 *  2. If the user is logged in, attaches their customer_id
 *  3. Shows a success toast and closes the modal
 *
 * Fields stored:
 *  customer_name, customer_phone, customer_email,
 *  pickup_city, pickup_zip, dropoff_city, dropoff_zip,
 *  item_description, preferred_date, urgency, special_notes
 *  status defaults to "new"
 */

import { useState } from "react";
import { X, Truck, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createMoveRequest } from "@/lib/db";
import { toast } from "sonner";
import type { RequestUrgency } from "@/lib/database.types";

interface CustomerRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function CustomerRequestModal({ open, onClose }: CustomerRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupZip, setPickupZip] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [dropoffZip, setDropoffZip] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [urgency, setUrgency] = useState<RequestUrgency>("flexible");
  const [specialNotes, setSpecialNotes] = useState("");

  const { user, profile } = useAuth();

  if (!open) return null;

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setPickupCity("");
    setPickupZip("");
    setDropoffCity("");
    setDropoffZip("");
    setItemDescription("");
    setPreferredDate("");
    setUrgency("flexible");
    setSpecialNotes("");
    setSubmitted(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Pre-fill from logged-in user
  const effectiveName = name || profile?.full_name || "";
  const effectiveEmail = email || profile?.email || "";
  const effectivePhone = phone || profile?.phone || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await createMoveRequest({
      customer_id: user?.id ?? null,
      customer_name: effectiveName || name,
      customer_phone: effectivePhone || phone,
      customer_email: effectiveEmail || email,
      pickup_address: null,
      pickup_city: pickupCity,
      pickup_zip: pickupZip,
      dropoff_address: null,
      dropoff_city: dropoffCity,
      dropoff_zip: dropoffZip,
      item_description: itemDescription,
      preferred_date: preferredDate || null,
      urgency,
      estimated_weight: null,
      special_notes: specialNotes || null,
    });

    setLoading(false);

    if (error) {
      console.error("[CustomerRequest] Error:", error.message);
      toast.error("Failed to submit request. Please try again.");
      return;
    }

    setSubmitted(true);
    toast.success("Request submitted! We'll match you with a dude shortly.");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="size-4" />
            </span>
            <div>
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
                Request a Dude
              </p>
              <p className="text-xs text-muted-foreground">Free quote — no commitment</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6">
          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/15">
                <Truck className="size-8 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
                  Request Received!
                </h3>
                <p className="mt-2 text-pretty text-muted-foreground">
                  We&apos;re matching you with a dude in your area. You&apos;ll hear back within the
                  hour.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="font-heading inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80"
              >
                Done
                <ArrowRight className="size-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Contact info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name || profile?.full_name || ""}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone || profile?.phone || ""}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email || profile?.email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Locations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pickup City *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="Houston"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pickup ZIP *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupZip}
                    onChange={(e) => setPickupZip(e.target.value)}
                    placeholder="77001"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Dropoff City *
                  </label>
                  <input
                    type="text"
                    required
                    value={dropoffCity}
                    onChange={(e) => setDropoffCity(e.target.value)}
                    placeholder="Dallas"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Dropoff ZIP *
                  </label>
                  <input
                    type="text"
                    required
                    value={dropoffZip}
                    onChange={(e) => setDropoffZip(e.target.value)}
                    placeholder="75201"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Item description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What Needs to Move? *
                </label>
                <textarea
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g. King-size bed frame, dresser, 3 boxes of books…"
                  rows={3}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Date + Urgency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this_week">This Week</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Special notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Special Notes (optional)
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Stairs, fragile items, parking restrictions…"
                  rows={2}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-heading mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50 active:scale-[0.97]"
              >
                {loading ? "Submitting…" : "Find Me a Dude"}
                <ArrowRight className="size-4" />
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Free quote. No commitment. We&apos;ll match you within the hour.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
