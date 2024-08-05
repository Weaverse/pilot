import type { HydrogenComponent } from "@weaverse/hydrogen";

import * as Button from "./Button";
import * as Heading from "./Heading";
import * as Paragraph from "./Paragraph";
import * as SubHeading from "./SubHeading";

export let sharedComponents: HydrogenComponent[] = [
  SubHeading,
  Heading,
  Paragraph,
  Button,
];
