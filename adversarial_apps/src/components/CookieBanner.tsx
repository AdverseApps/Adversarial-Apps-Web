"use client";

import CookieConsent from "react-cookie-consent";

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      cookieName="myCookieConsent"
      style={{ background: "#2B373B" }}
      buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
      expires={150}
    >
      We do not track user searches with cookies. Cookies are exclusively used for User Favoriting, nothing else is tracked. If you want user functionality to work as intended, please allow cookies by pressing: &quot;Accept&quot;
    </CookieConsent>
  );
}
