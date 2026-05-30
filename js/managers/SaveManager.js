import { GameState } from '../core/GameState.js';

export class SaveManager {
    static CURRENT_VERSION = "1.0";
    static activeProfile = "profile_1"; // ID текущего активного профиля
    static getActiveProfileId() {
        const id = localStorage.getItem('litho_desc_active_profile_id');
        if (id) return id;
        
        // Если игра запускается впервые берётся базовый первый профиль
        const profiles = this.getProfiles();
        return profiles[0].id;
    }
    static getProfiles() {
        const profilesJson = localStorage.getItem('litho_desc_profiles');
        // Если профилей нет, создаётся базовый первый профиль
        return profilesJson ? JSON.parse(profilesJson) : [
            { id: "profile_1", name: "Экспедиция Альфа", lastSaved: new Date().toLocaleString() }
        ];
    }

    // Перечень сохраняемых данных
    static saveGame() {
        const saveData = {
            version: this.CURRENT_VERSION,
            cycle: GameState.cycle,
            resources: GameState.resources,
            roster: GameState.roster,
            currentSquadIds: GameState.currentSquad.map(adv => adv ? adv.id : null), 
            inventory: GameState.inventory,
            expeditionInventory: GameState.expeditionInventory,
            activeQuests: GameState.activeQuests,
            questCooldowns: GameState.questCooldowns || {},
            biomeProgress: GameState.biomeProgress,
            threatLevel: GameState.threatLevel,
            selectedBiome: GameState.selectedBiome,
            hasFinishedExpedition: GameState.hasFinishedExpedition,
            debtCycles: GameState.debtCycles
        };

        localStorage.setItem(`litho_desc_save_${this.activeProfile}`, JSON.stringify(saveData));

        // Обновляем время последнего сохранения в списке профилей
        const profiles = this.getProfiles();
        const currentProf = profiles.find(p => p.id === this.activeProfile);
        if (currentProf) {
            currentProf.lastSaved = new Date().toLocaleString();
            localStorage.setItem('litho_desc_profiles', JSON.stringify(profiles));
        }

        console.log(`Прогресс успешно сохранен локально в профиль: ${this.activeProfile}`);
        
        // Запускаем фоновую синхронизацию с сервером
        this.syncWithServer(saveData);
    }

    static loadGame(profileId) {
        this.activeProfile = profileId;
        localStorage.setItem('litho_desc_active_profile_id', profileId);
        
        const rawData = localStorage.getItem(`litho_desc_save_${profileId}`);
        
        if (!rawData) {
            console.warn(`Файл сохранения для профиля ${profileId} не найден. Инициализация новой игры.`);
            this.initNewGame(profileId);
            return false;
        }

        try {
            const data = JSON.parse(rawData);

            GameState.cycle = data.cycle || 1;
            GameState.resources = data.resources || { candles: 150 };
            GameState.roster = data.roster || [];
            GameState.inventory = data.inventory || [];
            GameState.expeditionInventory = data.expeditionInventory || [];
            GameState.activeQuests = data.activeQuests || [];
            GameState.questCooldowns = data.questCooldowns || {};
            GameState.biomeProgress = data.biomeProgress || { mining: 0, research: 0, construction: 0, scouting: 0 };
            GameState.threatLevel = data.threatLevel || 0;
            GameState.selectedBiome = data.selectedBiome || 'glassForest';
            GameState.hasFinishedExpedition = data.hasFinishedExpedition || false;
            GameState.debtCycles = data.debtCycles !== undefined ? data.debtCycles : 3;

            // Восстанавливаем связи объектов отряда по сохраненным айдишкам из ростера
            GameState.currentSquad = [null, null, null, null];
            if (data.currentSquadIds) {
                data.currentSquadIds.forEach((id, idx) => {
                    if (id) {
                        const found = GameState.roster.find(adv => adv.id === id);
                        if (found) GameState.currentSquad[idx] = found;
                    }
                });
            }

            GameState.updateTopBarUI();
            console.log(`Прогресс успешно загружен из профиля: ${profileId}`);
            return true;
        } catch (e) {
            console.error("Критическая ошибка при чтении файла сохранения:", e);
            return false;
        }
    }

