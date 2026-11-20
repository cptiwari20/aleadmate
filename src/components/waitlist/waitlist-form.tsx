"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { completeWaitlist, startWaitlist } from "@/app/(marketing)/actions";
import { MateAvatar } from "@/components/brand/mate";
import { useWebsite } from "@/components/waitlist/website-context";
import { Button } from "@/components/ui/primitives";
import {
  BUDGET_PER_LEAD,
  LEADS_PER_MONTH,
  LEAD_TYPES,
  type FieldErrors,
} from "@/lib/waitlist/schema";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none";

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-tier-unverified">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs font-medium">
        <span className="text-fg">Step {step} of 2</span>
        <span className="text-faint">
          {step === 1 ? "Your details" : "What leads you need"}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
    </div>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg bg-tier-unverified-soft px-3 py-2 text-sm text-tier-unverified"
    >
      {message}
    </p>
  );
}

export function WaitlistForm() {
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [token, setToken] = useState("");
  /**
   * Carried into step 2 so the lead can still reach Slack before a database
   * exists. When one is configured the server uses the stored row and ignores
   * these entirely.
   */
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const { site } = useWebsite();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  const [leadTypes, setLeadTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [volume, setVolume] = useState("");

  const headingRef = useRef<HTMLDivElement>(null);

  function toggleLeadType(value: string) {
    setLeadTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function advance(next: 2 | "done") {
    setStep(next);
    setErrors({});
    setMessage(undefined);
    // Keep the form in view when its height changes between steps.
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSubmitStepOne(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await startWaitlist(formData);
      if (result.ok) {
        setToken(result.token);
        setContact({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
        });
        advance(2);
      } else {
        setErrors(result.errors);
        setMessage(result.message);
      }
    });
  }

  function onSubmitStepTwo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await completeWaitlist(token, formData);
      if (result.ok) {
        advance("done");
      } else {
        setErrors(result.errors);
        setMessage(result.message);
      }
    });
  }

  if (step === "done") {
    return (
      <div ref={headingRef} className="ring-gradient rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl backdrop-blur sm:p-8">
        <MateAvatar size={56} />
        <h3 className="mt-4 text-xl font-semibold text-fg">You&rsquo;re on the list.</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Mate has your brief. We&rsquo;ll email you when your spot opens &mdash; early
          access goes out in batches so every account gets set up properly, and Mate will
          have your first list ready before you log in.
        </p>
        <p className="mt-4 text-xs text-faint">
          No credit card, no charge until you&rsquo;ve seen leads you actually want.
        </p>
      </div>
    );
  }

  return (
    <div ref={headingRef} className="ring-gradient rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl backdrop-blur sm:p-8">
      <Progress step={step} />

      {step === 1 ? (
        // Keyed so React remounts between steps instead of reusing the step-1
        // input nodes — without it, the phone value reappears in "location".
        <form key="step-1" onSubmit={onSubmitStepOne} noValidate className="space-y-4">
          <Field label="Your name" htmlFor="name" error={errors.name}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Alex Rivera"
              className={inputClass}
            />
          </Field>

          <Field label="Work email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="alex@yourcompany.com"
              className={inputClass}
            />
          </Field>

          <Field
            label="Phone"
            htmlFor="phone"
            error={errors.phone}
            hint="So we can walk you through setup when your spot opens."
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+1 512 555 0134"
              className={inputClass}
            />
          </Field>

          {/* Honeypot: off-screen rather than display:none, which bots skip. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 overflow-hidden">
            <label htmlFor="companyWebsite">Company website</label>
            <input
              id="companyWebsite"
              name="companyWebsite"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <FormError message={message} />

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Saving…" : "Continue"}
          </Button>

          <p className="text-center text-xs text-faint">
            Takes about 40 seconds. We never sell your details.
          </p>
        </form>
      ) : (
        <form key="step-2" onSubmit={onSubmitStepTwo} noValidate className="space-y-5">
          <input type="hidden" name="website" value={site?.url ?? ""} />
          <input type="hidden" name="contactName" value={contact.name} />
          <input type="hidden" name="contactEmail" value={contact.email} />
          <input type="hidden" name="contactPhone" value={contact.phone} />
          <Field label="What kind of leads do you want?" error={errors.leadTypes}>
            <div className="flex flex-wrap gap-2">
              {LEAD_TYPES.map((type) => {
                const active = leadTypes.includes(type.value);
                return (
                  <label
                    key={type.value}
                    className={cn(
                      "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-accent bg-accent-soft font-medium text-accent-text"
                        : "border-border bg-bg text-muted hover:border-border-strong hover:text-fg",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="leadTypes"
                      value={type.value}
                      checked={active}
                      onChange={() => toggleLeadType(type.value)}
                      className="sr-only"
                    />
                    {type.label}
                  </label>
                );
              })}
            </div>
          </Field>

          {leadTypes.includes("other") ? (
            <Field
              label="Tell us what kind"
              htmlFor="leadTypeOther"
              error={errors.leadTypeOther}
            >
              <input
                id="leadTypeOther"
                name="leadTypeOther"
                placeholder="Independent pharmacies, veterinary clinics…"
                className={inputClass}
              />
            </Field>
          ) : null}

          <Field
            label="Where should we look?"
            htmlFor="location"
            error={errors.location}
            hint="A city, a country, or a region. Put “worldwide” if it doesn’t matter."
          >
            <input
              id="location"
              name="location"
              placeholder="Austin, TX — or Texas, or the US"
              className={inputClass}
            />
          </Field>

          <Field
            label="Your business"
            htmlFor="business"
            error={errors.business}
            hint="Name or website, and what you sell."
          >
            <input
              id="business"
              name="business"
              placeholder="Northwind Dental Supply — equipment for clinics"
              className={inputClass}
            />
          </Field>

          <Field label="What can you pay per lead?" error={errors.budgetPerLead}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BUDGET_PER_LEAD.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors",
                    budget === option.value
                      ? "border-accent bg-accent-soft font-medium text-accent-text"
                      : "border-border bg-bg text-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  <input
                    type="radio"
                    name="budgetPerLead"
                    value={option.value}
                    checked={budget === option.value}
                    onChange={() => setBudget(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="How many leads a month?" error={errors.leadsPerMonth}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LEADS_PER_MONTH.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors",
                    volume === option.value
                      ? "border-accent bg-accent-soft font-medium text-accent-text"
                      : "border-border bg-bg text-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  <input
                    type="radio"
                    name="leadsPerMonth"
                    value={option.value}
                    checked={volume === option.value}
                    onChange={() => setVolume(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </Field>

          <FormError message={message} />

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Joining…" : "Join the waitlist"}
          </Button>

          <p className="text-center text-xs text-faint">
            Your details are already saved &mdash; this just tells the agent what to look for.
          </p>
        </form>
      )}
    </div>
  );
}
