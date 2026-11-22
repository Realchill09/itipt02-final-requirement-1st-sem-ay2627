import { l as Y, r as J } from "./p-DZnVmCdW-B0xfKWkU.js";
import { c as l, n as c } from "./p-CjipsCSh-Cqo6VGi9.js";
import { d as n$1 } from "./p-CEQhyzEV-DUY9CDYB.js";
// node_modules/@ionic/core/components/p-BjZLJLiN.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var n = () => {
	const n = window;
	n.addEventListener("statusTap", (() => {
		J((() => {
			const o = document.elementFromPoint(n.innerWidth / 2, n.innerHeight / 2);
			if (!o) return;
			const i = l(o);
			i && new Promise(((o) => n$1(i, o))).then((() => {
				Y((async () => {
					i.style.setProperty("--overflow", "hidden"), await c(i, 300), i.style.removeProperty("--overflow");
				}));
			}));
		}));
	}));
};
export { n as startStatusTap };
