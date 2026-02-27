import React from "react";
import { Button } from "../ui/button";

const SubmitButton = ({ isLoading, children, loadingLabel }) => {
  return (
    <Button type="submit" disabled={isLoading} aria-busy={isLoading} className="w-full">
      {isLoading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" aria-hidden="true" />
          {loadingLabel || "Please wait..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;
