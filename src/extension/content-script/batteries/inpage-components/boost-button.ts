export default function updateBoostButton(input: any) {
    if(!input.lnurl) {
        document.querySelector('boost-button')?.remove()
        return;
    }

    let boostButton = document.querySelector('boost-button');
    if(!boostButton) {
        boostButton = document.createElement('boost-button');
        boostButton.setAttribute('lnurl', input.lnurl);
        boostButton.setAttribute('image', input.image);

        document.body.appendChild(boostButton);
    }
    else if(boostButton.getAttribute('lnurl') != input.lnurl) {
        boostButton.setAttribute('lnurl', input.lnurl);
        boostButton.setAttribute('image', input.image);
    }
}