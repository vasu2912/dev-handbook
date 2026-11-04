import { useEffect, useState } from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  CheckIcon,
  MixerHorizontalIcon,
  SunIcon,
  MoonIcon,
} from "@radix-ui/react-icons";
import {
  defaultReadingSize,
  isReadingSize,
  isTheme,
  readingSizes,
  sizeKey,
  themeKey,
  type ReadingSize,
  type Theme,
} from "../lib/preferences";

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* The selection remains active for this visit. */
  }
}

export function Appearance() {
  const [theme, setTheme] = useState<Theme | undefined>();
  const [size, setSize] = useState<ReadingSize>(defaultReadingSize);

  useEffect(() => {
    // index.html already applied both values before paint; mirror them here.
    const current = document.documentElement.dataset.theme;
    if (isTheme(current)) setTheme(current);
    try {
      const stored = localStorage.getItem(sizeKey);
      if (isReadingSize(stored)) setSize(stored);
    } catch {
      /* Use the default reading size. */
    }
  }, []);

  function chooseTheme(value: string) {
    if (!isTheme(value)) return;
    document.documentElement.dataset.theme = value;
    setTheme(value);
    store(themeKey, value);
  }

  function chooseSize(value: string) {
    if (!isReadingSize(value)) return;
    document.documentElement.style.setProperty("--reading-size", value);
    setSize(value);
    store(sizeKey, value);
  }

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
          <Dropdown.RadioGroup value={theme} onValueChange={chooseTheme}>
            <Dropdown.RadioItem value="light">
              <SunIcon /> Light
              <Dropdown.ItemIndicator className="preference-check">
                <CheckIcon />
              </Dropdown.ItemIndicator>
            </Dropdown.RadioItem>
            <Dropdown.RadioItem value="dark">
              <MoonIcon /> Dark
              <Dropdown.ItemIndicator className="preference-check">
                <CheckIcon />
              </Dropdown.ItemIndicator>
            </Dropdown.RadioItem>
          </Dropdown.RadioGroup>
          <Dropdown.Separator />
          <Dropdown.Label>Text size</Dropdown.Label>
          <Dropdown.RadioGroup value={size} onValueChange={chooseSize}>
            {readingSizes.map((option) => (
              <Dropdown.RadioItem key={option.value} value={option.value}>
                <span
                  className="size-sample"
                  style={{ fontSize: option.value }}
                  aria-hidden="true"
                >
                  Aa
                </span>
                {option.label}
                <Dropdown.ItemIndicator className="preference-check">
                  <CheckIcon />
                </Dropdown.ItemIndicator>
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
