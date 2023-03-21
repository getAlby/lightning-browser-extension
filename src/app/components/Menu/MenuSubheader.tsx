function MenuSubheader({ children }: { children: string }) {
  return (
    <span className="select-none px-4 text-gray-600 text-xxs font-medium uppercase dark:text-white">
      {children}
    </span>
  );
}

export default MenuSubheader;
