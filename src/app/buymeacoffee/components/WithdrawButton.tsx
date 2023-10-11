import React from "react";
import { motion } from "framer-motion"

export const WithdrawButton = () => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-2 py-1 text-xs space-x-2
             font-medium transition rounded cursor-pointer  relative bg-gray-600 text-white" >
            Withdraw
        </motion.button>
    );
};
