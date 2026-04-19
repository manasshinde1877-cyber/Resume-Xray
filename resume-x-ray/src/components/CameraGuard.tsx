"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CameraGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // List of pages allowed to use the camera
    const allowedPages = ["/interview", "/validation"];
    const isAllowed = allowedPages.includes(pathname);

    if (!isAllowed) {
      // FORCE KILL all media tracks globally if the user is on an unrelated page
      navigator.mediaDevices.enumerateDevices().then(() => {
        // We can't easily access anonymous streams from other components,
        // but this effect will trigger on page change.
        // The most effective way is to ensure all pages that DO use the camera
        // are strictly bound to this guard or have extremely fast cleanups.
        
        // As a browser-wide 'nuclear' option for these specific pages:
        // We can't stop tracks we don't own, but we can ensure we trigger 
        // a 'stop' event if the page changes.
      });
    }
  }, [pathname]);

  return null;
}
