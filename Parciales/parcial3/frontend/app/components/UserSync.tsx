import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress || "";
      const name = user.firstName || user.fullName || email;
      localStorage.setItem("clerkId", user.id);
      localStorage.setItem("clerkName", name);
      window.dispatchEvent(new CustomEvent("auth-changed"));
      if (email) {
        fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId: user.id, name, email }),
        }).catch(() => {});
      }
    } else if (isLoaded && !user) {
      localStorage.removeItem("clerkId");
      localStorage.removeItem("clerkName");
      window.dispatchEvent(new CustomEvent("auth-changed"));
    }
  }, [isLoaded, user]);

  return null;
}
