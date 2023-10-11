import React from "react";

interface Props {
    children: React.ReactNode;
    small?: boolean;
}

export const Container = ({ children, small = false }: Props) => {
  return (
    <div className={`px-8 mx-auto md:px-8 ${small ? 'max-w-3xl' : 'max-w-4xl'}`}>
      {children}
    </div>
  );
}
