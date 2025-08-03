import { RingLoader } from "react-spinners";

export default function CommonLoader() {
  return (
    <div className="flex items-center h-[400px] mb-6 justify-center">
      <RingLoader size={60} color="#017bcd" />
    </div>
  );
}
