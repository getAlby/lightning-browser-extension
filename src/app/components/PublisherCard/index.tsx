import React from "react";
import { usePalette } from "react-palette";
import { ExternalLinkIcon } from "@heroicons/react/solid";

type Props = {
  title: string;
  image: string;
  url?: string;
};

export default function PublisherCard({ title, image, url }: Props) {
  const { data } = usePalette(image);
  return (
    <div
      className="p-6 bg-gray-300"
      style={{
        backgroundColor: data.vibrant,
        backgroundImage: `linear-gradient(${data.vibrant}, rgba(0, 0, 0, 0.3) 85%)`,
      }}
    >
      <img
        className="w-24 h-24 object-cover rounded-xl shadow-xl mx-auto mb-4"
        src={image}
        alt=""
      />
      <h2 className="text-center mb-0 text-xl text-white">
        {title}

        {url && (
          <a href={url} target="_blank">
            <ExternalLinkIcon className="inline h-5 w-5" aria-hidden="true" />
          </a>
        )}
      </h2>
    </div>
  );
}
