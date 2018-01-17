/*!
 * get-css-data
 * v0.0.1
 * https://github.com/jhildenbiddle/get-css-data
 * (c) 2018 John Hildenbiddle <http://hildenbiddle.com>
 * MIT license
 */
function getUrls(e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, o = {
        mimeType: t.mimeType || null,
        onComplete: t.onComplete || Function.prototype,
        onError: t.onError || Function.prototype,
        onSuccess: t.onSuccess || Function.prototype
    }, n = Array.isArray(e) ? e : [ e ], r = Array.apply(null, Array(n.length)).map(function(e) {
        return null;
    });
    function l(e, t) {
        o.onError(e, n[t], t);
    }
    function c(e, t) {
        r[t] = e, o.onSuccess(e, n[t], t), -1 === r.indexOf(null) && o.onComplete(r);
    }
    n.forEach(function(e, t) {
        var n = document.createElement("a");
        n.setAttribute("href", e), n.href = n.href;
        var r = n.host !== location.host, s = n.protocol === location.protocol;
        if (r && "undefined" != typeof XDomainRequest) if (s) {
            var u = new XDomainRequest();
            u.open("GET", e), u.timeout = 0, u.onprogress = Function.prototype, u.ontimeout = Function.prototype, 
            u.onload = function() {
                c(u.responseText, t);
            }, u.onerror = function(e) {
                l(u, t);
            }, setTimeout(function() {
                u.send();
            }, 0);
        } else console.log("Internet Explorer 9 Cross-Origin (CORS) requests must use the same protocol"), 
        l(null, t); else {
            var i = new XMLHttpRequest();
            i.open("GET", e), o.mimeType && i.overrideMimeType && i.overrideMimeType(o.mimeType), 
            i.onreadystatechange = function() {
                4 === i.readyState && (200 === i.status ? c(i.responseText, t) : l(i, t));
            }, i.send();
        }
    });
}

function getCss$1(e) {
    var t = {
        cssComments: /\/\*[\s\S]+?\*\//gm,
        cssImports: /(?:@import\s*)(?:url\(\s*)?(?:['"])([\w\-./ ]*)(?:['"])(?:\s*\))?(?:[^;]*;)/gim
    }, o = {
        include: e.include || 'style,link[rel="stylesheet"]',
        exclude: e.exclude || null,
        filter: e.filter || null,
        onComplete: e.onComplete || Function.prototype,
        onError: e.onError || Function.prototype,
        onSuccess: e.onSuccess || Function.prototype
    }, n = Array.apply(null, document.querySelectorAll(o.include)).filter(function(e) {
        return !matchesSelector(e, o.exclude);
    }), r = Array.apply(null, Array(n.length)).map(function(e) {
        return null;
    });
    function l() {
        if (-1 === r.indexOf(null)) {
            var e = r.join("");
            o.onComplete(e, r);
        }
    }
    function c(e, t, n, c) {
        r[n] = "", o.onError(e, c, t), l();
    }
    function s(e, n, u, i, a) {
        if (!o.filter || o.filter.test(e)) {
            var p = o.onSuccess(e, u, a || i), m = (e = !1 === p ? "" : p || e).replace(t.cssComments, "").match(t.cssImports);
            if (m) {
                var f = m.map(function(e) {
                    return e.replace(t.cssImports, "$1");
                });
                getUrls(f = f.map(function(e) {
                    return getFullUrl(e, i);
                }), {
                    onError: function(e, t, o) {
                        c(e, t, n, u);
                    },
                    onSuccess: function(t, o, r) {
                        var l = m[r], c = f[r];
                        s(e.replace(l, t), n, u, o, c);
                    }
                });
            } else r[n] = e, l();
        } else r[n] = "", l();
    }
    n.forEach(function(e, t) {
        var o = e.getAttribute("href"), n = e.getAttribute("rel"), u = "LINK" === e.nodeName && o && n && "stylesheet" === n.toLowerCase(), i = "STYLE" === e.nodeName;
        u ? getUrls(o, {
            mimeType: "text/css",
            onError: function(o, n, r) {
                c(o, n, t, e);
            },
            onSuccess: function(n, r, l) {
                var c = getFullUrl(o, location.href);
                s(n, t, e, c);
            }
        }) : i ? s(e.textContent, t, e, location.href) : (r[t] = "", l());
    });
}

function getFullUrl(e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : location.href, o = document.implementation.createHTMLDocument(""), n = o.createElement("base"), r = o.createElement("a");
    return o.head.appendChild(n), o.body.appendChild(r), n.href = t, r.href = e, r.href;
}

function matchesSelector(e, t) {
    return (e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector).call(e, t);
}

export default getCss$1;
//# sourceMappingURL=get-css-data.es.js.map
