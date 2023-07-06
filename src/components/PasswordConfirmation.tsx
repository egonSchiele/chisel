import React from "react";
import Button from "./Button";
import Input from "./Input";
export default function PasswordConfirmation({
  value,
  onChange,
  onSubmit,
  onSubmitLabel = "Submit",
  className = "",
}) {
  const [passwordConfirm, setPasswordConfirm] = React.useState("");

  const isError = passwordConfirm !== "" && passwordConfirm !== value;
  return (
    <div className={`grid grid-cols-1 mt-sm ${className}`}>
      <Input
        title="Password"
        name="encryptionPassword"
        type="password"
        value={value}
        onChange={onChange}
        className="my-0"
      />
      <Input
        title="Confirm Password"
        name="encryptionPasswordConfirm"
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        className="my-0"
      />
      {isError && (
        <p className="text-red-500 text-xs italic my-xs">
          Passwords do not match.
        </p>
      )}

      <Button
        size="medium"
        onClick={onSubmit}
        style="secondary"
        rounded
        className="my-xs w-full"
        selector={`passwordConfirmationDoneButton`}
        disabled={isError}
      >
        {onSubmitLabel}
      </Button>
    </div>
  );
}
