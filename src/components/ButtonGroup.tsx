import React from "react";
import Button from "./Button";
export default function ButtonGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  //console.log(children);
  return (
    <span
      className={`my-auto rounded-md shadow-sm [&>*]:first:rounded-l-md [&>*]:last:rounded-r-md ${className}`}
    >
      {children}
    </span>
  );
}
