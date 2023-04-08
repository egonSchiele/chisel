import React, { useEffect, useRef, useState } from "react";
import { MenuItem } from "./Types";

function LaunchItem({ label, icon, onClick, className = "" }: { label: string, icon: any, onClick: () => void, className?: string }) {
    return <button
      type="button"
      className={`relative rounded-md inline-flex items-center text-black dark:text-gray-400 dark:bg-dmsidebar  hover:bg-gray-50 ring-0 ${className}`}
      onClick={onClick}
    >
      <span className="sr-only">{label}</span>
      {icon}
    </button>
  }

export default function Launcher({items}:{items: MenuItem[]}) {

    const [open, setOpen] = useState(false);

    const handleKeyDown = (event) => {
        if (event.metaKey && event.key === "p") {
            event.preventDefault();
            setOpen(cur => {
                return !cur;
            });
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    if (!open) {
        return <></>
    }
    console.log("items", items);
    return (
        <div className={`absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 text-black dark:text-white`}>
            <div className="grid grid-cols-3">
            <div className="col-span-1"></div>
            <div className="grid grid-rows-3">
                <div className="row-span-1" />
                    <input type="text" autoFocus className="text-black" />
                    {items.map((item, i) => {
                        return <LaunchItem key={i} label={item.label} icon={item.icon} onClick={item.onClick} className={item.className} />
                    })}
                    
                <div className="row-span-1" />
            </div>
            <div className="col-span-1"></div>
            </div>
        </div>
    )
}