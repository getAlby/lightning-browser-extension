export type Props = {
  isSuccess: boolean;
  message: string;
};

export default function ResultCard({ message, isSuccess }: Props) {
  return (
    <div className="p-12 font-medium drop-shadow rounded-lg mt-4 flex flex-col items-center bg-white dark:bg-surface-02dp">
      <img
        src={isSuccess ? "assets/icons/tick.svg" : "assets/icons/cross.svg"}
        alt={isSuccess ? "success" : "failure"}
        className="mb-8"
      />
      <p className="text-center dark:text-white w-full text-ellipsis line-clamp-3">
        {message}
      </p>
    </div>
  );
}
