import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { API_URL } from "../constants/api";

// fetch() against the API with the signed-in user's Clerk session token.
// Stable across renders so it's safe in useCallback/useEffect deps.
export const useApi = () => {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  return useCallback(async (path, options = {}) => {
    const token = await getTokenRef.current();
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }, []);
};
