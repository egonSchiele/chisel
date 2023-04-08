import React, { useEffect, useRef, useState } from "react";
export default function Launcher() {

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
    return (
        <div className={`absolute p-8 top-1/2 left-1/2 w-36 h-12 bg-white text-black ${!open && "hidden"}`}>
            <input type="text" className="absolute top-0 left-0" autoFocus />
        </div>
    )
}