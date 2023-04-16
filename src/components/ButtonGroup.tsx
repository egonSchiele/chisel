import React from "react";
import Button from "./Button";

export default function ButtonGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // console.log(children);
  return <span className={`my-auto ${className}`}>{children}</span>;
}
