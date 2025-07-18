// Tormenta 20 Character Sheet Application
class TormentaCharacterSheet {
    constructor() {
        this.character = this.getDefaultCharacter();
        this.skills = this.getDefaultSkills();
        this.init();
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.populateSkills();
        // Remover loadSampleData para iniciar zerado
        this.updateAllCalculations();
        this.renderCustomResources();
        this.renderAbilities();
        this.renderItems();
        this.renderSpells();
        this.renderPowers();
    }

    // Get default character structure with validation
    getDefaultCharacter() {
        return {
            nome: '',
            nivel: 1,
            raca: '',
            classes: [], // [{nome, nivel}]
            divindade: '',
            tendencia: '',
            origem: '',
            deslocamento: 9,
            atributos: {
                forca: 10,
                destreza: 10,
                constituicao: 10,
                inteligencia: 10,
                sabedoria: 10,
                carisma: 10
            },
            recursos: {
                vida: { atual: 0, maximo: 0, cor: '#e53e3e' },
                mana: { atual: 0, maximo: 0, cor: '#3182ce' },
                prana: { atual: 0, maximo: 0, cor: '#9f7aea' },
                recursos_extras: []
            },
            defesa: 10,
            pericias: {},
            inventario: {
                itens: [],
                dinheiro: { 'T$': 0, 'PP': 0, 'PO': 0, 'PE': 0, 'PC': 0 }
            },
            magias: {
                arcana: { '1º': [], '2º': [], '3º': [], '4º': [], '5º': [] },
                divina: { '1º': [], '2º': [], '3º': [], '4º': [], '5º': [] }
            },
            habilidades: [],
            poderes: [], // [{nome, tipo, descricao}]
        };
    }

    // Get default skills with proper structure
    getDefaultSkills() {
        // Lista oficial de perícias Tormenta 20
        return {
            'Acrobacia': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Adestramento': { atributo: 'carisma', treinada: false, bonusExtra: '', desconto: '' },
            'Arcanismo': { atributo: 'inteligencia', treinada: false, bonusExtra: '', desconto: '' },
            'Atletismo': { atributo: 'forca', treinada: false, bonusExtra: '', desconto: '' },
            'Atuação': { atributo: 'carisma', treinada: false, bonusExtra: '', desconto: '' },
            'Cavalgar': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Conhecimento': { atributo: 'inteligencia', treinada: false, bonusExtra: '', desconto: '' },
            'Cura': { atributo: 'sabedoria', treinada: false, bonusExtra: '', desconto: '' },
            'Diplomacia': { atributo: 'carisma', treinada: false, bonusExtra: '', desconto: '' },
            'Enganação': { atributo: 'carisma', treinada: false, bonusExtra: '', desconto: '' },
            'Fortitude': { atributo: 'constituicao', treinada: false, bonusExtra: '', desconto: '' },
            'Furtividade': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Guerra': { atributo: 'inteligencia', treinada: false, bonusExtra: '', desconto: '' },
            'Iniciativa': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Intimidação': { atributo: 'carisma', treinada: false, bonusExtra: '', desconto: '' },
            'Intuição': { atributo: 'sabedoria', treinada: false, bonusExtra: '', desconto: '' },
            'Investigação': { atributo: 'inteligencia', treinada: false, bonusExtra: '', desconto: '' },
            'Jogatina': { atributo: 'carisma', treinada: false, bonusExtra: '', desconto: '' },
            'Ladinagem': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Luta': { atributo: 'forca', treinada: false, bonusExtra: '', desconto: '' },
            'Misticismo': { atributo: 'sabedoria', treinada: false, bonusExtra: '', desconto: '' },
            'Nobreza': { atributo: 'inteligencia', treinada: false, bonusExtra: '', desconto: '' },
            'Ofício': { atributo: 'inteligencia', treinada: false, personalizados: [] },
            'Percepção': { atributo: 'sabedoria', treinada: false, bonusExtra: '', desconto: '' },
            'Pilotagem': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Pontaria': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Reflexos': { atributo: 'destreza', treinada: false, bonusExtra: '', desconto: '' },
            'Religião': { atributo: 'sabedoria', treinada: false, bonusExtra: '', desconto: '' },
            'Sobrevivência': { atributo: 'sabedoria', treinada: false, bonusExtra: '', desconto: '' },
            'Vontade': { atributo: 'sabedoria', treinada: false, bonusExtra: '', desconto: '' }
        };
    }

    // Load sample data with error handling
    loadSampleData() {
        try {
            const sampleData = {
                "character": {
                    "nome": "Alyssa Noctiveris",
                    "nivel": 1,
                    "raca": "Aggelus",
                    "classes": [{"nome": "Healler", "nivel": 1}],
                    "divindade": "Célestia",
                    "tendencia": "Leal Bom",
                    "origem": "Acólito",
                    "atributos": {
                        "forca": 8,
                        "destreza": 10,
                        "constituicao": 13,
                        "inteligencia": 14,
                        "sabedoria": 19,
                        "carisma": 14
                    },
                    "recursos": {
                        "vida": {"atual": 17, "maximo": 17, "cor": "#e53e3e"},
                        "mana": {"atual": 5, "maximo": 7, "cor": "#3182ce"},
                        "prana": {"atual": 0, "maximo": 0, "cor": "#9f7aea"},
                        "recursos_extras": [
                            {"nome": "Vigor", "atual": 10, "maximo": 10, "cor": "#38a169"},
                            {"nome": "Sorte", "atual": 3, "maximo": 3, "cor": "#d69e2e"}
                        ]
                    },
                    "defesa": 10,
                    "deslocamento": 9,
                    "pericias": {
                        "Adestramento": {"treinada": true, "bonus": 4, "atributo": "carisma"},
                        "Conhecimento": {"treinada": true, "bonus": 4, "atributo": "inteligencia"},
                        "Cura": {"treinada": true, "bonus": 6, "atributo": "sabedoria"},
                        "Iniciativa": {"treinada": true, "bonus": 2, "atributo": "destreza"},
                        "Intuição": {"treinada": true, "bonus": 6, "atributo": "sabedoria"},
                        "Percepção": {"treinada": true, "bonus": 6, "atributo": "sabedoria"},
                        "Religião": {"treinada": true, "bonus": 6, "atributo": "sabedoria"},
                        "Vontade": {"treinada": true, "bonus": 6, "atributo": "sabedoria"}
                    },
                    "inventario": {
                        "itens": [
                            {"nome": "Mochila e equipamentos", "tipo": "Equipamento", "quantidade": 1, "peso": 2.0},
                            {"nome": "Adaga", "tipo": "Arma", "quantidade": 1, "peso": 0.5},
                            {"nome": "Armadura de Couro", "tipo": "Armadura", "quantidade": 1, "peso": 7.0}
                        ],
                        "dinheiro": {"T$": 64, "PP": 0, "PO": 0, "PE": 0, "PC": 0}
                    },
                    "magias": {
                        "arcana": {"1º": [], "2º": [], "3º": [], "4º": [], "5º": []},
                        "divina": {
                            "1º": [
                                {"nome": "Santuário", "escola": "Abjuração", "execucao": "Padrão", "alcance": "Toque"},
                                {"nome": "Benção", "escola": "Encantamento", "execucao": "Padrão", "alcance": "Curto"}
                            ],
                            "2º": [], "3º": [], "4º": [], "5º": []
                        }
                    },
                    "habilidades": [
                        {"nome": "Cura", "descricao": "Recupera 1d6+1 + mod. Sabedoria pontos de vida"},
                        {"nome": "Herança Divina", "descricao": "Criatura do tipo espírito com visão no escuro"}
                    ],
                    "poderes": [
                        {"nome": "Visão no Escuro", "tipo": "Raça", "descricao": "Visão no escuro"}
                    ]
                }
            };

            this.importCharacterData(sampleData);
        } catch (error) {
            console.error('Erro ao carregar dados de exemplo:', error);
            this.showError('Erro ao carregar dados de exemplo. Usando valores padrão.');
        }
    }

