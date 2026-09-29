/// <reference types="vite/client" />

declare module "*.css";

import "react";

declare module "react" {
  interface CSSProperties {
    "--c"?: string;
  }
}
