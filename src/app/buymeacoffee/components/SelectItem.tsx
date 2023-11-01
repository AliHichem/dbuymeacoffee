import {Dispatch, SetStateAction} from "react";

export const SelectItem = ({price, currentValue, setPrice}: {
    setPrice: Dispatch<SetStateAction<number>>;
    price: number;
    currentValue: number;
}) => (
    <div
        className={`font-semibold  flex items-center border justify-center w-8 h-8 rounded-full cursor-pointer ${
            price == currentValue
                ? 'bg-orange-500 text-white'
                : 'text-orange-500 bg-white border-blue-100'
        }`}
        onClick={() => setPrice(currentValue)}
    >
        {currentValue}
    </div>
);