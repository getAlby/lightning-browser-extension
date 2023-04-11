import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import failAnimation from "../../../../static/assets/animation/failure-cross.json";
import successTickAnimation from "../../../../static/assets/animation/success-tick.json";

export type Props = {
  isSuccess: boolean;
  message: string;
  close?: () => void;
};

export default function ResultCard({ message, isSuccess, close }: Props) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, [isSuccess, message]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => prevProgress - 100 / 50);
    }, 50);

    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      close?.();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  });

  const ProgressBar = ({ progress }: { progress: number }) => {
    return (
      <div
        className={`bg-green-500 w-full bottom-0 transition-all duration-500 ease-in-out`}
        style={{
          position: "fixed",
          borderRadius: "0px 0px 5px 5px",
          height: "15px",
          left: "0px",
          width: `${progress}%`,
        }}
      >
        {``}
      </div>
    );
  };

  return (
    <>
      <div className="p-12 font-medium drop-shadow rounded-lg mt-4 flex flex-col items-center bg-white dark:bg-surface-02dp">
        {isSuccess ? (
          <Lottie
            style={{ width: "100px" }}
            loop={false}
            animationData={successTickAnimation}
          />
        ) : (
          <Lottie
            style={{ width: "220px" }}
            loop={false}
            animationData={failAnimation}
          />
        )}

        <p className="text-center dark:text-white w-full text-ellipsis line-clamp-3">
          {message}
        </p>
        <ProgressBar progress={progress}></ProgressBar>
      </div>
    </>
  );
}
