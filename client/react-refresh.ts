// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import RefreshRuntime from "/@react-refresh";
RefreshRuntime.injectIntoGlobalHook(window);
Object.assign(window, {
  $RefreshReg$: () => {},
  $RefreshSig$: () => (type: string) => type,
  __vite_plugin_react_preamble_installed__: true,
});
