import React from "react";
import { usePalette } from "react-palette";

type Props = {
  title: string;
  image: string;
};

export default function PublisherCard({ title, image }: Props) {
  const { data } = usePalette(image);

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: data.vibrant,
        backgroundImage: `linear-gradient(${data.vibrant}, rgba(0, 0, 0, 0.3) 85%)`,
      }}
    >
      <img
        className="w-32 h-32 rounded-2xl shadow-xl mx-auto mb-4"
        src={image}
        alt=""
      />
      <h2 className="text-center mb-0 text-3xl text-white">{title}</h2>
    </div>
  );
}
