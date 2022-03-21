import { useState, useEffect } from "react";
import copy from "copy-to-clipboard";

type CopyParams = {
  successDuration?: number;
};

export default function useCopyClipboard(
  options?: CopyParams
): [boolean, (text: string) => void] {
  const [isCopied, setIsCopied] = useState(false);
  const successDuration = options?.successDuration;

  useEffect(() => {
    if (!isCopied || !successDuration) return;

    const id = setTimeout(() => {
      setIsCopied(false);
    }, successDuration);

    return () => {
      clearTimeout(id);
    };
  }, [isCopied, successDuration]);

  return [
    isCopied,
    (text: string) => {
      const didCopy = copy(text);
      setIsCopied(didCopy);
    },
  ];
}
