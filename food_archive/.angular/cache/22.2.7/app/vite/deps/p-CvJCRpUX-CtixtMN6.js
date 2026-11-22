import { S as r, y as w } from "./p-CEQhyzEV-DUY9CDYB.js";
import { t as n } from "./p-D0YpjgON-CQ6tjdDc.js";
// node_modules/@ionic/core/components/p-CvJCRpUX.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var s = (s, e, n$1, a, c) => {
	const p = s.ownerDocument.defaultView;
	let i = r(s);
	const m = (t) => i ? -t.deltaX : t.deltaX;
	return n({
		el: s,
		gestureName: "goback-swipe",
		gesturePriority: 101,
		threshold: 10,
		canStart: (t) => (i = r(s), ((t) => {
			const { startX: o } = t;
			return i ? o >= p.innerWidth - 50 : o <= 50;
		})(t) && e()),
		onStart: n$1,
		onMove: (t) => {
			a(m(t) / p.innerWidth);
		},
		onEnd: (o) => {
			const r = m(o), s = p.innerWidth, e = r / s, n = ((t) => i ? -t.velocityX : t.velocityX)(o), a = n >= 0 && (n > .2 || r > s / 2), h = (a ? 1 - e : e) * s;
			let j = 0;
			if (h > 5) {
				const t = h / Math.abs(n);
				j = Math.min(t, 540);
			}
			c(a, e <= 0 ? .01 : w(0, e, .9999), j);
		}
	});
};
export { s as createSwipeBackGesture };
