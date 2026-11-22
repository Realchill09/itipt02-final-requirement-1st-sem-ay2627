import { d as n$1 } from "./p-CEQhyzEV-DUY9CDYB.js";
import { x as v } from "./p-DZnVmCdW-B0xfKWkU.js";
// node_modules/@ionic/core/components/p-CjipsCSh.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var r = "ion-content";
var e = ".ion-content-scroll-host";
var n = `${r}, ${e}`;
var t = (o) => "ION-CONTENT" === o.tagName;
var a = async (s) => t(s) ? (await new Promise(((r) => n$1(s, r))), s.getScrollElement()) : s;
var i = (o) => o.querySelector(".ion-content-scroll-host") || o.querySelector(n);
var l = (o) => o.closest(n);
var f = (o) => o.querySelector(e);
var u = (o) => {
	if (t(o)) return o.querySelector("ion-refresher");
	const s = o.closest(r);
	if (null === s) return null;
	const e = f(s);
	return null !== e && e.contains(o) ? s.querySelector("ion-refresher") : null;
};
var c = (o, s) => t(o) ? o.scrollToTop(s) : Promise.resolve(o.scrollTo({
	top: 0,
	left: 0,
	behavior: "smooth"
}));
var h = (o, s, r, e) => t(o) ? o.scrollByPoint(s, r, e) : Promise.resolve(o.scrollBy({
	top: r,
	left: s,
	behavior: e > 0 ? "smooth" : "auto"
}));
var m = (o) => v(o, r);
var p = (o) => {
	if (t(o)) {
		const s = o.scrollY;
		return o.scrollY = !1, s;
	}
	return o.style.setProperty("overflow", "hidden"), !0;
};
var d = (o, s) => {
	t(o) ? o.scrollY = s : o.style.removeProperty("overflow");
};
export { f as a, l as c, r as d, t as f, e as i, m as l, c as n, h as o, u as p, d as r, i as s, a as t, p as u };
