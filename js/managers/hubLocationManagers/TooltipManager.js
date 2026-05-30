export class TooltipManager {
    static tooltips = new Map();
    static tooltipEl = null;

    static init() {
        this.tooltipEl = document.getElementById('custom-tooltip');
        // Делаем прослушку всего проекта одним слушателем
        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
    }

    // Сохраняем html ховера и его айди
    static registerTooltip(html) {
        const id = 'tt_' + Math.random().toString(36).substr(2, 9);
        this.tooltips.set(id, html);
        return id;
    }

    // Очистка старых тултипов (оптимизация)
    static clear() {
        this.tooltips.clear();
    }

    static handleMouseOver(e) {
        const target = e.target.closest('[data-tooltip-id]');
        if (!target) return;

        const id = target.getAttribute('data-tooltip-id');
        const html = this.tooltips.get(id);

        if (html) {
            this.tooltipEl.innerHTML = html;
            this.tooltipEl.style.display = 'block';

            // адаптация размера под содержимое
            if (html.includes('unit-card-mini')) {
                this.tooltipEl.style.maxWidth = '580px';
                this.tooltipEl.style.width = '520px';
                this.tooltipEl.style.whiteSpace = 'normal';
            } else {
                this.tooltipEl.style.maxWidth = '300px';
                this.tooltipEl.style.width = 'auto';
                this.tooltipEl.style.whiteSpace = 'pre-line';
            }

            this.updatePosition(e);
        }
    }

    static handleMouseMove(e) {
        if (this.tooltipEl.style.display === 'block') {
            this.updatePosition(e);
        }
    }

    static handleMouseOut(e) {
        const target = e.target.closest('[data-tooltip-id]');
        if (target) {
            this.tooltipEl.style.display = 'none';
        }
    }

    static updatePosition(e) {
        let x = e.pageX + 15;
        let y = e.pageY + 15;
        
        if (x + this.tooltipEl.offsetWidth > window.innerWidth) {
            x = window.innerWidth - this.tooltipEl.offsetWidth - 10;
        }
        
        this.tooltipEl.style.left = x + 'px';
        this.tooltipEl.style.top = y + 'px';
    }
}