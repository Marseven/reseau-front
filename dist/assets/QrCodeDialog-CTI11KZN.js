import{c as n,D as m,f as x,g as p,h as y,B as g}from"./index-DVDWEHbk.js";import{j as e}from"./ui-5eBlLwhq.js";import{r as f}from"./vendor-04wAIC8k.js";import{Q as u}from"./index-BqC9xA9t.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=n("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=n("QrCode",[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1",key:"1tu5fj"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1",key:"1v8r4q"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1",key:"1x03jg"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3",key:"177gqh"}],["path",{d:"M21 21v.01",key:"ents32"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7",key:"8crl2c"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M12 3h.01",key:"n36tog"}],["path",{d:"M12 16v.01",key:"133mhm"}],["path",{d:"M16 12h1",key:"1slzba"}],["path",{d:"M21 12v.01",key:"1lwtk9"}],["path",{d:"M12 21v-1",key:"1880an"}]]);function N({open:o,onOpenChange:l,value:h,title:a,subtitle:s}){const i=f.useRef(null),d=()=>{var r;const c=((r=i.current)==null?void 0:r.innerHTML)||"",t=window.open("","_blank","width=400,height=500");t&&(t.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>QR Code - ${a}</title>
  <style>
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
    .qr { margin-bottom: 16px; }
    .title { font-size: 18px; font-weight: 700; margin: 0; }
    .subtitle { font-size: 14px; color: #666; margin: 4px 0 0; }
  </style>
</head>
<body>
  <div class="qr">${c}</div>
  <p class="title">${a}</p>
  ${s?`<p class="subtitle">${s}</p>`:""}
</body>
</html>`),t.document.close(),t.focus(),t.print())};return e.jsx(m,{open:o,onOpenChange:l,children:e.jsxs(x,{className:"max-w-sm",children:[e.jsx(p,{children:e.jsx(y,{children:"QR Code"})}),e.jsxs("div",{className:"flex flex-col items-center gap-4 py-4",children:[e.jsx("div",{ref:i,className:"bg-white p-4 rounded-lg",children:e.jsx(u,{value:h,size:256,level:"M"})}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"font-semibold text-foreground",children:a}),s&&e.jsx("p",{className:"text-sm text-muted-foreground",children:s})]}),e.jsxs(g,{onClick:d,variant:"outline",className:"gap-2",children:[e.jsx(k,{className:"h-4 w-4"}),"Imprimer"]})]})]})})}export{k as P,C as Q,N as a};
