export default function PublisherCard() {
  return (
    <div
      className="flex h-full bg-auto bg-cover bg-center"
      style={{
        backgroundImage:
          "url(" + "https://i.ibb.co/Qm9bRxx/Rectangle-48.png" + ")",
      }}
    >
      <div className="m-auto">
        <img
          className="w-32 h-32 ml-10"
          src="https://i.ibb.co/mGx9NHQ/Rectangle-47.png"
        />
        <h1 className="font-bold text-white text-2xl">The Hype Machine</h1>
      </div>
    </div>
  );
}
