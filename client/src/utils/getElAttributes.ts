export const getElementAttributes = (innerHTML: string) => {
    const elem = document.createElement('div');

    elem.innerHTML = innerHTML;

    const innerElem: HTMLIFrameElement = elem.childNodes[0] as HTMLIFrameElement;

    const attrObj: any = {};

    for (var i = 0, atts = innerElem.attributes, n = atts.length, arr = []; i < n; i++) {
        const att = atts[i];

        attrObj[att.nodeName] = att.nodeValue;
    }

    return attrObj;
}