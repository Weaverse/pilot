import type { HydrogenComponent } from "@weaverse/hydrogen";

import * as Heading from "./Heading";
import * as SubHeading from "./SubHeading";
import * as Paragraph from "./Paragraph";
import * as Button from "./Button";

export let sharedComponents: HydrogenComponent[] = [
  SubHeading,
  Heading,
  Paragraph,
  Button,
];
