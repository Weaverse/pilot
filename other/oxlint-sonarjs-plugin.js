import sonarjs from "eslint-plugin-sonarjs";
import { eslintCompatPlugin } from "vite-plus/lint/plugins";

export default eslintCompatPlugin(sonarjs);