    static createProfile(profileName) {
        const profiles = this.getProfiles();
        const newId = `profile_${Date.now()}`; // Уникальный ID на основе таймстампа
        
        profiles.push({
            id: newId,
            name: profileName,
            lastSaved: "Новая игра"
        });
        
        localStorage.setItem('litho_desc_profiles', JSON.stringify(profiles));
        localStorage.setItem('litho_desc_active_profile_id', newId);

        this.initNewGame(newId);
    }

    // Сброс состояния до стартовых значений для новой игры
    static initNewGame(profileId) {
        this.activeProfile = profileId;

        GameState.cycle = 1;
        GameState.resources = { candles: 150 };
        GameState.roster = [];
        GameState.currentSquad = [null, null, null, null];
        GameState.inventory = [];
        GameState.expeditionInventory = [];
        GameState.activeQuests = [];
        GameState.questCooldowns = {};
        GameState.biomeProgress = { mining: 0, research: 0, construction: 0, scouting: 0 };
        GameState.threatLevel = 0;
        GameState.selectedBiome = 'glassForest';
        GameState.hasFinishedExpedition = false;
        GameState.debtCycles = 3;
        GameState.isDebugInitialized = false;

        GameState.initDebugInventory();
        GameState.updateTopBarUI();

        this.saveGame();
    }

    static async syncWithServer(saveData) {
        console.log("📡 Запуск фоновой синхронизации данных с сервером...");

        try {
            const response = await fetch('https://litho-descent-api.onrender.com/sync', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.activeProfile}`
                },
                body: JSON.stringify({
                    profileId: this.activeProfile,
                    timestamp: Date.now(),
                    data: saveData
                })
            });

            if (response.ok) {
                console.log("☁️ Данные успешно синхронизированы с удаленным облаком!");
            } else {
                console.warn("⚠️ Сервер вернул ошибку при синхронизации.");
            }
        } catch (error) {
            console.log("🔌 Сервер авторизации недоступен. Игра переведена в автономный режим.");
        }
    }

    static showProfileSelector() {
        const modal = document.getElementById('profile-modal');
        
        if (!modal) {
            console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Элемент #profile-modal не найден в HTML-файле! Проверьте index.html.");
            return;
        }
        
        modal.classList.remove('hidden');
        this.renderProfileList();

        document.getElementById('profile-close-btn').onclick = () => {
            modal.classList.add('hidden');
        };

        document.getElementById('btn-create-profile').onclick = () => {
            const input = document.getElementById('new-profile-name');
            const name = input.value.trim();
            if (!name) return alert('Введите название вашей новой экспедиции!');
            
            this.createProfile(name);
            input.value = '';
            modal.classList.add('hidden');
            location.reload();
        };
    }

    static renderProfileList() {
        const listContainer = document.getElementById('profile-list');
        listContainer.innerHTML = '';
        const profiles = this.getProfiles();

        profiles.forEach(p => {
            const isActive = p.id === this.activeProfile;
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 12px;
                border: 1px solid ${isActive ? 'var(--color-gold)' : '#444'};
                background: ${isActive ? 'rgba(255, 191, 0, 0.05)' : 'var(--bg-panel)'};
                cursor: pointer;
                text-align: left;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: 0.2s;
            `;
            if (!isActive) {
                item.onmouseenter = () => item.style.borderColor = '#fff';
                item.onmouseleave = () => item.style.borderColor = '#444';
            }

            item.innerHTML = `
                <div>
                    <b style="color: #fff; font-size: 14px;">${p.name}</b>
                    <div style="font-size: 11px; color: #888; margin-top: 3px;">Последнее сохранение: ${p.lastSaved}</div>
                </div>
                ${isActive ? '<span style="color: var(--color-gold); font-size: 11px; font-weight: bold;">АКТИВНА</span>' : '<span style="color: #888; font-size: 11px;">Выбрать</span>'}
            `;

            if (!isActive) {
                item.onclick = () => {
                    this.loadGame(p.id);
                    document.getElementById('profile-modal').classList.add('hidden');
                    location.reload(); 
                };
            }

            listContainer.appendChild(item);
        });
    }
}

window.SaveManager = SaveManager;