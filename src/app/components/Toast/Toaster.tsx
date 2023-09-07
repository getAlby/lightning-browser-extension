import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="bottom-center"
      toastOptions={{
        duration: 4_000,
      }}
    />
  );
}
