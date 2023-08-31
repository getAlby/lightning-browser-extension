const AlbyLogo = () => {
  return (
    <>
      <img
        src="assets/icons/alby-logo-text-light.svg"
        className="dark:hidden"
      />
      <img
        src="assets/icons/alby-logo-text-dark.svg"
        className="hidden dark:inline"
      />
    </>
  );
};

export default AlbyLogo;
