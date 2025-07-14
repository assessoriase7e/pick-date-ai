import { CheckIcon, PlusIcon } from "lucide-react";

const OfferList = ({ text, status }: { text: string; status: "active" | "inactive" }) => {
  return (
    <div className="mb-3 flex items-center">
      <span className="mr-3 flex h-[18px] w-full max-w-[18px] items-center justify-center rounded-full bg-primary bg-opacity-10 text-foreground">
        {status === "active" ? <CheckIcon /> : <PlusIcon />}
      </span>
      <p className="m-0 text-base font-medium text-body-color">{text}</p>
    </div>
  );
};

export default OfferList;
