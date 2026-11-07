import type {
  WeaverseComponentProps,
  WeaverseVideo,
} from "@weaverse/hydrogen/react-router";
import type { VariantProps } from "class-variance-authority";
import type { OverlayProps } from "~/components/overlay";
import type { variants } from "./styles";

export const SECTION_HEIGHTS = {
  small: "40vh",
  medium: "50vh",
  large: "70vh",
  custom: null,
};

export interface HeroVideoData
  extends OverlayProps, VariantProps<typeof variants> {
  video: WeaverseVideo;
  videoURL: string;
  autoplay: boolean;
  loop: boolean;
  showPlayPauseButton: boolean;
  height: "small" | "medium" | "large" | "custom";
  heightOnDesktop: number;
  gap?: number;
}

export interface HeroVideoProps extends HeroVideoData, WeaverseComponentProps {
  ref: React.Ref<HTMLElement>;
}
