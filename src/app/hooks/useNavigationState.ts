import { useLocation } from "react-router-dom";
import type { NavigationState } from "~/types";

export const useNavigationState = (): NavigationState => {
  const location = useLocation();

  return location.state as NavigationState;
};
