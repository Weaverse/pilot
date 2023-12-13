import type {HydrogenComponent} from '@weaverse/hydrogen';
import * as Heading from './Heading';
import * as SubHeading from './SubHeading';
import * as Description from './Description';
import * as Button from './Button';

export let atoms: HydrogenComponent[] = [
  SubHeading,
  Heading,
  Description,
  Button,
];
