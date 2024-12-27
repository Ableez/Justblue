import React from "react";

type Props = {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
};

const CheckCircle = ({ onValueChange, checked, label, disabled }: Props) => {
  return (
    <div
      onClick={() => {
        if (disabled) return;
        onValueChange(!checked);
      }}
      className={`${disabled && "cursor-not-allowed opacity-40"} flex place-items-center items-center gap-1`}
    >
      <div className={"grid h-9 w-9 place-items-center"}>
        <div
          className={`aspect-square origin-center active:scale-75 ${checked ? "h-7 w-7 scale-75 border-[9px] border-blue-600" : "h-5 w-5 scale-105 border-neutral-700"} rounded-full border-2 transition-all duration-300 ease-out`}
        />
      </div>
      {label && <h4 className="text-xs">Any one can reply and quote</h4>}
    </div>
  );
};

export default CheckCircle;
