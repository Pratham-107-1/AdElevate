import { useState, useEffect } from "react";
import { coreApi } from "../api/client";

export default function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coreApi.get("/api/locations")
      .then((res) => setLocations(res.data))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  return { locations, loading };
}