    // Bind all event listeners
    bindEvents() {
        // Import/Export
        document.getElementById('importBtn').addEventListener('click', () => this.triggerImport());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCharacter());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileImport(e));

        // Basic info
        if (document.getElementById('nome')) document.getElementById('nome').addEventListener('input', (e) => this.updateCharacterField('nome', e.target.value));
        if (document.getElementById('nivel')) document.getElementById('nivel').addEventListener('input', (e) => this.updateLevel(parseInt(e.target.value) || 1));
        if (document.getElementById('raca')) document.getElementById('raca').addEventListener('input', (e) => this.updateCharacterField('raca', e.target.value));
        // Removido: classe
        if (document.getElementById('divindade')) document.getElementById('divindade').addEventListener('input', (e) => this.updateCharacterField('divindade', e.target.value));
        if (document.getElementById('tendencia')) document.getElementById('tendencia').addEventListener('input', (e) => this.updateCharacterField('tendencia', e.target.value));
        if (document.getElementById('origem')) document.getElementById('origem').addEventListener('input', (e) => this.updateCharacterField('origem', e.target.value));
        if (document.getElementById('deslocamento')) document.getElementById('deslocamento').addEventListener('input', (e) => this.updateCharacterField('deslocamento', parseInt(e.target.value) || 9));

        // Attributes
        ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'].forEach(attr => {
            if (document.getElementById(attr)) {
                document.getElementById(attr).addEventListener('input', (e) => this.updateAttribute(attr, parseInt(e.target.value) || 10));
            }
        });

        // Defense bonuses
        if (document.getElementById('bonus-armadura')) document.getElementById('bonus-armadura').addEventListener('input', () => this.updateDefense());
        if (document.getElementById('bonus-escudo')) document.getElementById('bonus-escudo').addEventListener('input', () => this.updateDefense());

        // Resources
        ['vida', 'mana', 'prana'].forEach(resource => {
            if (document.getElementById(`${resource}-atual`)) document.getElementById(`${resource}-atual`).addEventListener('input', (e) => this.updateResource(resource, 'atual', parseInt(e.target.value) || 0));
            if (document.getElementById(`${resource}-max`)) document.getElementById(`${resource}-max`).addEventListener('input', (e) => this.updateResource(resource, 'maximo', parseInt(e.target.value) || 0));
            if (document.getElementById(`${resource}-color`)) document.getElementById(`${resource}-color`).addEventListener('input', (e) => this.updateResourceColor(resource, e.target.value));
        });

        // Money
        ['ts', 'pp', 'po', 'pe', 'pc'].forEach(coin => {
            const element = document.getElementById(`money-${coin}`);
            if (element) {
                element.addEventListener('input', (e) => this.updateMoney(coin.toUpperCase(), parseInt(e.target.value) || 0));
            }
        });

        // Dynamic content buttons
        if (document.getElementById('addResourceBtn')) document.getElementById('addResourceBtn').addEventListener('click', () => this.addCustomResource());
        if (document.getElementById('addAbilityBtn')) document.getElementById('addAbilityBtn').addEventListener('click', () => this.addAbility());
        if (document.getElementById('addItemBtn')) document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        if (document.getElementById('addPowerBtn')) document.getElementById('addPowerBtn').addEventListener('click', () => this.addPower());
        // Remover binds de foto do personagem

        // Spell tabs
        const spellsTabs = document.querySelector('.spells-tabs');
        if (spellsTabs) {
            spellsTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-button')) {
                    this.switchTab(e.target.dataset.tab);
                }
            });
        }

        // Add spell buttons
        document.querySelectorAll('.add-spell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.addSpell(e.target.dataset.type));
        });
    }

    // Update character field with validation
    updateCharacterField(field, value) {
        try {
            this.character[field] = value;
            this.validateField(field, value);
        } catch (error) {
            console.error(`Erro ao atualizar campo ${field}:`, error);
            this.showError(`Erro ao atualizar ${field}`);
        }
    }

    // Update level with cascade effects
    updateLevel(level) {
        try {
            level = Math.max(1, Math.min(20, level));
            this.character.nivel = level;
            this.updateAllCalculations();
        } catch (error) {
            console.error('Erro ao atualizar nível:', error);
            this.showError('Erro ao atualizar nível');
        }
    }

    // Update class information
    updateClass(className) {
        try {
            this.character.classes = className ? [{ nome: className, nivel: this.character.nivel }] : [];
            this.updateAllCalculations();
        } catch (error) {
            console.error('Erro ao atualizar classe:', error);
            this.showError('Erro ao atualizar classe');
        }
    }

    // Update attribute with modifier calculation
    updateAttribute(attribute, value) {
        try {
            value = Math.max(1, Math.min(25, value));
            this.character.atributos[attribute] = value;
            
            const modifier = Math.floor((value - 10) / 2);
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            
            document.getElementById(`${attribute}-mod`).textContent = modifierText;
            
            this.updateAllCalculations();
        } catch (error) {
            console.error(`Erro ao atualizar atributo ${attribute}:`, error);
            this.showError(`Erro ao atualizar ${attribute}`);
        }
    }

    // Calculate training bonus based on level
    getTrainingBonus() {
        const level = this.getTotalLevel();
        if (level >= 15) return 6;
        if (level >= 7) return 4;
        return 2;
    }

    // Calculate attribute modifier
    getAttributeModifier(attribute) {
        const value = this.character.atributos[attribute] || 10;
        return Math.floor((value - 10) / 2);
    }

    // Update all calculations
    updateAllCalculations() {
        try {
            this.updateDefense();
            this.updateInitiative();
            this.updateSkills();
            this.updateResourceBars();
        } catch (error) {
            console.error('Erro ao atualizar cálculos:', error);
            this.showError('Erro ao atualizar cálculos automáticos');
        }
    }

    // Update defense calculation
    updateDefense() {
        try {
            const desModifier = this.getAttributeModifier('destreza');
            const armorBonus = parseInt(document.getElementById('bonus-armadura')?.value) || 0;
            const shieldBonus = parseInt(document.getElementById('bonus-escudo')?.value) || 0;
            
            const totalDefense = 10 + desModifier + armorBonus + shieldBonus;
            
            document.getElementById('defesa-total').textContent = totalDefense;
            document.getElementById('defesa-des').textContent = desModifier >= 0 ? `+${desModifier}` : `${desModifier}`;
            document.getElementById('defesa-armadura').textContent = armorBonus >= 0 ? `+${armorBonus}` : `${armorBonus}`;
            
            this.character.defesa = totalDefense;
        } catch (error) {
            console.error('Erro ao calcular defesa:', error);
        }
    }

    // Update initiative calculation
    updateInitiative() {
        try {
            const desModifier = this.getAttributeModifier('destreza');
            const trainingBonus = this.getTrainingBonus();
            
            const totalInitiative = desModifier + trainingBonus;
            
            document.getElementById('iniciativa-total').textContent = totalInitiative >= 0 ? `+${totalInitiative}` : `${totalInitiative}`;
            document.getElementById('iniciativa-des').textContent = desModifier >= 0 ? `+${desModifier}` : `${desModifier}`;
            document.getElementById('iniciativa-treino').textContent = trainingBonus >= 0 ? `+${trainingBonus}` : `${trainingBonus}`;
        } catch (error) {
            console.error('Erro ao calcular iniciativa:', error);
        }
    }

    // Populate skills
    populateSkills() {
        const container = document.getElementById('skills-container');
        container.innerHTML = '';

        Object.entries(this.skills).forEach(([skillName, skillData]) => {
            // Ofício especial: renderizar todos os personalizados
            if (skillName === 'Ofício') {
                // Renderizar botão para adicionar novo ofício
                const addBtn = document.createElement('button');
                addBtn.className = 'btn btn--sm btn--secondary';
                addBtn.textContent = '+ Adicionar Ofício';
                addBtn.onclick = () => this.addCustomProfession();
                container.appendChild(addBtn);

                // Renderizar cada ofício personalizado
                if (this.character.pericias && Array.isArray(this.character.pericias.oficios)) {
                    this.character.pericias.oficios.forEach((oficio, idx) => {
                        const oficioDiv = document.createElement('div');
                        oficioDiv.className = 'skill-item';
                        // Nome do ofício acima
                        oficioDiv.innerHTML = `
                            <div class="skill-name skill-name-block">
                                <input type="text" class="form-control" style="max-width:180px; display:inline-block;" value="${oficio.nome}" placeholder="Nome do ofício" onchange="app.updateCustomProfession(${idx}, 'nome', this.value)">
                            </div>
                            <div class="skill-row">
                                <div class="skill-total-col">
                                    <div class="skill-total" id="oficio-total-${idx}">${oficio.total>=0?`+${oficio.total}`:oficio.total||'+0'}</div>
                                </div>
                                <div class="skill-controls-col">
                                    <select class="form-control skill-attr-select" onchange="app.updateCustomProfession(${idx}, 'atributo', this.value)">
                                        <option value="forca" ${oficio.atributo==='forca'?'selected':''}>Força</option>
                                        <option value="destreza" ${oficio.atributo==='destreza'?'selected':''}>Destreza</option>
                                        <option value="constituicao" ${oficio.atributo==='constituicao'?'selected':''}>Constituição</option>
                                        <option value="inteligencia" ${oficio.atributo==='inteligencia'?'selected':''}>Inteligência</option>
                                        <option value="sabedoria" ${oficio.atributo==='sabedoria'?'selected':''}>Sabedoria</option>
                                        <option value="carisma" ${oficio.atributo==='carisma'?'selected':''}>Carisma</option>
                                    </select>
                                    <input type="number" class="form-control skill-bonus" style="max-width:70px;" value="${oficio.bonus}" placeholder="Bônus" onchange="app.updateCustomProfession(${idx}, 'bonus', parseInt(this.value)||0)">
                                    <div class="skill-training">
                                        <input type="checkbox" id="oficio-treinada-${idx}" ${oficio.treinada?'checked':''} onchange="app.updateCustomProfession(${idx}, 'treinada', this.checked)">
                                        <label for="oficio-treinada-${idx}">Treinada</label>
                                    </div>
                                    <button class="remove-item" onclick="app.removeCustomProfession(${idx})">✕</button>
                                </div>
                            </div>
                        `;
                        container.appendChild(oficioDiv);
                    });
                }
            } else {
                const skillElement = this.createSkillElement(skillName, skillData);
                container.appendChild(skillElement);
            }
        });
    }

    // Create skill element
    createSkillElement(skillName, skillData) {
        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill-item';
        
        const isTrainedInCharacter = this.character.pericias[skillName]?.treinada || false;
        const currentAttr = this.character.pericias[skillName]?.atributo || skillData.atributo;
        // Garantir que bonus e desconto sejam sempre mostrados corretamente
        let bonus = this.character.pericias[skillName]?.bonusExtra;
        let desconto = this.character.pericias[skillName]?.desconto;
        bonus = (bonus === undefined || bonus === null) ? 0 : bonus;
        desconto = (desconto === undefined || desconto === null) ? 0 : desconto;
        skillDiv.innerHTML = `
            <div class="skill-name skill-name-block">${skillName}</div>
            <div class="skill-row">
                <div class="skill-total-col">
                    <div class="skill-total" id="skill-total-${skillName}">+0</div>
                </div>
                <div class="skill-controls-col">
                    <select class="form-control skill-attr-select" onchange="app.updateSkillAttribute('${skillName}', this.value)">
                        <option value="forca" ${currentAttr==='forca'?'selected':''}>Força</option>
                        <option value="destreza" ${currentAttr==='destreza'?'selected':''}>Destreza</option>
                        <option value="constituicao" ${currentAttr==='constituicao'?'selected':''}>Constituição</option>
                        <option value="inteligencia" ${currentAttr==='inteligencia'?'selected':''}>Inteligência</option>
                        <option value="sabedoria" ${currentAttr==='sabedoria'?'selected':''}>Sabedoria</option>
                        <option value="carisma" ${currentAttr==='carisma'?'selected':''}>Carisma</option>
                    </select>
                    <input type="number" class="form-control skill-bonus" name="bonus-${skillName}" value="${bonus}" placeholder="Bônus" onchange="app.updateSkillBonus('${skillName}', this.value)">
                    <input type="number" class="form-control skill-desconto" name="desconto-${skillName}" value="${desconto}" placeholder="Desconto" onchange="app.updateSkillDesconto('${skillName}', this.value)">
                    <div class="skill-training">
                        <input type="checkbox" id="skill-${skillName}" ${isTrainedInCharacter ? 'checked' : ''}>
                        <label for="skill-${skillName}">Treinada</label>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for training checkbox
        const checkbox = skillDiv.querySelector(`#skill-${skillName}`);
        checkbox.addEventListener('change', (e) => this.updateSkillTraining(skillName, e.target.checked));

        // Add event listeners for bonus and desconto
        const bonusInput = skillDiv.querySelector('.skill-bonus');
        bonusInput.addEventListener('input', (e) => this.updateSkillBonus(skillName, e.target.value));
        const descontoInput = skillDiv.querySelector('.skill-desconto');
        descontoInput.addEventListener('input', (e) => this.updateSkillDesconto(skillName, e.target.value));

        return skillDiv;
    }

    // Update skill training
    updateSkillTraining(skillName, isTrained) {
        try {
            if (!this.character.pericias[skillName]) {
                this.character.pericias[skillName] = {};
            }
            this.character.pericias[skillName].treinada = isTrained;
            this.updateSkills();
        } catch (error) {
            console.error(`Erro ao atualizar treinamento da perícia ${skillName}:`, error);
        }
    }

    // Adicionar novo ofício personalizado
    addCustomProfession() {
        if (!this.character.pericias.oficios) this.character.pericias.oficios = [];
        this.character.pericias.oficios.push({
            nome: 'Novo Ofício',
            atributo: 'inteligencia',
            bonus: 0,
            treinada: false,
            total: 0
        });
        this.populateSkills();
        this.updateSkills();
    }

    // Atualizar propriedade de ofício personalizado
    updateCustomProfession(idx, prop, value) {
        if (!this.character.pericias.oficios || !this.character.pericias.oficios[idx]) return;
        this.character.pericias.oficios[idx][prop] = value;
        this.updateSkills();
        this.populateSkills();
    }

    // Remover ofício personalizado
    removeCustomProfession(idx) {
        if (!this.character.pericias.oficios) return;
        this.character.pericias.oficios.splice(idx, 1);
        this.populateSkills();
        this.updateSkills();
    }

    // Update skills calculations
    updateSkills() {
        try {
            Object.entries(this.skills).forEach(([skillName, skillData]) => {
                if (skillName === 'Ofício') {
                    // Atualizar todos os ofícios personalizados
                    if (!this.character.pericias.oficios) this.character.pericias.oficios = [];
                    this.character.pericias.oficios.forEach((oficio, idx) => {
                        const attributeModifier = this.getAttributeModifier(oficio.atributo);
                        const halfLevel = Math.floor(this.character.nivel / 2);
                        const trainingBonus = oficio.treinada ? this.getTrainingBonus() : 0;
                        const total = halfLevel + attributeModifier + trainingBonus + (parseInt(oficio.bonus)||0);
                        oficio.total = total;
                        const totalElement = document.getElementById(`oficio-total-${idx}`);
                        if (totalElement) {
                            totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
                        }
                    });
                } else {
                    const attributeModifier = this.getAttributeModifier(skillData.atributo);
                    const halfLevel = Math.floor(this.character.nivel / 2);
                    const isTrainedInCharacter = this.character.pericias[skillName]?.treinada || false;
                    const trainingBonus = isTrainedInCharacter ? this.getTrainingBonus() : 0;
                    let bonusExtra = this.character.pericias[skillName]?.bonusExtra;
                    let desconto = this.character.pericias[skillName]?.desconto;
                    bonusExtra = (bonusExtra === '' || bonusExtra === undefined) ? 0 : Number(bonusExtra);
                    desconto = (desconto === '' || desconto === undefined) ? 0 : Number(desconto);
                    const total = halfLevel + attributeModifier + trainingBonus + bonusExtra - desconto;
                    const totalElement = document.getElementById(`skill-total-${skillName}`);
                    if (totalElement) {
                        totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
                    }
                    if (!this.character.pericias[skillName]) {
                        this.character.pericias[skillName] = {};
                    }
                    this.character.pericias[skillName].bonus = total;
                    this.character.pericias[skillName].atributo = skillData.atributo;
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar perícias:', error);
        }
    }

    // Update resource
    updateResource(resource, type, value) {
        try {
            this.character.recursos[resource][type] = Math.max(0, value);
            this.updateResourceBar(resource);
        } catch (error) {
            console.error(`Erro ao atualizar recurso ${resource}:`, error);
        }
    }

    // Update resource color
    updateResourceColor(resource, color) {
        try {
            this.character.recursos[resource].cor = color;
            this.updateResourceBar(resource);
        } catch (error) {
            console.error(`Erro ao atualizar cor do recurso ${resource}:`, error);
        }
    }

    // Update resource bar
    updateResourceBar(resource) {
        try {
            const resourceData = this.character.recursos[resource];
            const percentage = resourceData.maximo > 0 ? (resourceData.atual / resourceData.maximo) * 100 : 0;
            
            const progressBar = document.getElementById(`${resource}-progress`);
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
                progressBar.style.backgroundColor = resourceData.cor;
            }
        } catch (error) {
            console.error(`Erro ao atualizar barra do recurso ${resource}:`, error);
        }
    }

    // Update all resource bars
    updateResourceBars() {
        ['vida', 'mana', 'prana'].forEach(resource => {
            this.updateResourceBar(resource);
        });
        
        // Update custom resources
        if (this.character.recursos.recursos_extras && Array.isArray(this.character.recursos.recursos_extras)) {
            this.character.recursos.recursos_extras.forEach((customResource, index) => {
                this.updateCustomResourceBar(index);
            });
        }
    }

    // Add custom resource
    addCustomResource() {
        try {
            const customResource = {
                nome: 'Novo Recurso',
                atual: 0,
                maximo: 0,
                cor: '#38a169'
            };
            
            if (!this.character.recursos.recursos_extras) {
                this.character.recursos.recursos_extras = [];
            }
            
            this.character.recursos.recursos_extras.push(customResource);
            this.renderCustomResources();
        } catch (error) {
            console.error('Erro ao adicionar recurso personalizado:', error);
            this.showError('Erro ao adicionar recurso personalizado');
        }
    }

    // Render custom resources
    renderCustomResources() {
        const container = document.getElementById('custom-resources-container');
        container.innerHTML = '';

        if (this.character.recursos.recursos_extras && Array.isArray(this.character.recursos.recursos_extras)) {
            this.character.recursos.recursos_extras.forEach((resource, index) => {
                const resourceElement = this.createCustomResourceElement(resource, index);
                container.appendChild(resourceElement);
            });
        }
    }

    // Create custom resource element
    createCustomResourceElement(resource, index) {
        const resourceDiv = document.createElement('div');
        resourceDiv.className = 'resource-item custom-resource-visual';
        resourceDiv.innerHTML = `
            <div class="resource-header">
                <span style="font-size:1.5em; margin-right:8px;">🔹</span>
                <input type="text" class="form-control" value="${resource.nome}" 
                       onchange="app.updateCustomResourceName(${index}, this.value)">
                <div class="resource-values">
                    <input type="number" class="form-control resource-current" min="0" value="${resource.atual}"
                           onchange="app.updateCustomResourceValue(${index}, 'atual', parseInt(this.value) || 0)">
                    <span>/</span>
                    <input type="number" class="form-control resource-max" min="0" value="${resource.maximo}"
                           onchange="app.updateCustomResourceValue(${index}, 'maximo', parseInt(this.value) || 0)">
                </div>
                <button class="remove-resource" onclick="app.removeCustomResource(${index})">✕</button>
            </div>
            <div class="resource-bar">
                <div class="resource-progress" id="custom-resource-progress-${index}"></div>
            </div>
            <input type="color" class="resource-color" value="${resource.cor}"
                   onchange="app.updateCustomResourceColor(${index}, this.value)">
        `;
        return resourceDiv;
    }

    // Update custom resource name
    updateCustomResourceName(index, name) {
        try {
            if (this.character.recursos.recursos_extras[index]) {
                this.character.recursos.recursos_extras[index].nome = name;
            }
        } catch (error) {
            console.error('Erro ao atualizar nome do recurso personalizado:', error);
        }
    }

    // Update custom resource value
    updateCustomResourceValue(index, type, value) {
        try {
            if (this.character.recursos.recursos_extras[index]) {
                this.character.recursos.recursos_extras[index][type] = Math.max(0, value);
                this.updateCustomResourceBar(index);
            }
        } catch (error) {
            console.error('Erro ao atualizar valor do recurso personalizado:', error);
        }
    }

    // Update custom resource color
    updateCustomResourceColor(index, color) {
        try {
            if (this.character.recursos.recursos_extras[index]) {
                this.character.recursos.recursos_extras[index].cor = color;
                this.updateCustomResourceBar(index);
            }
        } catch (error) {
            console.error('Erro ao atualizar cor do recurso personalizado:', error);
        }
    }

    // Update custom resource bar
    updateCustomResourceBar(index) {
        try {
            const resource = this.character.recursos.recursos_extras[index];
            if (resource) {
                const percentage = resource.maximo > 0 ? (resource.atual / resource.maximo) * 100 : 0;
                const progressBar = document.getElementById(`custom-resource-progress-${index}`);
                if (progressBar) {
                    progressBar.style.width = `${percentage}%`;
                    progressBar.style.backgroundColor = resource.cor;
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar barra do recurso personalizado:', error);
        }
    }

    // Remove custom resource
    removeCustomResource(index) {
        try {
            if (this.character.recursos.recursos_extras && this.character.recursos.recursos_extras[index]) {
                this.character.recursos.recursos_extras.splice(index, 1);
                this.renderCustomResources();
            }
        } catch (error) {
            console.error('Erro ao remover recurso personalizado:', error);
        }
    }

    // Update money
    updateMoney(coinType, value) {
        try {
            const key = coinType === 'TS' ? 'T$' : coinType;
            this.character.inventario.dinheiro[key] = Math.max(0, value);
        } catch (error) {
            console.error(`Erro ao atualizar dinheiro ${coinType}:`, error);
        }
    }

    // Add ability
    addAbility() {
        try {
            const ability = {
                nome: 'Nova Habilidade',
                descricao: 'Descrição da habilidade'
            };
            
            this.character.habilidades.push(ability);
            this.renderAbilities();
        } catch (error) {
            console.error('Erro ao adicionar habilidade:', error);
        }
    }

    // Render abilities
    renderAbilities() {
        const container = document.getElementById('abilities-container');
        container.innerHTML = '';

        if (this.character.habilidades && Array.isArray(this.character.habilidades)) {
            this.character.habilidades.forEach((ability, index) => {
                const abilityElement = this.createAbilityElement(ability, index);
                container.appendChild(abilityElement);
            });
        }
    }

    // Create ability element
    createAbilityElement(ability, index) {
        const abilityDiv = document.createElement('div');
        abilityDiv.className = 'ability-item';
        abilityDiv.innerHTML = `
            <div class="ability-header">
                <input type="text" class="form-control ability-name" value="${ability.nome}"
                       onchange="app.updateAbilityName(${index}, this.value)">
                <button class="remove-ability" onclick="app.removeAbility(${index})">✕</button>
            </div>
            <textarea class="form-control ability-description" rows="3"
                      onchange="app.updateAbilityDescription(${index}, this.value)">${ability.descricao}</textarea>
        `;
        
        return abilityDiv;
    }

    // Update ability name
    updateAbilityName(index, name) {
        try {
            if (this.character.habilidades[index]) {
                this.character.habilidades[index].nome = name;
            }
        } catch (error) {
            console.error('Erro ao atualizar nome da habilidade:', error);
        }
    }

    // Update ability description
    updateAbilityDescription(index, description) {
        try {
            if (this.character.habilidades[index]) {
                this.character.habilidades[index].descricao = description;
            }
        } catch (error) {
            console.error('Erro ao atualizar descrição da habilidade:', error);
        }
    }

    // Remove ability
    removeAbility(index) {
        try {
            if (this.character.habilidades[index]) {
                this.character.habilidades.splice(index, 1);
                this.renderAbilities();
            }
        } catch (error) {
            console.error('Erro ao remover habilidade:', error);
        }
    }

    // Atualizar addItem para campos extras
    addItem() {
        try {
            const item = {
                nome: 'Novo Item',
                tipo: 'Equipamento',
                quantidade: 1,
                peso: 0,
                dano: '',
                critico: '',
                efeito: '',
                defesa: ''
            };
            this.character.inventario.itens.push(item);
            this.renderItems();
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
        }
    }

    // Atualizar renderItems para campos extras
    renderItems() {
        const container = document.getElementById('items-container');
        container.innerHTML = '';
        if (this.character.inventario.itens && Array.isArray(this.character.inventario.itens)) {
            this.character.inventario.itens.forEach((item, index) => {
                const itemElement = this.createItemElement(item, index);
                container.appendChild(itemElement);
            });
        }
    }

    // Atualizar createItemElement para campos extras
    createItemElement(item, index) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-row';
        itemDiv.innerHTML = `
            <input type="text" class="form-control" value="${item.nome}" 
                   onchange="app.updateItemProperty(${index}, 'nome', this.value)">
            <select class="form-control" onchange="app.updateItemProperty(${index}, 'tipo', this.value)">
                <option value="Equipamento" ${item.tipo==='Equipamento'?'selected':''}>Equipamento</option>
                <option value="Arma" ${item.tipo==='Arma'?'selected':''}>Arma</option>
                <option value="Armadura" ${item.tipo==='Armadura'?'selected':''}>Armadura</option>
                <option value="Outro" ${item.tipo==='Outro'?'selected':''}>Outro</option>
            </select>
            <input type="number" class="form-control" value="${item.quantidade}" min="1"
                   onchange="app.updateItemProperty(${index}, 'quantidade', parseInt(this.value) || 1)">
            <input type="number" class="form-control" value="${item.peso}" min="0" step="0.1"
                   onchange="app.updateItemProperty(${index}, 'peso', parseFloat(this.value) || 0)">
            <button class="remove-item" onclick="app.removeItem(${index})">✕</button>
            <div class="item-extra-fields" style="display:${item.tipo==='Arma'||item.tipo==='Armadura'?'block':'none'}; width:100%; margin-top:8px;">
                ${item.tipo==='Arma'?`
                    <input type="text" class="form-control" placeholder="Dano" value="${item.dano||''}"
                        onchange="app.updateItemProperty(${index}, 'dano', this.value)">
                    <input type="text" class="form-control" placeholder="Crítico" value="${item.critico||''}"
                        onchange="app.updateItemProperty(${index}, 'critico', this.value)">
                    <input type="text" class="form-control" placeholder="Efeito" value="${item.efeito||''}"
                        onchange="app.updateItemProperty(${index}, 'efeito', this.value)">
                `:''}
                ${item.tipo==='Armadura'?`
                    <input type="text" class="form-control" placeholder="Defesa" value="${item.defesa||''}"
                        onchange="app.updateItemProperty(${index}, 'defesa', this.value)">
                    <input type="text" class="form-control" placeholder="Efeito" value="${item.efeito||''}"
                        onchange="app.updateItemProperty(${index}, 'efeito', this.value)">
                `:''}
            </div>
        `;
        return itemDiv;
    }

    // Update item property
    updateItemProperty(index, property, value) {
        try {
            if (this.character.inventario.itens[index]) {
                this.character.inventario.itens[index][property] = value;
            }
        } catch (error) {
            console.error('Erro ao atualizar propriedade do item:', error);
        }
    }

    // Remove item
    removeItem(index) {
        try {
            if (this.character.inventario.itens[index]) {
                this.character.inventario.itens.splice(index, 1);
                this.renderItems();
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
        }
    }

    // Switch spell tabs
    switchTab(tabName) {
        try {
            // Update tab buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        } catch (error) {
            console.error('Erro ao trocar aba:', error);
        }
    }

    // Adicionar magia: agora pede tipo e nível
    addSpell(type) {
        const level = prompt('Digite o nível/círculo da magia (ex: 1, 2, 3, 4...)');
        if (!level) return;
        const circleKey = `${level}º`;
        const spell = {
            nome: 'Nova Magia',
            escola: 'Evocação',
            execucao: 'Padrão',
            alcance: 'Curto',
            descricao: '',
            alvos: '',
            duracao: '',
            resistencia: '',
            testes: '',
            efeitos: '',
            nivel: circleKey
        };
        if (!this.character.magias[type][circleKey]) {
            this.character.magias[type][circleKey] = [];
        }
        this.character.magias[type][circleKey].push(spell);
        this.renderSpells();
    }

    // Render accordion de magias dinâmico
    renderSpells() {
        ['arcana', 'divina'].forEach(type => {
            const container = document.getElementById(`${type}-spells-accordion`);
            if (!container) return;
            container.innerHTML = '';
            // Obter todos os níveis existentes para esse tipo
            const levels = Object.keys(this.character.magias[type]).filter(lvl => (this.character.magias[type][lvl] && this.character.magias[type][lvl].length > 0));
            levels.sort((a, b) => parseInt(a) - parseInt(b));
            levels.forEach((level, lvlIdx) => {
                // Accordion do nível
                const levelDiv = document.createElement('div');
                levelDiv.className = 'spell-accordion-level';
                const header = document.createElement('div');
                header.className = 'spell-accordion-header';
                header.innerHTML = `<span class='spell-accordion-arrow'>&#9654;</span> ${level} Círculo (${this.character.magias[type][level].length})`;
                header.onclick = () => {
                    header.classList.toggle('open');
                    content.classList.toggle('open');
                };
                levelDiv.appendChild(header);
                // Conteúdo do nível
                const content = document.createElement('div');
                content.className = 'spell-accordion-content';
                this.character.magias[type][level].forEach((spell, idx) => {
                    // Accordion da magia
                    const magicDiv = document.createElement('div');
                    magicDiv.className = 'spell-accordion-magic';
                    const magicHeader = document.createElement('div');
                    magicHeader.className = 'spell-accordion-magic-header';
                    magicHeader.innerHTML = `<span class='spell-accordion-magic-arrow'>&#9654;</span> ${spell.nome}`;
                    magicHeader.onclick = () => {
                        magicHeader.classList.toggle('open');
                        magicContent.classList.toggle('open');
                    };
                    magicDiv.appendChild(magicHeader);
                    // Conteúdo da magia
                    const magicContent = document.createElement('div');
                    magicContent.className = 'spell-accordion-magic-content';
                    magicContent.appendChild(this.createSpellElement(spell, type, level.replace('º',''), idx));
                    magicDiv.appendChild(magicContent);
                    content.appendChild(magicDiv);
                });
                levelDiv.appendChild(content);
                container.appendChild(levelDiv);
            });
        });
    }

    // Atualizar createSpellElement para campos extras
    createSpellElement(spell, type, circle, index) {
        const spellDiv = document.createElement('div');
        spellDiv.className = 'spell-item';
        spellDiv.innerHTML = `
            <div class="spell-header">
                <input type="text" class="form-control spell-name" value="${spell.nome}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'nome', this.value)">
                <button class="remove-spell" onclick="app.removeSpell('${type}', '${circle}', ${index})">✕</button>
            </div>
            <div class="spell-details">
                <input type="text" class="form-control" placeholder="Escola" value="${spell.escola||''}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'escola', this.value)">
                <input type="text" class="form-control" placeholder="Execução" value="${spell.execucao||''}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'execucao', this.value)">
                <input type="text" class="form-control" placeholder="Alcance" value="${spell.alcance||''}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'alcance', this.value)">
                <input type="text" class="form-control" placeholder="Alvos" value="${spell.alvos||''}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'alvos', this.value)">
                <input type="text" class="form-control" placeholder="Duração" value="${spell.duracao||''}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'duracao', this.value)">
                <input type="text" class="form-control" placeholder="Resistência" value="${spell.resistencia||''}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'resistencia', this.value)">
                <input type="text" class="form-control" placeholder="Testes" value="${spell.testes||''}"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'testes', this.value)">
                <textarea class="form-control" placeholder="Descrição/Efeitos" rows="2"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'descricao', this.value)">${spell.descricao||''}</textarea>
                <textarea class="form-control" placeholder="Efeitos adicionais" rows="1"
                       onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'efeitos', this.value)">${spell.efeitos||''}</textarea>
            </div>
        `;
        return spellDiv;
    }

    // Update spell property
    updateSpellProperty(type, circle, index, property, value) {
        try {
            const circleKey = `${circle}º`;
            if (this.character.magias[type][circleKey] && this.character.magias[type][circleKey][index]) {
                this.character.magias[type][circleKey][index][property] = value;
            }
        } catch (error) {
            console.error('Erro ao atualizar propriedade da magia:', error);
        }
    }

    // Remove spell
    removeSpell(type, circle, index) {
        try {
            const circleKey = `${circle}º`;
            if (this.character.magias[type][circleKey] && this.character.magias[type][circleKey][index]) {
                this.character.magias[type][circleKey].splice(index, 1);
                this.renderSpells();
            }
        } catch (error) {
            console.error('Erro ao remover magia:', error);
        }
    }

    // Métodos de poderes
    addPower() {
        if (!this.character.poderes) this.character.poderes = [];
        this.character.poderes.push({ nome: 'Novo Poder', tipo: 'Classe', descricao: '' });
        this.renderPowers();
    }
    updatePowerName(idx, value) {
        if (this.character.poderes[idx]) this.character.poderes[idx].nome = value;
    }
    updatePowerType(idx, value) {
        if (this.character.poderes[idx]) this.character.poderes[idx].tipo = value;
    }
    updatePowerDescription(idx, value) {
        if (this.character.poderes[idx]) this.character.poderes[idx].descricao = value;
    }
    removePower(idx) {
        if (this.character.poderes[idx]) {
            this.character.poderes.splice(idx, 1);
            this.renderPowers();
        }
    }
    renderPowers() {
        const container = document.getElementById('powers-container');
        if (!container) return;
        container.innerHTML = '';
        (this.character.poderes || []).forEach((power, idx) => {
            const div = document.createElement('div');
            div.className = 'power-item';
            div.innerHTML = `
                <div class='power-header'>
                    <input type='text' class='form-control power-name' value='${power.nome||''}' placeholder='Nome do poder' onchange='app.updatePowerName(${idx}, this.value)'>
                    <select class='form-control power-type' onchange='app.updatePowerType(${idx}, this.value)'>
                        <option value='Classe' ${power.tipo==='Classe'?'selected':''}>Classe</option>
                        <option value='Origem' ${power.tipo==='Origem'?'selected':''}>Origem</option>
                        <option value='Raça' ${power.tipo==='Raça'?'selected':''}>Raça</option>
                        <option value='Outro' ${power.tipo==='Outro'?'selected':''}>Outro</option>
                    </select>
                    <button class='remove-power' onclick='app.removePower(${idx})'>✕</button>
                </div>
                <textarea class='form-control power-description' rows='2' placeholder='Descrição' onchange='app.updatePowerDescription(${idx}, this.value)'>${power.descricao||''}</textarea>
            `;
            container.appendChild(div);
        });
    }

    // Field validation
    validateField(field, value) {
        try {
            switch (field) {
                case 'nivel':
                    if (value < 1 || value > 20) {
                        throw new Error('Nível deve estar entre 1 e 20');
                    }
                    break;
                case 'nome':
                    if (value.length > 100) {
                        throw new Error('Nome muito longo');
                    }
                    break;
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Trigger file import
    triggerImport() {
        document.getElementById('fileInput').click();
    }

    // Handle file import
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.importCharacterData(data);
                this.showSuccess('Personagem importado com sucesso!');
            } catch (error) {
                console.error('Erro ao importar:', error);
                this.showError('Erro ao importar arquivo JSON. Verifique o formato.');
            }
        };
        reader.readAsText(file);
    }

    // Import character data with validation
    importCharacterData(data) {
        try {
            // Validate structure
            if (!data || typeof data !== 'object') {
                throw new Error('Formato de dados inválido');
            }

            const characterData = data.character || data;

            // Compatibilidade com fichas antigas
            if (characterData.pericias) {
                const newSkills = this.getDefaultSkills();
                // Corrigir nomes e mapear campos antigos
                Object.entries(characterData.pericias).forEach(([oldName, oldData]) => {
                    // Remover quebras de linha e espaços extras do nome
                    let skillName = oldName.replace(/\n|\r/g, '').trim();
                    // Corrigir nomes para o padrão do sistema (ex: acentos, maiúsculas)
                    // Exemplo: "Atuacao" -> "Atuação"
                    // Aqui pode-se criar um dicionário de correção se necessário
                    if (!(skillName in newSkills)) {
                        // Tentar encontrar por lower case
                        const found = Object.keys(newSkills).find(k => k.toLowerCase() === skillName.toLowerCase());
                        if (found) skillName = found;
                    }
                    if (!(skillName in newSkills)) return; // Ignorar perícias não reconhecidas
                    if (!characterData.pericias[skillName]) characterData.pericias[skillName] = {};
                    // Mapear campos antigos
                    if (typeof oldData === 'object') {
                        characterData.pericias[skillName].treinada = oldData.treinada || false;
                        characterData.pericias[skillName].atributo = oldData.atributo || newSkills[skillName].atributo;
                        // Mapear bonus/penalidade para bonusExtra/desconto
                        characterData.pericias[skillName].bonusExtra = (typeof oldData.bonus !== 'undefined' && oldData.bonus !== null)
                            ? Number(oldData.bonus)
                            : 0;
                        characterData.pericias[skillName].desconto = (typeof oldData.penalidade !== 'undefined' && oldData.penalidade !== null)
                            ? Number(oldData.penalidade)
                            : 0;
                    }
                });
                // Garantir que todas as perícias existam
                Object.keys(newSkills).forEach(skillName => {
                    if (!characterData.pericias[skillName]) {
                        characterData.pericias[skillName] = {
                            treinada: false,
                            atributo: newSkills[skillName].atributo,
                            bonusExtra: 0,
                            desconto: 0
                        };
                    } else {
                        // Garantir campos obrigatórios
                        if (typeof characterData.pericias[skillName].bonusExtra === 'undefined') characterData.pericias[skillName].bonusExtra = 0;
                        if (typeof characterData.pericias[skillName].desconto === 'undefined') characterData.pericias[skillName].desconto = 0;
                        if (typeof characterData.pericias[skillName].atributo === 'undefined') characterData.pericias[skillName].atributo = newSkills[skillName].atributo;
                        if (typeof characterData.pericias[skillName].treinada === 'undefined') characterData.pericias[skillName].treinada = false;
                    }
                });
            }

            // Corrigir quebras de linha em nomes de habilidades e poderes
            if (Array.isArray(characterData.habilidades)) {
                characterData.habilidades = characterData.habilidades.map(h => ({
                    ...h,
                    nome: h.nome ? h.nome.replace(/\n|\r/g, ' ').trim() : '',
                    descricao: h.descricao ? h.descricao.replace(/\n|\r/g, ' ').trim() : ''
                }));
            }
            if (Array.isArray(characterData.poderes)) {
                characterData.poderes = characterData.poderes.map(p => ({
                    ...p,
                    nome: p.nome ? p.nome.replace(/\n|\r/g, ' ').trim() : '',
                    descricao: p.descricao ? p.descricao.replace(/\n|\r/g, ' ').trim() : ''
                }));
            }

            // Merge with default structure to prevent missing properties
            this.character = this.mergeWithDefault(this.getDefaultCharacter(), characterData);

            // Corrigir: garantir que bonusExtra e desconto sejam string vazia se não existirem
            Object.entries(this.skills).forEach(([skillName, skillData]) => {
                if (!this.character.pericias[skillName]) this.character.pericias[skillName] = {};
                if (typeof this.character.pericias[skillName].bonusExtra === 'undefined') this.character.pericias[skillName].bonusExtra = '';
                if (typeof this.character.pericias[skillName].desconto === 'undefined') this.character.pericias[skillName].desconto = '';
            });
            // Update UI
            this.updateUI();
            this.updateAllCalculations();
            
            // Garantir que os campos de perícia estejam sincronizados
            this.populateSkills();
            this.updateSkills();
            
            // Re-render dynamic content
            this.renderCustomResources();
            this.renderAbilities();
            this.renderItems();
            this.renderSpells();
            this.renderPowers();
            
        } catch (error) {
            console.error('Erro na importação:', error);
            this.showError('Erro ao processar dados importados: ' + error.message);
        }
    }

    // Merge imported data with default structure
    mergeWithDefault(defaultObj, importedObj) {
        const result = { ...defaultObj };
        
        if (!importedObj || typeof importedObj !== 'object') {
            return result;
        }

        Object.keys(importedObj).forEach(key => {
            if (importedObj[key] !== null && importedObj[key] !== undefined) {
                if (typeof importedObj[key] === 'object' && !Array.isArray(importedObj[key])) {
                    result[key] = this.mergeWithDefault(result[key] || {}, importedObj[key]);
                } else {
                    result[key] = importedObj[key];
                }
            }
        });

        return result;
    }

    // Update UI with character data
    updateUI() {
        try {
            // Basic info
            if (document.getElementById('nome')) document.getElementById('nome').value = this.character.nome || '';
            if (document.getElementById('nivel')) document.getElementById('nivel').value = this.getTotalLevel() || 1;
            if (document.getElementById('raca')) document.getElementById('raca').value = this.character.raca || '';
            // Removido: classe
            if (document.getElementById('divindade')) document.getElementById('divindade').value = this.character.divindade || '';
            if (document.getElementById('tendencia')) document.getElementById('tendencia').value = this.character.tendencia || '';
            if (document.getElementById('origem')) document.getElementById('origem').value = this.character.origem || '';
            if (document.getElementById('deslocamento')) document.getElementById('deslocamento').value = this.character.deslocamento || 9;

            // Attributes
            Object.entries(this.character.atributos).forEach(([attr, value]) => {
                if (document.getElementById(attr)) {
                    document.getElementById(attr).value = value;
                    this.updateAttribute(attr, value);
                }
            });

            // Resources
            ['vida', 'mana', 'prana'].forEach(resource => {
                const resourceData = this.character.recursos[resource];
                if (resourceData) {
                    if (document.getElementById(`${resource}-atual`)) document.getElementById(`${resource}-atual`).value = resourceData.atual || 0;
                    if (document.getElementById(`${resource}-max`)) document.getElementById(`${resource}-max`).value = resourceData.maximo || 0;
                    if (document.getElementById(`${resource}-color`)) document.getElementById(`${resource}-color`).value = resourceData.cor || '#ffffff';
                }
            });

            // Money
            if (this.character.inventario?.dinheiro) {
                Object.entries(this.character.inventario.dinheiro).forEach(([coin, value]) => {
                    const coinKey = coin === 'T$' ? 'ts' : coin.toLowerCase();
                    const element = document.getElementById(`money-${coinKey}`);
                    if (element) {
                        element.value = value || 0;
                    }
                });
            }

            // Skills training
            if (this.character.pericias) {
                Object.entries(this.character.pericias).forEach(([skill, data]) => {
                    const checkbox = document.getElementById(`skill-${skill}`);
                    if (checkbox) {
                        checkbox.checked = data.treinada || false;
                    }
                });
            }

            // Classes multiclasse
            const classesContainer = document.getElementById('classes-container');
            if (classesContainer) {
                classesContainer.innerHTML = '';
                (this.character.classes || []).forEach((cls, idx) => {
                    const div = document.createElement('div');
                    div.className = 'class-row';
                    div.innerHTML = `
                        <input type='text' class='form-control' style='max-width:120px' value='${cls.nome||''}' placeholder='Classe' onchange='app.updateClassName(${idx}, this.value)'>
                        <input type='number' class='form-control' style='max-width:60px' min='1' value='${cls.nivel||1}' placeholder='Nível' onchange='app.updateClassLevel(${idx}, parseInt(this.value)||1)'>
                        <button class='remove-item' onclick='app.removeClass(${idx})'>✕</button>
                    `;
                    classesContainer.appendChild(div);
                });
            }

            // Poderes
            const powersContainer = document.getElementById('powers-container');
            if (powersContainer) {
                powersContainer.innerHTML = '';
                (this.character.poderes || []).forEach((power, idx) => {
                    const div = document.createElement('div');
                    div.className = 'power-item';
                    div.innerHTML = `
                        <div class='power-header'>
                            <input type='text' class='form-control power-name' value='${power.nome||''}' placeholder='Nome do poder' onchange='app.updatePowerName(${idx}, this.value)'>
                            <select class='form-control power-type' onchange='app.updatePowerType(${idx}, this.value)'>
                                <option value='Classe' ${power.tipo==='Classe'?'selected':''}>Classe</option>
                                <option value='Origem' ${power.tipo==='Origem'?'selected':''}>Origem</option>
                                <option value='Raça' ${power.tipo==='Raça'?'selected':''}>Raça</option>
                                <option value='Outro' ${power.tipo==='Outro'?'selected':''}>Outro</option>
                            </select>
                            <button class='remove-power' onclick='app.removePower(${idx})'>✕</button>
                        </div>
                        <textarea class='form-control power-description' rows='2' placeholder='Descrição' onchange='app.updatePowerDescription(${idx}, this.value)'>${power.descricao||''}</textarea>
                    `;
                    powersContainer.appendChild(div);
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar UI:', error);
            this.showError('Erro ao atualizar interface');
        }
    }

    // Export character
    exportCharacter() {
        try {
            // Corrigir: garantir que bonusExtra e desconto sejam exportados corretamente
            Object.entries(this.skills).forEach(([skillName, skillData]) => {
                if (!this.character.pericias[skillName]) this.character.pericias[skillName] = {};
                if (typeof this.character.pericias[skillName].bonusExtra === 'undefined') this.character.pericias[skillName].bonusExtra = '';
                if (typeof this.character.pericias[skillName].desconto === 'undefined') this.character.pericias[skillName].desconto = '';
                // Garantir que exporte como número ou vazio
                if (this.character.pericias[skillName].bonusExtra === '') this.character.pericias[skillName].bonusExtra = '';
                else this.character.pericias[skillName].bonusExtra = Number(this.character.pericias[skillName].bonusExtra);
                if (this.character.pericias[skillName].desconto === '') this.character.pericias[skillName].desconto = '';
                else this.character.pericias[skillName].desconto = Number(this.character.pericias[skillName].desconto);
            });
            const exportData = {
                character: this.character,
                validation_notes: "Exported from Tormenta 20 Character Sheet"
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${this.character.nome || 'personagem'}_tormenta20.json`;
            link.click();
            
            this.showSuccess('Personagem exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.showError('Erro ao exportar personagem');
        }
    }

    // Show error message
    showError(message) {
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorAlert.style.display = 'flex';
        
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 5000);
    }

    // Show success message
    showSuccess(message) {
        const successAlert = document.getElementById('successAlert');
        const successMessage = document.getElementById('successMessage');
        
        successMessage.textContent = message;
        successAlert.style.display = 'flex';
        
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 3000);
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.character.foto = e.target.result;
            this.updatePhotoUI();
        };
        reader.readAsDataURL(file);
    }

    updatePhotoUI() {
        const img = document.getElementById('character-photo');
        const removeBtn = document.getElementById('removePhotoBtn');
        if (this.character.foto) {
            img.src = this.character.foto;
            img.style.display = 'block';
            removeBtn.style.display = 'inline-flex';
        } else {
            img.src = '';
            img.style.display = 'none';
            removeBtn.style.display = 'none';
        }
    }

    removePhoto() {
        this.character.foto = '';
        this.updatePhotoUI();
    }

    // Métodos para multiclasse
    addClass() {
        if (!this.character.classes) this.character.classes = [];
        this.character.classes.push({nome: '', nivel: 1});
        this.updateUI();
    }
    updateClassName(idx, value) {
        if (this.character.classes[idx]) {
            this.character.classes[idx].nome = value;
        }
    }
    updateClassLevel(idx, value) {
        if (this.character.classes[idx]) {
            this.character.classes[idx].nivel = value;
            this.updateAllCalculations();
        }
    }
    removeClass(idx) {
        if (this.character.classes[idx]) {
            this.character.classes.splice(idx, 1);
            this.updateUI();
            this.updateAllCalculations();
        }
    }
    // Nível total do personagem
    getTotalLevel() {
        return (this.character.classes||[]).reduce((acc, c) => acc + (parseInt(c.nivel)||0), 0);
    }
    // Usar getTotalLevel para cálculo de bônus de perícias
    getTrainingBonus() {
        const level = this.getTotalLevel();
        if (level >= 15) return 6;
        if (level >= 7) return 4;
        return 2;
    }

    // Atualizar bonus extra da perícia
    updateSkillBonus(skillName, value) {
        if (!this.character.pericias[skillName]) this.character.pericias[skillName] = {};
        if (value === '' || value === null) {
            this.character.pericias[skillName].bonusExtra = '';
        } else if (!isNaN(Number(value))) {
            this.character.pericias[skillName].bonusExtra = Number(value);
        }
        this.updateSkills();
        // Atualizar input e total imediatamente
        const input = document.querySelector(`.skill-item [name='bonus-${skillName}']`);
        if (input) input.value = value;
        const totalElement = document.getElementById(`skill-total-${skillName}`);
        if (totalElement) {
            let bonusExtra = this.character.pericias[skillName]?.bonusExtra;
            let desconto = this.character.pericias[skillName]?.desconto;
            bonusExtra = (bonusExtra === '' || bonusExtra === undefined) ? 0 : Number(bonusExtra);
            desconto = (desconto === '' || desconto === undefined) ? 0 : Number(desconto);
            const attributeModifier = this.getAttributeModifier(this.character.pericias[skillName]?.atributo || 'forca');
            const halfLevel = Math.floor(this.character.nivel / 2);
            const isTrainedInCharacter = this.character.pericias[skillName]?.treinada || false;
            const trainingBonus = isTrainedInCharacter ? this.getTrainingBonus() : 0;
            const total = halfLevel + attributeModifier + trainingBonus + bonusExtra - desconto;
            totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
        }
    }
    // Atualizar desconto da perícia
    updateSkillDesconto(skillName, value) {
        if (!this.character.pericias[skillName]) this.character.pericias[skillName] = {};
        if (value === '' || value === null) {
            this.character.pericias[skillName].desconto = '';
        } else if (!isNaN(Number(value))) {
            this.character.pericias[skillName].desconto = Number(value);
        }
        this.updateSkills();
        // Atualizar input e total imediatamente
        const input = document.querySelector(`.skill-item [name='desconto-${skillName}']`);
        if (input) input.value = value;
        const totalElement = document.getElementById(`skill-total-${skillName}`);
        if (totalElement) {
            let bonusExtra = this.character.pericias[skillName]?.bonusExtra;
            let desconto = this.character.pericias[skillName]?.desconto;
            bonusExtra = (bonusExtra === '' || bonusExtra === undefined) ? 0 : Number(bonusExtra);
            desconto = (desconto === '' || desconto === undefined) ? 0 : Number(desconto);
            const attributeModifier = this.getAttributeModifier(this.character.pericias[skillName]?.atributo || 'forca');
            const halfLevel = Math.floor(this.character.nivel / 2);
            const isTrainedInCharacter = this.character.pericias[skillName]?.treinada || false;
            const trainingBonus = isTrainedInCharacter ? this.getTrainingBonus() : 0;
            const total = halfLevel + attributeModifier + trainingBonus + bonusExtra - desconto;
            totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
        }
    }
}

// Initialize the application
const app = new TormentaCharacterSheet();

// Global functions for inline event handlers
window.app = app;

// Adicionar alerta de confirmação ao sair
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = 'Tem certeza que deseja sair? Suas alterações podem não estar salvas.';
    return 'Tem certeza que deseja sair? Suas alterações podem não estar salvas.';
});

// Alternância de tema claro/escuro
function setTheme(scheme) {
    document.documentElement.setAttribute('data-color-scheme', scheme);
    localStorage.setItem('color-scheme', scheme);
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
        icon.textContent = scheme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-color-scheme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tema salvo
    const saved = localStorage.getItem('color-scheme');
    if (saved) setTheme(saved);
    else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    // Bind botão
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.addEventListener('click', toggleTheme);
});