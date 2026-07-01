import{a as t,c as s}from"./button-DwJn1awj.js";import{j as e}from"./app-Cl7rrBop.js";import{C as m}from"./card-Dvro27iB.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],h=t("Clock",x);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],v=t("Layers",p);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]],u=t("TrendingDown",b);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],y=t("TrendingUp",g),k={navy:{bar:"bg-primary",icon:"bg-primary/10 text-primary"},blue:{bar:"bg-blue-500",icon:"bg-blue-500/10 text-blue-600 dark:text-blue-400"},emerald:{bar:"bg-emerald-500",icon:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"},amber:{bar:"bg-amber-500",icon:"bg-amber-500/10 text-amber-600 dark:text-amber-400"},red:{bar:"bg-red-500",icon:"bg-red-500/10 text-red-600 dark:text-red-400"},slate:{bar:"bg-slate-400",icon:"bg-slate-500/10 text-slate-600 dark:text-slate-300"},purple:{bar:"bg-purple-500",icon:"bg-purple-500/10 text-purple-600 dark:text-purple-400"}};function w({title:i,value:c,icon:o,helper:r,accent:d="navy",trend:a}){const l=k[d],n=a&&a.value>=0;return e.jsxs(m,{className:"relative overflow-hidden p-4",children:[e.jsx("span",{className:s("absolute inset-y-0 left-0 w-1",l.bar),"aria-hidden":!0}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-muted-foreground text-sm font-medium",children:i}),e.jsx("div",{className:s("flex size-9 items-center justify-center rounded-lg",l.icon),children:e.jsx(o,{className:"size-5"})})]}),e.jsx("div",{className:"mt-2 text-3xl font-semibold tracking-tight tabular-nums",children:c}),e.jsxs("div",{className:"mt-1 flex items-center gap-2",children:[a&&e.jsxs("span",{className:s("inline-flex items-center gap-0.5 text-xs font-medium",n?"text-emerald-600 dark:text-emerald-400":"text-red-600 dark:text-red-400"),children:[n?e.jsx(y,{className:"size-3"}):e.jsx(u,{className:"size-3"}),Math.abs(a.value),"%",a.label?` ${a.label}`:""]}),r&&e.jsx("span",{className:"text-muted-foreground text-xs",children:r})]})]})}export{h as C,v as L,w as S};
