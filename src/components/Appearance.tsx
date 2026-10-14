import { useEffect } from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon, SunIcon, MoonIcon } from "@radix-ui/react-icons";
export function Appearance() {
  function theme(value: "light" | "dark") {
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem("handbook-theme", value);
    } catch {
      /* The selected theme remains active for this visit. */
    }
  }
  function size(value: string) {
    document.documentElement.style.setProperty("--reading-size", value);
    try {
      localStorage.setItem("handbook-size", value);
    } catch {
      /* The selected size remains active for this visit. */
    }
  }
  useEffect(() => {
    try {
      const value = localStorage.getItem("handbook-size");
      if (value && ["16px", "18px", "20px"].includes(value))
        document.documentElement.style.setProperty("--reading-size", value);
    } catch {
      /* Use the default reading size. */
    }
  }, []);
  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        className="icon-button"
        aria-label="Reading preferences"
      >
        <MixerHorizontalIcon />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className="preferences" align="end" sideOffset={10}>
          <Dropdown.Label>Appearance</Dropdown.Label>
          <Dropdown.Item onSelect={() => theme("light")}>
            <SunIcon /> Light
          </Dropdown.Item>
          <Dropdown.Item onSelect={() => theme("dark")}>
            <MoonIcon /> Dark
          </Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Label>Reading size</Dropdown.Label>
          {[
            { label: "Compact", value: "16px" },
            { label: "Comfortable", value: "18px" },
            { label: "Large", value: "20px" },
          ].map((option) => (
            <Dropdown.Item
              key={option.value}
              onSelect={() => size(option.value)}
            >
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
