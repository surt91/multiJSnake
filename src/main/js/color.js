
// https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
function hsv_to_rgb(h, s, v) {
    const h_i = Math.floor(h*6);
    const f = h*6 - h_i;
    const p = v * (1 - s);
    const q = v * (1 - f*s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    if(h_i===0) {
        [r, g, b] = [v, t, p];
    } else if(h_i===1) {
        [r, g, b] = [q, v, p];
    } else if(h_i===2) {
        [r, g, b] = [p, v, t];
    } else if(h_i===3) {
        [r, g, b] = [p, q, v];
    } else if(h_i===4) {
        [r, g, b] = [t, p, v];
    } else if(h_i===5) {
        [r, g, b] = [v, p, q];
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    return rgbToHex(Math.floor(r*256), Math.floor(g*256), Math.floor(b*256));
}

function hue_from_idx(n) {
    const GOLDEN_RATIO_CONJUGATE = 0.618033988749895
    const HUE = 0.3;

    let h = HUE + GOLDEN_RATIO_CONJUGATE * n;
    h -= Math.floor(h);

    return h;
}

export function idx2color(n) {
    const h = hue_from_idx(n);
    return hsv_to_rgb(h, 0.5, 0.95);
}

export function desaturized_idx2color(n) {
    const h = hue_from_idx(n);
    return hsv_to_rgb(h, 0.25, 0.75);
}