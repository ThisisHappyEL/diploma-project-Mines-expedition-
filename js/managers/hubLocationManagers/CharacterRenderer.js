export class CharacterRenderer {
    static getAvatarSliceHTML(adv, width = '90px') {
        if (!adv) return '';

        // Скейлинг и смещение спрайтов для погруженцев
        const zoomSize = "425px";
        const offsetX = "-190px";
        const offsetY = "-40px";

        return `
            <div class="avatar-slice" style="width: ${width}; height: 100%; overflow: visible; position: relative; flex-shrink: 0; box-sizing: border-box; z-index: 15;">
                <div style="position: absolute; width: ${zoomSize}; height: ${zoomSize}; top: ${offsetY}; left: ${offsetX}; pointer-events: none;">
                    ${this.getAvatarHTML(adv, zoomSize, true)}
                </div>
            </div>
        `;
    }

    static MAX_SPRITE_VARIATIONS = 15; 
    
    static getAvatarHTML(adv, size = '120px', isSlice = false) {
        if (!adv) return '';

        const sizeStr = typeof size === 'number' ? `${size}px` : size;

        const folder = adv.gender === 'm' ? 'mansAdventures' : 'womensAdventures';
        const prefix = adv.gender === 'm' ? 'man' : 'women';
        
        const idx = adv.spriteIndex !== undefined ? parseInt(adv.spriteIndex) : 0;
        
        const safeIdx = idx % CharacterRenderer.MAX_SPRITE_VARIATIONS; 
        const isLayered = true; 

        const armor = adv.equipment?.body || adv.civilBody;
        const weapon = adv.equipment?.rightHand;

        const isHood = armor && (
            armor.key === 'scoutOutfit' || armor.name?.includes('scoutOutfit') ||
            armor.key === 'travelCloak' || armor.name?.includes('travelCloak') ||
            armor.key === 'travelCloack' || armor.name?.includes('travelCloack')
        );

        const noHoodAsset = (adv.gender === 'm' && [0, 1, 8, 9].includes(safeIdx));
        const effectiveHood = isHood && !noHoodAsset;

        // приоритет бороды и волос для капюшона
        let hairSuffix;
        if (adv.gender === 'm') {
            hairSuffix = effectiveHood ? 'beardForHood' : 'beard'; 
        } else {
            hairSuffix = effectiveHood ? 'hairForHood' : 'hair'; 
        }

        const containerStyle = isSlice ? `
            width: ${sizeStr}; height: ${sizeStr}; flex-shrink: 0; position: relative; overflow: hidden; background: transparent; border: none; box-shadow: none;
        ` : `
            width: ${sizeStr}; height: ${sizeStr}; flex-shrink: 0; position: relative; overflow: hidden; background: #0d0a08; box-shadow: inset 0 0 15px #000; border: 1px solid var(--border-main);
        `;

        if (isLayered) {
            const sSuffix = hairSuffix;
            const altSuffix1 = adv.gender === 'm' 
                ? (effectiveHood ? 'beardforhood' : 'beard') 
                : (effectiveHood ? 'hairforhood' : 'hair');
            const altSuffix2 = adv.gender === 'm' ? 'beard' : 'hair';
            const altSuffix3 = adv.gender === 'm' ? 'Beard' : 'Hair';

            const p1 = `assets/img/${folder}/${prefix}${safeIdx}/${prefix}${safeIdx}${sSuffix}.png`;
            const p2 = `assets/img/${folder}/${prefix}${safeIdx}/${prefix}${safeIdx}${altSuffix1}.png`;
            const p3 = `assets/img/${folder}/${prefix}${safeIdx}/${prefix}${safeIdx}${altSuffix2}.png`;
            const p4 = `assets/img/${folder}/${prefix}${safeIdx}/${prefix}${safeIdx}${altSuffix3}.png`;

            // у плащей нет задней части
            const hasBack = armor && 
                armor.key !== 'travelCloak' && armor.key !== 'travelCloack' && 
                armor.key !== 'scoutOutfit';

            const backOutfitSrc = hasBack ? `assets/img/outfit/${armor.key || armor.name}Back.png` : '';
            const baseSrc = `assets/img/${folder}/${prefix}${safeIdx}/${prefix}${safeIdx}bust.png`;
            const outfitSrc = armor ? `assets/img/outfit/${armor.key || armor.name}.png` : '';
            const weaponSrc = weapon ? `assets/img/weapon/${weapon.key || weapon.name}.png` : '';

            return `
                <div class="char-avatar-layered" style="${containerStyle}">
                    ${backOutfitSrc ? `<img class="layer-outfit-back" src="${backOutfitSrc}" onerror="this.style.display='none';" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1;">` : ''}
                    ${!isHood ? `<img class="layer-base" src="${baseSrc}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 2;">` : ''}
                    ${armor ? `<img class="layer-outfit-front" src="${outfitSrc}" onerror="this.style.display='none';" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 3;">` : ''}
                    <img class="layer-hair-beard" src="${p1}" onerror="if (!this.step) this.step = 1; if (this.step === 1) { this.step = 2; this.src = '${p2}'; } else if (this.step === 2) { this.step = 3; this.src = '${p3}'; } else if (this.step === 3) { this.step = 4; this.src = '${p4}'; } else { this.style.display = 'none'; }" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 4;">
                    ${weapon ? `<img class="layer-weapon" src="${weaponSrc}" onerror="this.style.display='none';" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.85)); z-index: 10;">` : ''}
                </div>
            `;
        } else {
            const fallbackSrc = `assets/img/${folder}/${prefix}${safeIdx}/${prefix}${safeIdx}.png`;
            const weaponSrc = weapon ? `assets/img/weapon/${weapon.key || weapon.name}.png` : '';

            return `
                <div class="char-avatar-layered" style="${containerStyle}">
                    <img class="layer-base" src="${fallbackSrc}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1;">
                    ${weapon ? `<img class="layer-weapon" src="${weaponSrc}" onerror="this.style.display='none';" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.85)); z-index: 10;">` : ''}
                </div>
            `;
        }
    }
}