type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  logo: string;
  title: string;
  url: string;
  payment: string;
};

export default function UsedCard({ logo, title, url, payment }: Props) {
  return (
    <div className="bg-white shadow-lg w-full rounded-lg h-28 hover:bg-gray-50 my-3  cursor-pointer">
      <div className="flex px-5 justify-between py-6">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="image" className="w-16 rounded-full" />
          <div>
            <h4 className="text-lg text-black font-serif">{title}</h4>
            <p className="text-base font-serif text-light-gray-bitcoin2 m-0 p-0">
              {" "}
              {url} <span>{payment} payment</span>
            </p>
          </div>
        </div>
        <div className=" flex items-center">
          <img src="assets/icons/arrow-right.svg" alt="image" className="w-2" />
        </div>
      </div>
    </div>
  );
}
