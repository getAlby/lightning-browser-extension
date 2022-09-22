export default function updateBoostButton(lnurl?: string) {
    if(!lnurl) {
        document.querySelector('boost-button')?.remove()
        return;
    }

    let boostButton = document.querySelector('boost-button');
    if(!boostButton) {
        boostButton = document.createElement('boost-button');
        boostButton.setAttribute('lnurl', lnurl);
        document.body.appendChild(boostButton);
    }
    else if(boostButton.getAttribute('lnurl') != lnurl) {
        boostButton.setAttribute('lnurl', lnurl);
    }
}