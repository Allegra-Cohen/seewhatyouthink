"use client";

import { useState, useRef } from "react";

const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLScxUSLf62PzDs24u30WPmKwrTuRAf1_WDlGSmeJzZu5dNIQZA/formResponse";
const EMAIL_FIELD = "entry.1193661868";
const NAME_FIELD = "entry.493226534";

// `label` is the ONLY thing that varies between the places this appears — home says
// "new posts", /field-guide says "new entries". It defaults to home's wording so that
// call site stays exactly as it was. Note both submit to the SAME Google Form, so
// there is one mailing list, not one per section.
export function EmailSignup({
  label = "Get notified about new posts",
}: {
  label?: string;
} = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountedAtRef = useRef(Date.now());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Honeypot caught a bot, or the form was filled out implausibly fast —
    // silently fake success instead of submitting, so bots get no signal they were caught
    const tooFast = Date.now() - mountedAtRef.current < 1500;
    if (website !== "" || tooFast) {
      e.preventDefault();
      setSubmitted(true);
      return;
    }
    // Small delay to let the form submit into the iframe before showing thanks
    setTimeout(() => setSubmitted(true), 500);
  };

  if (submitted) {
    return (
      <div
        className="drivable-target"
        style={{
          fontFamily: "var(--font-lato)",
          fontSize: "var(--form-text)",
          color: "var(--accent-primary)",
        }}
      >
        Wow, thanks! I'll ping you when there's something new to read.
      </div>
    );
  }

  return (
    <>
      <iframe
        ref={iframeRef}
        name="email-signup-iframe"
        style={{ display: "none" }}
        tabIndex={-1}
      />
      <form
        action={FORM_ACTION}
        method="POST"
        target="email-signup-iframe"
        onSubmit={handleSubmit}
        className="drivable-target"
      >
        <label
          htmlFor="email"
          style={{
            fontFamily: "var(--font-lato)",
            fontSize: "var(--form-text)",
            fontWeight: 700,
          }}
          className="block mb-3"
        >
          {label}
        </label>
        <div className="flex flex-col gap-3 max-w-full lg:max-w-[15rem]">
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              width: 0,
              height: 0,
              overflow: "hidden",
            }}
          >
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <input
            id="name"
            name={NAME_FIELD}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              fontFamily: "var(--font-garamond), Garamond, serif",
              fontSize: "var(--form-text)",
              backgroundColor: "transparent",
              borderBottom: "1.5px solid var(--foreground)",
              outline: "none",
            }}
            className="py-1 px-0 w-full"
          />
          <input
            id="email"
            name={EMAIL_FIELD}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              fontFamily: "var(--font-garamond), Garamond, serif",
              fontSize: "var(--form-text)",
              backgroundColor: "transparent",
              borderBottom: "1.5px solid var(--foreground)",
              outline: "none",
            }}
            className="py-1 px-0 w-full"
          />
          <button
            type="submit"
            style={{
              fontFamily: "var(--font-lato)",
              fontSize: "clamp(10pt, 0.9vw, 14pt)",
              fontWeight: 700,
              color: "#fff",
              backgroundColor: "var(--accent-primary)",
              border: "1.5px solid var(--accent-primary)",
              borderRadius: "6px",
              padding: "0.35rem 0.75rem",
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            Subscribe
          </button>
        </div>
      </form>
    </>
  );
}
