import React from "react";

function Feature({ image, title, text }) {
  return (
    <div className="grid grid-cols-2 my-lg gap-4">
      <img
        src={image}
        alt={title}
        className=" rounded border border-gray-300 dark:border-gray-700 mr-sm"
      />
      <div>
        <h3 className="text-3xl antialiased  mb-sm font-bold dark:text-gray-300 text-gray-700">
          {title}
        </h3>
        <p className="text-lg">{text}</p>
      </div>
    </div>
  );
}

type FeatureData = {
  image: string;
  title: string;
  text: string;
};

const features: FeatureData[] = [
  {
    image: "/images/history.png",
    title: "History",
    text: "Git-like history lets you track every change, so nothing is ever lost.",
  },
  {
    image: "/images/prompts.png",
    title: "AI prompts",
    text: "Built-in AI prompts like expand, contract, and rewrite... and it's easy to add your own.",
  },
  {
    image: "/images/launcher.png",
    title: "Quick-launch",
    text: "Navigate the UI, go to a chapter, or run an AI prompt, all without touching the mouse.",
  },
  {
    image: "/images/gridmode.png",
    title: "Grid mode",
    text: "Organize your chapters by act or by beat using grid mode.",
  },
  {
    image: "/images/focusmode.png",
    title: "Focus mode",
    text: "Get feedback on your writing.",
  },
];

export default function Home() {
  return (
    <div className="grid grid-cols-1 m-md mt-xl">
      <div className="col-span-1 w-full lg:w-1/2 mx-auto">
        <h1 className="text-4xl font-bold tracking-tight  sm:text-6xl">
          Chisel editor
        </h1>
        <p className="mt-xs text-lg leading-8 text-gray-800 dark:text-gray-300 ">
          A community of 22 writers and counting
        </p>
        <div className="my-10 flex gap-x-6">
          <a
            href="https://github.com/egonSchiele/chisel"
            className="rounded-md bg-dmsidebar dark:bg-dmsidebar px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            View on GitHub
          </a>
          <a
            href="/login.html"
            className="rounded-md bg-dmsidebar dark:bg-dmsidebar px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Try demo
          </a>
        </div>
        {/*   <blockquote className="italic mb-sm">
          The sculpture is already complete within the marble block, before I
          start my work... I just have to chisel away the superfluous material.
          - Michaelangelo
        </blockquote> */}
        <p className="text-xl mb-lg">
          Chisel is for writers who believe 90% of writing is editing. It helps
          you generate text, and then it helps you refine it, like you're
          chiselling away at a block of marble. Chisel is free and open source.
        </p>
        <h2 className="text-2xl mb-sm font-bold tracking-tight">
          Video walkthrough
        </h2>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube-nocookie.com/embed/aolGIke7CEo"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <h2 className="text-2xl mt-lg font-bold tracking-tight">Features</h2>
        {features.map((feature, i) => (
          <Feature key={i} {...feature} />
        ))}

        <a href="/privacy.html" className="my-2xl underline">
          Privacy policy
        </a>
      </div>
    </div>
  );
}
