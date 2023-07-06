// @ts-ignore
import React from "react";
export default function Auth({
  title,
  primary,
  secondary,
  primaryAction,
  secondaryAction,
  error = null,
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background dark:bg-dmbackground">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {error && (
          <div className="rounded-md bg-red-700 text-white w-full p-4 mb-sm">
            {error}
          </div>
        )}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-300">
          {title}
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mt-sm">
          Chisel is still in Beta! Please back up your work frequently,
          functionality may break or change. Starting 7/10, you'll need your own
          key to use Chisel.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-dmsidebar py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              primaryAction(email, password);
            }}
            method="POST"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-main sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-main sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/*  <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div> */}

            {/*    <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-main hover:text-main dark:text-gray-300"
                >
                  Forgot your password?
                </a>
              </div> 
            </div> */}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md dark:bg-black py-2 px-3 text-sm font-semibold text-black dark:text-white shadow-sm hover:bg-main dark:hover:bg-dmbuttonhover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main"
              >
                {primary}
              </button>
            </div>
            <div className="items-center text-center">
              <a
                href={secondaryAction}
                className="font-medium w-full text-center text-black hover:text-main dark:text-gray-300 "
              >
                <div className="text-sm w-full dark:bg-gray-600 py-xs rounded-md">
                  {secondary}
                </div>
              </a>
            </div>
          </form>
          <div className="bg-gray-200 dark:bg-gray-800 p-xs mt-lg">
            <p className="text-center text-gray-700 dark:text-gray-300 my-sm">
              Or login as a guest. Guest accounts will be deleted after 24
              hours.
            </p>
            <form action="/loginGuestUser" method="POST">
              <button
                type="submit"
                className="flex w-full justify-center rounded-md dark:bg-black py-2 px-3 text-sm font-semibold text-black dark:text-white shadow-sm hover:bg-main dark:hover:bg-dmbuttonhover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main"
              >
                Sign in as guest
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
