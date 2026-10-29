import type { MediaFragment } from "~/graphql/fragments";

// Per-type members of the `Media` fragment (the old codegen's
// `Media_<Type>_Fragment` names), narrowed by `__typename`.
export type Media_MediaImage_Fragment = Extract<
  MediaFragment,
  { __typename: "MediaImage" }
>;
export type Media_Video_Fragment = Extract<
  MediaFragment,
  { __typename: "Video" }
>;
export type Media_Model3d_Fragment = Extract<
  MediaFragment,
  { __typename: "Model3d" }
>;
export type Media_ExternalVideo_Fragment = Extract<
  MediaFragment,
  { __typename: "ExternalVideo" }
>;
