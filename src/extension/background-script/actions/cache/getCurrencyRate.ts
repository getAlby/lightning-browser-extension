const getCurrencyRate = async (message: FixMe) => {
  console.log("getCurrencyRate", { message });

  return {
    data: { rate: 100000 },
  };
};

export default getCurrencyRate;
