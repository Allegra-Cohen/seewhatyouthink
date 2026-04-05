"use client";

import { useState, useRef } from "react";

const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSc3tmRYgDub5J7p122cyh2ptVdm1QeKfj2W7ezZ_cXiUHIn2w/formResponse";
const EMAIL_FIELD = "entry.1193661868";
const NAME_FIELD = "entry.493226534";

export function EmailSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = () => {
    // Small delay to let the form submit into the iframe before showing thanks
    setTimeout(() => setSubmitted(true), 500);
  };

  if (submitted) {
    return (
      <div
        style={{
          fontFamily: "var(--font-lato)",
          fontSize: "clamp(12pt, 1vw, 16pt)",
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
      >
        <label
          htmlFor="email"
          style={{
            fontFamily: "var(--font-lato)",
            fontSize: "clamp(12pt, 1vw, 16pt)",
            fontWeight: 700,
          }}
          className="block mb-3"
        >
          Get notified about new posts
        </label>
        <div className="flex flex-col gap-3 max-w-full lg:max-w-[50%]">
          <input
            id="name"
            name={NAME_FIELD}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              fontFamily: "var(--font-garamond), Garamond, serif",
              fontSize: "clamp(12pt, 1vw, 16pt)",
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
              fontSize: "clamp(12pt, 1vw, 16pt)",
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
