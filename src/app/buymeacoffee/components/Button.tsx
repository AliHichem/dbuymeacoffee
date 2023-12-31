import classNames from 'classnames';
import {motion} from "framer-motion"

interface ButtonProps {
    children: any;

    [x: string]: any;
}

const commonButtonProps =
    'inline-flex items-center px-4 py-2 text-xs space-x-2 font-medium transition rounded cursor-pointer  relative';

export const PrimaryButton: React.FC<ButtonProps> = ({children, ...other}) => {
    return (
        <motion.button
            {...other}
            className={classNames(
                'text-white  bg-orange-600 border border-gray-300  hover:opacity-90',
                commonButtonProps
            )}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
        >
            {children}
        </motion.button>
    );
};

export const SecondaryButton: React.FC<ButtonProps> = ({children, ...other}) => {
    return (
        <button
            {...other}
            className={classNames(
                ' text-gray-700  bg-white border border-gray-200 hover:bg-gray-50 hover:opacity-90',
                commonButtonProps
            )}
        >
            {children}
        </button>
    );
};
