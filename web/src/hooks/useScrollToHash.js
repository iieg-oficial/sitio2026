// src/hooks/useScrollToHash.js
import { useEffect } from "react";
import { useLocation, useNavigation } from "react-router";

export function useScrollToHash() {
  const { hash } = useLocation();
  const navigation = useNavigation();

  useEffect(() => {
    // Solo actuar cuando la navegación terminó (state === "idle")
    if (navigation.state !== "idle") return;
    if (!hash) return;

    const tryScroll = (attempts = 0) => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < 10) {
        setTimeout(() => tryScroll(attempts + 1), 100);
      }
    };

    tryScroll();
  }, [hash, navigation.state]); // Se dispara cuando termina la navegación
}