// Tormenta 20 Character Sheet Application
class TormentaCharacterSheet {
    constructor() {
        // Tente carregar do localStorage primeiro
        this.character = null;
        this.activeSheetId = null;
        this.skills = this.getDefaultSkills();
        this.isDirty = false; // Flag para alterações não exportadas
        this.lastExportedHash = null; // Para saber se exportou
        // Foto: variáveis de controle
        this.photoZoom = 1;
        this.photoOffsetX = 0;
        this.photoOffsetY = 0;
        this.isDraggingPhoto = false;
        this.dragStart = { x: 0, y: 0 };
        // Inicialização correta: só use default se não houver localStorage
        const loaded = this.loadFromLocalStorage();
        console.log('loadFromLocalStorage retornou:', loaded);
        if (!loaded) {
            this.character = this.getDefaultCharacter();
            console.log('Nenhum dado salvo, usando ficha padrão');
        } else {
            console.log('Ficha restaurada do localStorage:', this.character);
        }
        this.init();
    }

    // Initialize the application with performance optimizations
    async init() {
        // Use requestIdleCallback for non-critical initialization
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.initializeNonCriticalComponents());
        } else {
            setTimeout(() => this.initializeNonCriticalComponents(), 0);
        }
        
        // Initialize critical UI components first
        this.bindEvents();
        this.initSheetsDrawer();
        this.initCollapsibleSections();
        this.initSmoothScrolling();
        this.setupMobileNavigation();
        
        // Use IntersectionObserver for lazy loading non-visible components
        this.setupIntersectionObserver();
        
        // Initialize core functionality
        await Promise.all([
            this.renderSheetsList(),
            this.populateSkills(),
            this.updateAllCalculations()
        ]);
        
        // Initialize non-critical components
        this.initializeNonCriticalComponents();
        
        // Set initial states from localStorage
        this.restoreSectionStates();
        
        // Mark app as ready
        document.documentElement.classList.add('app-loaded');
        
        // Remove loading state
        setTimeout(() => {
            document.documentElement.classList.remove('app-loading');
            document.documentElement.classList.add('app-loaded');
        }, 100);
    }
    
    // Initialize non-critical components
    initializeNonCriticalComponents() {
        this.initSkillSearch();
        this.renderCustomResources();
        this.renderAbilities();
        this.renderItems();
        this.renderSpells();
        this.renderPowers();
        this.updatePhotoUI();
        this.migrateInventoryStructure();
    }
    
    // Setup IntersectionObserver for lazy loading
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        if (target.dataset.lazyLoad) {
                            this.lazyLoadContent(target);
                            observer.unobserve(target);
                        }
                    }
                });
            }, {
                rootMargin: '200px',
                threshold: 0.01
            });
            
            // Observe elements with data-lazy-load attribute
            document.querySelectorAll('[data-lazy-load]').forEach(el => {
                observer.observe(el);
            });
        }
    }
    
    // Lazy load content for a target element
    lazyLoadContent(target) {
        const component = target.dataset.lazyLoad;
        switch(component) {
            case 'spells':
                this.renderSpells();
                break;
            case 'inventory':
                this.renderItems();
                break;
            // Add more cases as needed
        }
    }
    
    // Initialize smooth scrolling for anchor links
    initSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    this.toggleMobileMenu(false);
                }
            });
        });
        
        // Add smooth scroll behavior to all scrollable containers
        const scrollableContainers = document.querySelectorAll('.scrollable');
        scrollableContainers.forEach(container => {
            container.style.scrollBehavior = 'smooth';
        });
    }
    
    // Setup mobile navigation
    setupMobileNavigation() {
        const menuButton = document.querySelector('.mobile-menu-button');
        if (!menuButton) return;
        
        menuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const isClickInside = menuButton.contains(e.target) || 
                                document.querySelector('.mobile-navigation').contains(e.target);
            
            if (!isClickInside && document.body.classList.contains('mobile-menu-open')) {
                this.toggleMobileMenu(false);
            }
        });
    }
    
    // Toggle mobile menu
    toggleMobileMenu(show = null) {
        const body = document.body;
        const shouldShow = show !== null ? show : !body.classList.contains('mobile-menu-open');
        
        if (shouldShow) {
            body.classList.add('mobile-menu-open');
            // Prevent background scrolling
            document.documentElement.style.overflow = 'hidden';
        } else {
            body.classList.remove('mobile-menu-open');
            // Re-enable background scrolling
            document.documentElement.style.overflow = '';
        }
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
                armas: [],
                armaduras: [],
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
            // A função foi esvaziada para não carregar mais a ficha de exemplo.
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
        if (document.getElementById('addWeaponBtn')) document.getElementById('addWeaponBtn').addEventListener('click', () => this.addWeapon());
        if (document.getElementById('addArmorBtn')) document.getElementById('addArmorBtn').addEventListener('click', () => this.addArmor());
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

        // Auto-retractable sidebar events
        const lockBtn = document.getElementById('lockSidebarBtn');
        const newBtn = document.getElementById('newSheetBtn');
        const drawer = document.getElementById('sheets-drawer');
        const container = document.getElementById('main-container');
        
        if (lockBtn) lockBtn.addEventListener('click', () => this.toggleSidebarLock());
        if (newBtn) newBtn.addEventListener('click', () => this.createNewSheet());
        
        // Auto-expand container when hovering sidebar
        if (drawer && container) {
            drawer.addEventListener('mouseenter', () => {
                if (!drawer.classList.contains('locked')) {
                    container.classList.add('sidebar-expanded');
                }
            });
            
            drawer.addEventListener('mouseleave', () => {
                if (!drawer.classList.contains('locked')) {
                    container.classList.remove('sidebar-expanded');
                }
            });
        }
    }

    // Update character field with validation
    updateCharacterField(field, value) {
        try {
            this.character[field] = value;
            this.validateField(field, value);
            this.markDirty();
            this.saveToLocalStorage();
            if (field === 'nome') this.syncActiveSheetMeta();
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
            this.markDirty();
            this.saveToLocalStorage();
            this.syncActiveSheetMeta();
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
            this.markDirty();
            this.saveToLocalStorage();
        } catch (error) {
            console.error('Erro ao atualizar classe:', error);
            this.showError('Erro ao atualizar classe');
        }
    }

    // Update attribute with modifier calculation
    updateAttribute(attribute, value) {
        try {
            value = Number.isFinite(value) ? value : 10;
            this.character.atributos[attribute] = value;
            
            const modifier = Math.floor((value - 10) / 2);
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            
            document.getElementById(`${attribute}-mod`).textContent = modifierText;
            
            this.updateAllCalculations();
            this.markDirty();
            this.saveToLocalStorage();
        } catch (error) {
            console.error(`Erro ao atualizar atributo ${attribute}:`, error);
            this.showError(`Erro ao atualizar ${attribute}`);
        }
    }

    // ----- Multi-sheet storage & drawer -----
    generateId() {
        return 't20_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
    }

    getSheets() {
        try {
            const raw = localStorage.getItem('t20_sheets');
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    }

    saveSheets(sheets) {
        try {
            localStorage.setItem('t20_sheets', JSON.stringify(sheets));
        } catch {}
    }

    setActiveSheet(id) {
        this.activeSheetId = id;
        localStorage.setItem('t20_active_sheet_id', id);
    }

    loadFromLocalStorage() {
        try {
            // Nova estrutura
            let sheets = this.getSheets();
            let activeId = localStorage.getItem('t20_active_sheet_id');
            // Migração do formato antigo se necessário
            if (sheets.length === 0) {
                const legacy = localStorage.getItem('t20_last_character');
                if (legacy) {
                    const legacyChar = JSON.parse(legacy);
                    const id = this.generateId();
                    const name = legacyChar?.nome || 'Nova Ficha';
                    const nivel = legacyChar?.nivel || 1;
                    sheets = [{ id, meta: { nome: name, nivel }, data: legacyChar }];
                    this.saveSheets(sheets);
                    this.setActiveSheet(id);
                    this.character = legacyChar;
                    this.lastExportedHash = localStorage.getItem('t20_last_exported_hash') || null;
                    return true;
                }
            }
            if (sheets.length > 0) {
                // Definir ficha ativa
                let sheet = null;
                if (activeId) sheet = sheets.find(s => s.id === activeId) || null;
                if (!sheet) sheet = sheets[0];
                this.setActiveSheet(sheet.id);
                this.character = sheet.data;
                this.lastExportedHash = localStorage.getItem('t20_last_exported_hash') || null;
                return true;
            }
        } catch (e) {
            console.error('Erro ao carregar do localStorage:', e);
        }
        return false;
    }

    saveToLocalStorage() {
        try {
            // Atualiza a ficha ativa dentro do array
            const sheets = this.getSheets();
            const id = this.activeSheetId || this.generateId();
            if (!this.activeSheetId) this.setActiveSheet(id);
            const idx = sheets.findIndex(s => s.id === id);
            const meta = { nome: this.character?.nome || 'Nova Ficha', nivel: this.getTotalLevel() || 1 };
            if (idx >= 0) {
                sheets[idx] = { id, meta, data: this.character };
            } else {
                sheets.push({ id, meta, data: this.character });
            }
            this.saveSheets(sheets);
            localStorage.setItem('t20_last_exported_hash', this.lastExportedHash || '');
        } catch {}
    }

    syncActiveSheetMeta() {
        const sheets = this.getSheets();
        const idx = sheets.findIndex(s => s.id === this.activeSheetId);
        if (idx >= 0) {
            sheets[idx].meta = { nome: this.character?.nome || 'Nova Ficha', nivel: this.getTotalLevel() || 1 };
            this.saveSheets(sheets);
            this.renderSheetsList();
        }
    }

    createNewSheet() {
        const id = this.generateId();
        const data = this.getDefaultCharacter();
        const sheets = this.getSheets();
        sheets.push({ id, meta: { nome: 'Nova Ficha', nivel: 1 }, data });
        this.saveSheets(sheets);
        this.setActiveSheet(id);
        this.character = data;
        this.updateUI();
        this.populateSkills();
        this.updateAllCalculations();
        this.renderCustomResources();
        this.renderAbilities();
        this.renderItems();
        this.renderSpells();
        this.renderPowers();
        this.renderSheetsList();
        this.closeSheetsDrawer();
    }

    duplicateSheet(id) {
        const sheets = this.getSheets();
        const sheet = sheets.find(s => s.id === id);
        if (!sheet) return;
        const newId = this.generateId();
        const clone = JSON.parse(JSON.stringify(sheet.data));
        const meta = { nome: (sheet.meta?.nome || 'Ficha') + ' (cópia)', nivel: sheet.meta?.nivel || 1 };
        sheets.push({ id: newId, meta, data: clone });
        this.saveSheets(sheets);
        this.renderSheetsList();
    }

    deleteSheet(id) {
        let sheets = this.getSheets();
        
        // Se for a última ficha, cria uma nova antes de apagar
        if (sheets.length === 1) {
            this.createNewSheet();
        }
        
        // Remove a ficha atual
        sheets = sheets.filter(s => s.id !== id);
        this.saveSheets(sheets);
        
        // Se a ficha ativa foi removida, muda para a primeira disponível
        if (this.activeSheetId === id) {
            if (sheets.length > 0) {
                const newActive = sheets[0];
                this.setActiveSheet(newActive.id);
                this.character = newActive.data;
            } else {
                // Se não há mais fichas, cria uma nova
                this.createNewSheet();
                return; // Não precisa continuar, pois createNewSheet já atualiza a UI
            }
            
            // Atualiza a UI
            this.updateUI();
            this.populateSkills();
            this.updateAllCalculations();
            this.renderCustomResources();
            this.renderAbilities();
            this.renderItems();
            this.renderSpells();
            this.renderPowers();
        }
        
        this.renderSheetsList();
    }

    switchToSheet(id) {
        const sheets = this.getSheets();
        const sheet = sheets.find(s => s.id === id);
        if (!sheet) return;
        this.setActiveSheet(id);
        this.character = sheet.data;
        this.updateUI();
        this.populateSkills();
        this.updateAllCalculations();
        this.renderCustomResources();
        this.renderAbilities();
        this.renderItems();
        this.renderSpells();
        this.renderPowers();
        this.closeSheetsDrawer();
    }

    renderSheetsList() {
        const list = document.getElementById('sheets-list');
        if (!list) return;
        const sheets = this.getSheets();
        list.innerHTML = '';
        sheets.forEach(s => {
            const li = document.createElement('li');
            li.className = 'sheets-list__item' + (s.id === this.activeSheetId ? ' active' : '');
            li.innerHTML = `
                <button class="sheets-list__select" data-id="${s.id}" title="Selecionar">
                    <span class="sheets-list__name">${(s.meta?.nome || 'Nova Ficha')}</span>
                    <span class="sheets-list__level">Nível ${(s.meta?.nivel || 1)}</span>
                </button>
                <div class="sheets-list__actions">
                    <button class="btn btn--sm btn--secondary" data-dup="${s.id}" title="Duplicar">⧉</button>
                    <button class="btn btn--sm btn--secondary" data-del="${s.id}" title="Excluir">🗑️</button>
                </div>
            `;
            list.appendChild(li);
        });
        list.onclick = (e) => {
            const t = e.target;
            const sel = t.closest('.sheets-list__select');
            const del = t.closest('[data-del]');
            const dup = t.closest('[data-dup]');
            if (sel) this.switchToSheet(sel.getAttribute('data-id'));
            if (del) {
                const id = del.getAttribute('data-del');
                if (confirm('Excluir esta ficha?')) this.deleteSheet(id);
            }
            if (dup) this.duplicateSheet(dup.getAttribute('data-dup'));
        };
    }

    initSheetsDrawer() {
        // Initialize sidebar lock state from localStorage
        const drawer = document.getElementById('sheets-drawer');
        const container = document.getElementById('main-container');
        const isLocked = localStorage.getItem('sidebar-locked') === 'true';
        
        if (isLocked && drawer && container) {
            drawer.classList.add('locked');
            container.classList.add('sidebar-expanded');
        }
    }
    
    toggleSidebarLock() {
        const drawer = document.getElementById('sheets-drawer');
        const container = document.getElementById('main-container');
        const lockBtn = document.getElementById('lockSidebarBtn');
        
        if (!drawer || !container) return;
        
        const isLocked = drawer.classList.toggle('locked');
        
        if (isLocked) {
            container.classList.add('sidebar-expanded');
            if (lockBtn) lockBtn.title = 'Desafixar barra';
        } else {
            container.classList.remove('sidebar-expanded');
            if (lockBtn) lockBtn.title = 'Manter aberto';
        }
        
        localStorage.setItem('sidebar-locked', isLocked.toString());
    }

    // Remove old drawer methods as we now use auto-retractable sidebar

    // Preenche os inputs com os dados atuais
    updateUI() {
        try {
            const c = this.character || this.getDefaultCharacter();
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
            setVal('nome', c.nome || '');
            setVal('nivel', c.nivel || 1);
            setVal('raca', c.raca || '');
            setVal('divindade', c.divindade || '');
            setVal('tendencia', c.tendencia || '');
            setVal('origem', c.origem || '');
            setVal('deslocamento', c.deslocamento || 9);
            // Atributos
            const attrs = c.atributos || {};
            setVal('forca', attrs.forca ?? 10);
            setVal('destreza', attrs.destreza ?? 10);
            setVal('constituicao', attrs.constituicao ?? 10);
            setVal('inteligencia', attrs.inteligencia ?? 10);
            setVal('sabedoria', attrs.sabedoria ?? 10);
            setVal('carisma', attrs.carisma ?? 10);
            // Recursos principais
            const rec = c.recursos || {};
            const setRec = (name, prop, val) => { const el = document.getElementById(`${name}-${prop}`); if (el) el.value = val; };
            ['vida','mana','prana'].forEach(r => {
                const obj = rec[r] || { atual:0, maximo:0, cor:'#000000' };
                setRec(r,'atual', obj.atual||0);
                setRec(r,'max', obj.maximo||0);
                const colorEl = document.getElementById(`${r}-color`);
                if (colorEl) colorEl.value = obj.cor || '#000000';
            });
            // Dinheiro
            const din = c.inventario?.dinheiro || {};
            const map = { 'T$':'ts', 'PP':'pp', 'PO':'po', 'PE':'pe', 'PC':'pc' };
            Object.entries(map).forEach(([k, id]) => {
                const el = document.getElementById(`money-${id}`);
                if (el) el.value = din[k] || 0;
            });
        } catch (e) {
            console.error('Erro ao atualizar UI:', e);
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

    // Toggle collapsible section
    toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Toggle the collapsed state
        const isCollapsing = !section.classList.contains('collapsed');
        
        // Update the class and icon
        if (isCollapsing) {
            section.classList.add('collapsed');
            const toggleIcon = section.querySelector('.section-toggle');
            if (toggleIcon) {
                toggleIcon.textContent = '▶';
            }
        } else {
            section.classList.remove('collapsed');
            const toggleIcon = section.querySelector('.section-toggle');
            if (toggleIcon) {
                toggleIcon.textContent = '▼';
            }
        }
        
        // Save section state to localStorage
        localStorage.setItem(`section_${sectionId}`, isCollapsing ? 'collapsed' : 'expanded');
    };

    // Initialize collapsible sections
    initCollapsibleSections() {
        // Add click handlers to all section headers
        document.querySelectorAll('.section').forEach(section => {
            // Make sure section is collapsible
            if (!section.classList.contains('collapsible')) {
                section.classList.add('collapsible');
            }
            
            // Get or create section ID
            let sectionId = section.id;
            if (!sectionId) {
                sectionId = `section-${Math.random().toString(36).substr(2, 9)}`;
                section.id = sectionId;
            }
            
            // Get or create header
            let header = section.querySelector('.card__header');
            if (!header) {
                header = document.createElement('div');
                header.className = 'card__header';
                const h2 = document.createElement('h2');
                h2.textContent = sectionId.replace(/-/g, ' ');
                header.appendChild(h2);
                section.insertBefore(header, section.firstChild);
            }
            
            // Add click handler
            header.onclick = (e) => {
                if (!e.target.closest('button, input, select, textarea, a, .no-toggle')) {
                    this.toggleSection(sectionId);
                }
            };
            
            // Add toggle icon if not present
            const h2 = header.querySelector('h2');
            if (h2 && !h2.querySelector('.section-toggle')) {
                const toggleIcon = document.createElement('span');
                toggleIcon.className = 'section-toggle';
                toggleIcon.textContent = '▼';
                h2.appendChild(document.createTextNode(' '));
                h2.appendChild(toggleIcon);
            }
        });
        
        // Add click handlers to quick navigation buttons
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = btn.dataset.section;
                const section = document.getElementById(sectionId);
                if (section) {
                    // Make sure section is visible
                    if (section.classList.contains('collapsed')) {
                        this.toggleSection(sectionId);
                    }
                    // Scroll to section
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Restore section states from localStorage
    restoreSectionStates() {
        document.querySelectorAll('.collapsible').forEach(section => {
            const sectionId = section.id;
            if (sectionId) {
                const savedState = localStorage.getItem(`section_${sectionId}`);
                if (savedState === 'collapsed') {
                    section.classList.add('collapsed');
                    const toggleIcon = section.querySelector('.section-toggle');
                    if (toggleIcon) {
                        toggleIcon.textContent = '▶';
                    }
                }
            }
        });
    }

    // Initialize skill search
    initSkillSearch() {
        const searchInput = document.getElementById('skillSearch');
        const searchResults = document.getElementById('skillSearchResults');
        const skillsContainer = document.getElementById('skills-container');
        
        if (!searchInput || !searchResults || !skillsContainer) return;
        
        // Store original skills HTML for reset
        let originalSkillsHTML = '';
        
        // Function to filter skills
        const filterSkills = (query) => {
            const skills = Array.from(skillsContainer.querySelectorAll('.skill-item'));
            
            if (query.length < 1) {
                // Show all skills if search is empty
                skills.forEach(skill => {
                    skill.style.display = '';
                });
                searchResults.classList.remove('visible');
                return;
            }
            
            const queryLower = query.toLowerCase();
            let hasMatches = false;
            
            skills.forEach(skill => {
                const skillName = skill.textContent.toLowerCase();
                if (skillName.includes(queryLower)) {
                    skill.style.display = '';
                    hasMatches = true;
                } else {
                    skill.style.display = 'none';
                }
            });
            
            // Show no results message if no matches
            if (!hasMatches) {
                searchResults.innerHTML = '<div class="search-result-item no-results">Nenhuma perícia encontrada</div>';
                searchResults.classList.add('visible');
            } else {
                searchResults.classList.remove('visible');
            }
        };
        
        // Debounce function
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };
        
        // Save original skills HTML after they're loaded
        const saveOriginalSkills = () => {
            if (skillsContainer.children.length > 0 && !originalSkillsHTML) {
                originalSkillsHTML = skillsContainer.innerHTML;
            }
        };
        
        // Initial save of original skills
        saveOriginalSkills();
        
        // Also save after a short delay to ensure skills are loaded
        setTimeout(saveOriginalSkills, 500);
        
        // Event listener for search input
        searchInput.addEventListener('input', debounce((e) => {
            filterSkills(e.target.value);
        }, 200));
        
        // Clear search when clicking the 'x' in the input (for browsers that support it)
        searchInput.addEventListener('search', (e) => {
            if (e.target.value === '') {
                filterSkills('');
            }
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('visible');
            }
        });
        
        // Handle escape key to clear search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                filterSkills('');
            }
        });
    };

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
            const halfLevel = Math.floor(this.getTotalLevel() / 2);
            
            const totalInitiative = desModifier + halfLevel;
            
            document.getElementById('iniciativa-total').textContent = totalInitiative >= 0 ? `+${totalInitiative}` : `${totalInitiative}`;
            document.getElementById('iniciativa-des').textContent = desModifier >= 0 ? `+${desModifier}` : `${desModifier}`;
            document.getElementById('iniciativa-treino').textContent = halfLevel >= 0 ? `+${halfLevel}` : `${halfLevel}`;
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
        bonus = (bonus === undefined || bonus === null) ? '' : bonus;
        desconto = (desconto === undefined || desconto === null) ? '' : desconto;
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
            this.saveToLocalStorage();
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
        this.saveToLocalStorage();
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
                        this.updateCustomProfessionTotal(idx);
                    });
                } else {
                    // Usar atributo personalizado se existir
                    const attr = this.character.pericias[skillName]?.atributo || skillData.atributo;
                    const attributeModifier = this.getAttributeModifier(attr);
                    const halfLevel = Math.floor(this.getTotalLevel() / 2);
                    const isTrainedInCharacter = this.character.pericias[skillName]?.treinada || false;
                    const trainingBonus = isTrainedInCharacter ? this.getTrainingBonus() : 0;
                    let bonusExtra = this.character.pericias[skillName]?.bonusExtra;
                    let desconto = this.character.pericias[skillName]?.desconto;
                    bonusExtra = (bonusExtra === '' || bonusExtra === undefined) ? 0 : Number(bonusExtra);
                    desconto = (desconto === '' || desconto === undefined) ? 0 : Number(desconto);
                    // Cálculo do zero, sem acumular e sem usar bonus anterior
                    const total = halfLevel + attributeModifier + trainingBonus + bonusExtra - desconto;
                    const totalElement = document.getElementById(`skill-total-${skillName}`);
                    if (totalElement) {
                        totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
                    }
                    if (!this.character.pericias[skillName]) {
                        this.character.pericias[skillName] = {};
                    }
                    // <<<< CORREÇÃO IMPORTANTE >>>>
                    // A linha que salvava o total no campo 'bonus' foi removida.
                    // this.character.pericias[skillName].bonus = total;
                    this.character.pericias[skillName].atributo = attr;
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
            this.markDirty();
            this.saveToLocalStorage();
        } catch (error) {
            console.error(`Erro ao atualizar recurso ${resource}:`, error);
        }
    }

    // Update resource color
    updateResourceColor(resource, color) {
        try {
            this.character.recursos[resource].cor = color;
            this.updateResourceBar(resource);
            this.markDirty();
            this.saveToLocalStorage();
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

    // Weapon management functions
    addWeapon() {
        if (!this.character.inventario.armas) {
            this.character.inventario.armas = [];
        }
        
        const weapon = {
            nome: '',
            categoria: 'simples',
            tipo: 'corpo-a-corpo',
            dano: '1d6',
            critico: '20/x2',
            alcance: '1,5m',
            peso: 1,
            preco: 0,
            propriedades: [],
            descricao: '',
            proficiencia: false,
            bonus_ataque: 0,
            bonus_dano: 0
        };
        
        this.character.inventario.armas.push(weapon);
        this.renderWeapons();
        this.markDirty();
        this.saveToLocalStorage();
    }

    removeWeapon(index) {
        if (confirm('Remover esta arma?')) {
            this.character.inventario.armas.splice(index, 1);
            this.renderWeapons();
            this.markDirty();
            this.saveToLocalStorage();
        }
    }

    updateWeapon(index, field, value) {
        if (this.character.inventario.armas[index]) {
            if (field === 'propriedades') {
                this.character.inventario.armas[index][field] = value.split(',').map(p => p.trim()).filter(p => p);
            } else if (field === 'proficiencia') {
                this.character.inventario.armas[index][field] = value;
            } else {
                this.character.inventario.armas[index][field] = value;
            }
            this.markDirty();
            this.saveToLocalStorage();
        }
    }

    renderWeapons() {
        const container = document.getElementById('weapons-container');
        if (!container) return;
        
        const weapons = this.character.inventario.armas || [];
        container.innerHTML = '';
        
        weapons.forEach((weapon, index) => {
            const weaponDiv = document.createElement('div');
            weaponDiv.className = 'weapon-item';
            weaponDiv.innerHTML = `
                <div class="weapon-header">
                    <input type="text" class="form-control weapon-name" placeholder="Nome da arma" value="${weapon.nome}" 
                           onchange="app.updateWeapon(${index}, 'nome', this.value)">
                    <button class="remove-weapon" onclick="app.removeWeapon(${index})">✕</button>
                </div>
                <div class="weapon-details">
                    <div class="weapon-row">
                        <div class="form-group">
                            <label class="form-label">Categoria</label>
                            <select class="form-control" onchange="app.updateWeapon(${index}, 'categoria', this.value)">
                                <option value="simples" ${weapon.categoria === 'simples' ? 'selected' : ''}>Simples</option>
                                <option value="marcial" ${weapon.categoria === 'marcial' ? 'selected' : ''}>Marcial</option>
                                <option value="exotica" ${weapon.categoria === 'exotica' ? 'selected' : ''}>Exótica</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo</label>
                            <select class="form-control" onchange="app.updateWeapon(${index}, 'tipo', this.value)">
                                <option value="corpo-a-corpo" ${weapon.tipo === 'corpo-a-corpo' ? 'selected' : ''}>Corpo a corpo</option>
                                <option value="distancia" ${weapon.tipo === 'distancia' ? 'selected' : ''}>À distância</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dano</label>
                            <input type="text" class="form-control" placeholder="1d6" value="${weapon.dano}" 
                                   onchange="app.updateWeapon(${index}, 'dano', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Crítico</label>
                            <input type="text" class="form-control" placeholder="20/x2" value="${weapon.critico}" 
                                   onchange="app.updateWeapon(${index}, 'critico', this.value)">
                        </div>
                    </div>
                    <div class="weapon-row">
                        <div class="form-group">
                            <label class="form-label">Alcance</label>
                            <input type="text" class="form-control" placeholder="1,5m" value="${weapon.alcance}" 
                                   onchange="app.updateWeapon(${index}, 'alcance', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Peso (kg)</label>
                            <input type="number" class="form-control" step="0.1" value="${weapon.peso}" 
                                   onchange="app.updateWeapon(${index}, 'peso', parseFloat(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Preço (TO)</label>
                            <input type="number" class="form-control" value="${weapon.preco}" 
                                   onchange="app.updateWeapon(${index}, 'preco', parseInt(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Bônus Ataque</label>
                            <input type="number" class="form-control" value="${weapon.bonus_ataque}" 
                                   onchange="app.updateWeapon(${index}, 'bonus_ataque', parseInt(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Bônus Dano</label>
                            <input type="number" class="form-control" value="${weapon.bonus_dano}" 
                                   onchange="app.updateWeapon(${index}, 'bonus_dano', parseInt(this.value) || 0)">
                        </div>
                    </div>
                    <div class="weapon-row">
                        <div class="form-group weapon-proficiency">
                            <label class="form-label">
                                <input type="checkbox" ${weapon.proficiencia ? 'checked' : ''} 
                                       onchange="app.updateWeapon(${index}, 'proficiencia', this.checked)">
                                Proficiente
                            </label>
                        </div>
                        <div class="form-group weapon-properties">
                            <label class="form-label">Propriedades</label>
                            <input type="text" class="form-control" placeholder="Ágil, Duas mãos, etc." 
                                   value="${weapon.propriedades.join(', ')}" 
                                   onchange="app.updateWeapon(${index}, 'propriedades', this.value)">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descrição</label>
                        <textarea class="form-control rich-text" rows="3" placeholder="Descrição da arma..." 
                                  onchange="app.updateWeapon(${index}, 'descricao', this.value)">${weapon.descricao}</textarea>
                    </div>
                </div>
            `;
            container.appendChild(weaponDiv);
        });
    }

    // Armor management functions
    addArmor() {
        if (!this.character.inventario.armaduras) {
            this.character.inventario.armaduras = [];
        }
        
        const armor = {
            nome: '',
            categoria: 'leve',
            ca: 0,
            max_des: null,
            penalidade: 0,
            peso: 1,
            preco: 0,
            propriedades: [],
            descricao: '',
            equipada: false
        };
        
        this.character.inventario.armaduras.push(armor);
        this.renderArmor();
        this.markDirty();
        this.saveToLocalStorage();
    }

    removeArmor(index) {
        if (confirm('Remover esta armadura?')) {
            this.character.inventario.armaduras.splice(index, 1);
            this.renderArmor();
            this.markDirty();
            this.saveToLocalStorage();
        }
    }

    updateArmor(index, field, value) {
        if (this.character.inventario.armaduras[index]) {
            if (field === 'propriedades') {
                this.character.inventario.armaduras[index][field] = value.split(',').map(p => p.trim()).filter(p => p);
            } else if (field === 'equipada') {
                this.character.inventario.armaduras[index][field] = value;
                this.updateDefense();
            } else {
                this.character.inventario.armaduras[index][field] = value;
            }
            this.markDirty();
            this.saveToLocalStorage();
        }
    }

    renderArmor() {
        const container = document.getElementById('armor-container');
        if (!container) return;
        
        const armors = this.character.inventario.armaduras || [];
        container.innerHTML = '';
        
        armors.forEach((armor, index) => {
            const armorDiv = document.createElement('div');
            armorDiv.className = 'armor-item';
            armorDiv.innerHTML = `
                <div class="armor-header">
                    <input type="text" class="form-control armor-name" placeholder="Nome da armadura" value="${armor.nome}" 
                           onchange="app.updateArmor(${index}, 'nome', this.value)">
                    <label class="armor-equipped">
                        <input type="checkbox" ${armor.equipada ? 'checked' : ''} 
                               onchange="app.updateArmor(${index}, 'equipada', this.checked)">
                        Equipada
                    </label>
                    <button class="remove-armor" onclick="app.removeArmor(${index})">✕</button>
                </div>
                <div class="armor-details">
                    <div class="armor-row">
                        <div class="form-group">
                            <label class="form-label">Categoria</label>
                            <select class="form-control" onchange="app.updateArmor(${index}, 'categoria', this.value)">
                                <option value="leve" ${armor.categoria === 'leve' ? 'selected' : ''}>Leve</option>
                                <option value="pesada" ${armor.categoria === 'pesada' ? 'selected' : ''}>Pesada</option>
                                <option value="escudo" ${armor.categoria === 'escudo' ? 'selected' : ''}>Escudo</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">CA</label>
                            <input type="number" class="form-control" value="${armor.ca}" 
                                   onchange="app.updateArmor(${index}, 'ca', parseInt(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Máx. Des</label>
                            <input type="number" class="form-control" placeholder="Sem limite" value="${armor.max_des || ''}" 
                                   onchange="app.updateArmor(${index}, 'max_des', this.value ? parseInt(this.value) : null)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Penalidade</label>
                            <input type="number" class="form-control" value="${armor.penalidade}" 
                                   onchange="app.updateArmor(${index}, 'penalidade', parseInt(this.value) || 0)">
                        </div>
                    </div>
                    <div class="armor-row">
                        <div class="form-group">
                            <label class="form-label">Peso (kg)</label>
                            <input type="number" class="form-control" step="0.1" value="${armor.peso}" 
                                   onchange="app.updateArmor(${index}, 'peso', parseFloat(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Preço (TO)</label>
                            <input type="number" class="form-control" value="${armor.preco}" 
                                   onchange="app.updateArmor(${index}, 'preco', parseInt(this.value) || 0)">
                        </div>
                        <div class="form-group armor-properties">
                            <label class="form-label">Propriedades</label>
                            <input type="text" class="form-control" placeholder="Resistente, Mágica, etc." 
                                   value="${armor.propriedades.join(', ')}" 
                                   onchange="app.updateArmor(${index}, 'propriedades', this.value)">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descrição</label>
                        <div id="desc-${index}-editor" class="rich-text-editor"></div>
                    </div>
                </div>
            `;
            container.appendChild(armorDiv);
        });
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
                this.markDirty();
                this.saveToLocalStorage();
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
                this.markDirty();
                this.saveToLocalStorage();
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
                this.markDirty();
                this.saveToLocalStorage();
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
                this.markDirty();
                this.saveToLocalStorage();
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
            this.markDirty();
            this.saveToLocalStorage();
        } catch (error) {
            console.error(`Erro ao atualizar dinheiro ${coinType}:`, error);
        }
    }

    // Add ability with rich text support
    addAbility() {
        try {
            if (!this.character.habilidades) {
                this.character.habilidades = [];
            }
            
            const ability = {
                nome: 'Nova Habilidade',
                descricao: ''
            };
            
            this.character.habilidades.push(ability);
            this.renderAbilities();
            
            // Scroll to the newly added ability
            const abilities = document.querySelectorAll('.ability-item');
            if (abilities.length > 0) {
                abilities[abilities.length - 1].scrollIntoView({ behavior: 'smooth' });
                
                // Focus on the name input
                const nameInput = abilities[abilities.length - 1].querySelector('.ability-name');
                if (nameInput) {
                    nameInput.focus();
                    nameInput.select();
                }
            }
            
            this.markDirty();
            this.saveToLocalStorage();
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

    // Create ability element with rich text support
    createAbilityElement(ability, index) {
        const abilityId = `ability-${index}`;
        const descId = `ability-desc-${index}`;
        
        const abilityDiv = document.createElement('div');
        abilityDiv.className = 'ability-item card mb-3';
        abilityDiv.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <input type="text" class="form-control ability-name me-2" 
                       value="${this.escapeHtml(ability.nome || '')}"
                       onchange="app.updateAbility(${index}, 'nome', this.value)" 
                       placeholder="Nome da Habilidade">
                <button class="btn btn-sm btn-danger ms-2" onclick="app.removeAbility(${index})" title="Remover habilidade">
                    <i class="fas fa-trash-alt me-1"></i> Remover
                </button>
            </div>
            <div class="card-body">
                <div id="${descId}" class="rich-text-editor">${ability.descricao || ''}</div>
            </div>
        `;
        
        // Initialize Quill editor for ability description
        setTimeout(() => {
            const descEditor = this.initQuillEditor(descId, ability.descricao || '');
            
            // Save content on change
            descEditor.on('text-change', () => {
                const content = descEditor.root.innerHTML;
                this.updateAbility(index, 'descricao', content);
            });
        }, 0);
        
        return abilityDiv;
    }

    // Update ability property with rich text support
    updateAbility(index, property, value) {
        try {
            if (this.character.habilidades && this.character.habilidades[index]) {
                this.character.habilidades[index][property] = value;
                this.markDirty();
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Erro ao atualizar habilidade:', error);
        }
    }

    // Remove ability
    removeAbility(index) {
        try {
            if (this.character.habilidades[index]) {
                this.character.habilidades.splice(index, 1);
                this.renderAbilities();
                this.markDirty();
                this.saveToLocalStorage();
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
            this.markDirty();
            this.saveToLocalStorage();
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

    // Helper function to safely escape HTML
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Helper function to unescape HTML
    unescapeHtml(safe) {
        if (!safe) return '';
        return safe
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
    }

    // Initialize Quill editor for rich text
    initQuillEditor(elementId, content = '') {
        const quill = new Quill(`#${elementId}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['clean'],
                    ['link', 'image']
                ]
            },
            placeholder: 'Digite a descrição aqui...',
            scrollingContainer: 'html',
            bounds: document.body
        });

        // Set initial content if provided
        if (content) {
            quill.root.innerHTML = content;
        }

        return quill;
    }

    // Save Quill content to character data
    saveQuillContent(quill, index, field) {
        const content = quill.root.innerHTML;
        this.updateItemProperty(index, field, content);
    }

    // Render items with rich text support
    renderItems() {
        const container = document.getElementById('items-container');
        container.innerHTML = '';
        
        if (this.character.inventario.itens && Array.isArray(this.character.inventario.itens)) {
            this.character.inventario.itens.forEach((item, index) => {
                const itemId = `item-${index}`;
                const descId = `desc-${index}`;
                const effectId = `effect-${index}`;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'item';
                itemElement.id = itemId;
                
                itemElement.innerHTML = `
                    <div class="item-header">
                        <input type="text" class="form-control item-name" value="${this.escapeHtml(item.nome || '')}" 
                               onchange="app.updateItemProperty(${index}, 'nome', this.value)" placeholder="Nome do Item">
                        <button class="btn btn--sm btn--danger" onclick="app.removeItem(${index})">Remover</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descrição</label>
                        <div id="${descId}-editor" class="rich-text-editor"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Efeito</label>
                        <div id="${effectId}-editor" class="rich-text-editor"></div>
                    </div>
                    <div class="item-details">
                        <div class="form-group">
                            <label class="form-label">Peso</label>
                            <input type="number" class="form-control item-weight" 
                                   value="${item.peso || ''}" step="0.1" min="0" 
                                   onchange="app.updateItemProperty(${index}, 'peso', parseFloat(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Preço (T$)</label>
                            <input type="number" class="form-control item-price" 
                                   value="${item.preco || ''}" min="0" 
                                   onchange="app.updateItemProperty(${index}, 'preco', parseInt(this.value) || 0)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Quantidade</label>
                            <input type="number" class="form-control item-quantity" 
                                   value="${item.quantidade || 1}" min="1" 
                                   onchange="app.updateItemProperty(${index}, 'quantidade', parseInt(this.value) || 1)">
                        </div>
                    </div>
                `;
                
                container.appendChild(itemElement);
                
                // Initialize Quill editors after the element is added to the DOM
                setTimeout(() => {
                    const descEditor = this.initQuillEditor(
                        `${descId}-editor`,
                        item.descricao || ''
                    );
                    
                    const effectEditor = this.initQuillEditor(
                        `${effectId}-editor`,
                        item.efeito || ''
                    );
                    
                    // Save content on change
                    descEditor.on('text-change', () => {
                        this.saveQuillContent(descEditor, index, 'descricao');
                    });
                    
                    effectEditor.on('text-change', () => {
                        this.saveQuillContent(effectEditor, index, 'efeito');
                    });
                }, 0);
            });
        }
    }

    // Update item property
    updateItemProperty(index, property, value) {
        try {
            if (this.character.inventario.itens[index]) {
                // Don't escape HTML for rich text fields, they're already properly handled by Quill
                if (property === 'descricao' || property === 'efeito') {
                    this.character.inventario.itens[index][property] = value;
                } else {
                    // For non-rich text fields, escape HTML
                    this.character.inventario.itens[index][property] = this.escapeHtml(value);
                }
                this.markDirty();
                this.saveToLocalStorage();
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
                this.markDirty();
                this.saveToLocalStorage();
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
            const tabElement = document.querySelector(`[data-tab="${tabName}"]`);
            if (tabElement) {
                tabElement.classList.add('active');
            }
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const tabContent = document.getElementById(`${tabName}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        } catch (error) {
            console.error('Erro ao alternar abas de magia:', error);
        }
    }

    // Adicionar magia: agora pede tipo e nível
    addSpell(type) {
        const level = prompt('Qual o nível da magia? (1-9)');
        if (!level || isNaN(level) || level < 1 || level > 9) {
            this.showError('Nível de magia inválido. Deve ser entre 1 e 9.');
            return;
        }
        
        const circleKey = `${level}º`;
        if (!this.character.magias[type][circleKey]) {
            this.character.magias[type][circleKey] = [];
        }
        
        const spell = {
            nome: 'Nova Magia',
            escola: '',
            execucao: '',
            alcance: '',
            alvos: '',
            duracao: '',
            resistencia: '',
            testes: '',
            descricao: '',
            efeitos: ''
        };
        
        this.character.magias[type][circleKey].push(spell);
        this.renderSpells();
        
        // Open the accordion for the newly added spell
        setTimeout(() => {
            // Find the newly added spell and open its accordion
            const spellItems = document.querySelectorAll('.spell-accordion-magic');
            if (spellItems.length > 0) {
                const newSpell = spellItems[spellItems.length - 1];
                const header = newSpell?.querySelector('.spell-accordion-magic-header');
                const content = newSpell?.querySelector('.spell-accordion-magic-content');
                
                if (header && content) {
                    header.classList.add('open');
                    content.classList.add('open');
                    
                    // Scroll to the new spell
                    newSpell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    
                    // Focus on the spell name input
                    const nameInput = newSpell.querySelector('.spell-name');
                    if (nameInput) {
                        nameInput.focus();
                        nameInput.select();
                    }
                }
            }
        }, 100);
        
        this.markDirty();
        this.saveToLocalStorage();
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

    // Create spell element with rich text support
    createSpellElement(spell, type, circle, index) {
        const spellId = `spell-${type}-${circle}-${index}`;
        const descId = `spell-desc-${type}-${circle}-${index}`;
        const efeitosId = `spell-efeitos-${type}-${circle}-${index}`;
        
        const spellDiv = document.createElement('div');
        spellDiv.className = 'spell-item card mb-3';
        spellDiv.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="d-flex flex-grow-1 me-2">
                    <input type="text" class="form-control spell-name me-2" 
                           value="${this.escapeHtml(spell.nome || '')}"
                           onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'nome', this.value)"
                           placeholder="Nome da Magia">
                    <button class="btn btn-sm btn-danger" onclick="app.removeSpell('${type}', '${circle}', ${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="row g-2 mb-3">
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Escola" 
                               value="${this.escapeHtml(spell.escola || '')}"
                               onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'escola', this.value)">
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Execução" 
                               value="${this.escapeHtml(spell.execucao || '')}"
                               onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'execucao', this.value)">
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Alcance" 
                               value="${this.escapeHtml(spell.alcance || '')}"
                               onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'alcance', this.value)">
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Alvos" 
                               value="${this.escapeHtml(spell.alvos || '')}"
                               onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'alvos', this.value)">
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Duração" 
                               value="${this.escapeHtml(spell.duracao || '')}"
                               onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'duracao', this.value)">
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Resistência" 
                               value="${this.escapeHtml(spell.resistencia || '')}"
                               onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'resistencia', this.value)">
                    </div>
                    <div class="col-12">
                        <input type="text" class="form-control" placeholder="Testes" 
                               value="${this.escapeHtml(spell.testes || '')}"
                               onchange="app.updateSpellProperty('${type}', '${circle}', ${index}, 'testes', this.value)">
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Descrição/Efeitos</label>
                    <div id="${descId}" class="rich-text-editor">${spell.descricao || ''}</div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Efeitos Adicionais</label>
                    <div id="${efeitosId}" class="rich-text-editor">${spell.efeitos || ''}</div>
                </div>
            </div>
        `;
        
        // Initialize Quill editors for description and effects
        setTimeout(() => {
            // Initialize description editor
            const descEditor = this.initQuillEditor(descId, spell.descricao || '');
            descEditor.on('text-change', () => {
                const content = descEditor.root.innerHTML;
                this.updateSpellProperty(type, circle, index, 'descricao', content);
            });
            
            // Initialize effects editor
            const efeitosEditor = this.initQuillEditor(efeitosId, spell.efeitos || '');
            efeitosEditor.on('text-change', () => {
                const content = efeitosEditor.root.innerHTML;
                this.updateSpellProperty(type, circle, index, 'efeitos', content);
            });
        }, 0);
        
        return spellDiv;
    }

    // Update spell property with rich text support
    updateSpellProperty(type, circle, index, property, value) {
        try {
            const circleKey = `${circle}º`;
            if (this.character.magias[type][circleKey] && this.character.magias[type][circleKey][index]) {
                this.character.magias[type][circleKey][index][property] = value;
                this.markDirty();
                this.saveToLocalStorage();
                
                // Update the spell name in the accordion header if it's the name that changed
                if (property === 'nome') {
                    const accordionHeaders = document.querySelectorAll(`.spell-accordion-magic-header`);
                    accordionHeaders.forEach(header => {
                        const spellIndex = header.closest('.spell-accordion-magic')?.querySelector('.spell-name');
                        if (spellIndex && spellIndex.value === value) {
                            const arrow = header.querySelector('.spell-accordion-magic-arrow');
                            if (arrow) {
                                header.innerHTML = `${arrow.outerHTML} ${this.escapeHtml(value)}`;
                            } else {
                                header.innerHTML = `&#9654; ${this.escapeHtml(value)}`;
                            }
                        }
                    });
                }
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
                this.markDirty();
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
        this.markDirty();
        this.saveToLocalStorage();
    }
    updatePowerName(idx, value) {
        if (this.character.poderes[idx]) {
            this.character.poderes[idx].nome = value;
            this.markDirty();
            this.saveToLocalStorage();
        }
    }
    updatePowerType(idx, value) {
        if (this.character.poderes[idx]) {
            this.character.poderes[idx].tipo = value;
            this.markDirty();
            this.saveToLocalStorage();
        }
    }
    updatePowerDescription(idx, value) {
        if (this.character.poderes[idx]) {
            this.character.poderes[idx].descricao = value;
            this.markDirty();
            this.saveToLocalStorage();
        }
    }
    removePower(idx) {
        if (this.character.poderes[idx]) {
            this.character.poderes.splice(idx, 1);
            this.renderPowers();
            this.markDirty();
            this.saveToLocalStorage();
        }
    }
    // Update power property with rich text support
    updatePower(index, property, value) {
        try {
            if (this.character.poderes && this.character.poderes[index]) {
                this.character.poderes[index][property] = value;
                this.markDirty();
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Erro ao atualizar poder:', error);
        }
    }

    // Update power property with rich text support
    updatePower(index, property, value) {
        try {
            if (this.character.poderes && this.character.poderes[index]) {
                this.character.poderes[index][property] = value;
                this.markDirty();
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Erro ao atualizar poder:', error);
        }
    }

    renderPowers() {
        const container = document.getElementById('powers-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.character.poderes || this.character.poderes.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum poder adicionado ainda.</p>';
            return;
        }
        
        this.character.poderes.forEach((power, index) => {
            const powerId = `power-${index}`;
            const descId = `power-desc-${index}`;
            
            const powerDiv = document.createElement('div');
            powerDiv.className = 'power-item card mb-3';
            powerDiv.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <input type="text" class="form-control power-name me-2" 
                           value="${this.escapeHtml(power.nome || '')}" 
                           onchange="app.updatePower(${index}, 'nome', this.value)" 
                           placeholder="Nome do Poder">
                    <select class="form-select power-type me-2" 
                            onchange="app.updatePower(${index}, 'tipo', this.value)">
                        <option value="Classe" ${power.tipo === 'Classe' ? 'selected' : ''}>Classe</option>
                        <option value="Origem" ${power.tipo === 'Origem' ? 'selected' : ''}>Origem</option>
                        <option value="Tormenta" ${power.tipo === 'Tormenta' ? 'selected' : ''}>Tormenta</option>
                        <option value="Outro" ${power.tipo === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>
                    <button class="btn btn-sm btn-danger ms-2" onclick="app.removePower(${index})" title="Remover poder">
                        <i class="fas fa-trash-alt me-1"></i> Remover
                    </button>
                </div>
                <div class="card-body">
                    <div id="${descId}" class="rich-text-editor">${power.descricao || ''}</div>
                </div>
            `;
            
            container.appendChild(powerDiv);
            
            // Initialize Quill editor for power description
            setTimeout(() => {
                const descEditor = this.initQuillEditor(descId, power.descricao || '');
                
                // Save content on change
                descEditor.on('text-change', () => {
                    const content = descEditor.root.innerHTML;
                    this.updatePower(index, 'descricao', content);
                });
            }, 0);
        });
    }

    // Trigger file import
    triggerImport() {
        document.getElementById('fileInput').click();
    }

    // Handle file import
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('Starting file import for:', file.name, 'Size:', file.size, 'bytes');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                console.log('File read successfully, parsing JSON...');
                const data = JSON.parse(e.target.result);
                console.log('JSON parsed successfully:', data);
                
                // Check if the file is too large (over 1MB of base64 data)
                const jsonString = JSON.stringify(data);
                if (jsonString.length > 1024 * 1024) {
                    console.warn('Large file detected, may cause performance issues');
                    // Remove photo data if it's too large to prevent memory issues
                    if (data.character && data.character.foto) {
                        console.log('Removing large photo data to prevent memory issues');
                        delete data.character.foto;
                    }
                }
                
                this.importAsNewSheet(data);
                this.showSuccess('Personagem importado como nova ficha!');
                // Limpar input de arquivo
                event.target.value = '';
            } catch (error) {
                console.error('Erro ao importar:', error);
                console.error('Error details:', error.message, error.stack);
                this.showError('Erro ao importar arquivo JSON: ' + error.message);
                event.target.value = '';
            }
        };
        
        reader.onerror = (error) => {
            console.error('File read error:', error);
            this.showError('Erro ao ler o arquivo.');
        };
        
        reader.readAsText(file);
    }

    // Import data as a new sheet instead of overwriting current one
    importAsNewSheet(data) {
        try {
            // Validate structure
            if (!data || typeof data !== 'object') {
                throw new Error('Formato de dados inválido');
            }

            const characterData = data.character || data;
            console.log('Importing character data:', characterData);
            
            // Create a clean default character as base
            const tempCharacter = this.getDefaultCharacter();
            
            // Process the imported data with better error handling
            const processedCharacter = this.processImportedCharacter(tempCharacter, characterData);
            
            // Validate the processed character has required fields
            if (!processedCharacter.nome) {
                console.warn('Character has no name, using default');
                processedCharacter.nome = 'Ficha Importada';
            }
            
            // Calculate total level for the imported character
            const totalLevel = (processedCharacter.classes || []).reduce((acc, c) => acc + (parseInt(c.nivel) || 0), 0) || processedCharacter.nivel || 1;
            console.log('Calculated total level:', totalLevel);
            
            // Create new sheet with imported data
            const newId = this.generateId();
            const sheets = this.getSheets();
            const meta = { 
                nome: processedCharacter.nome, 
                nivel: totalLevel
            };
            
            console.log('Creating new sheet with meta:', meta);
            console.log('Processed character data:', processedCharacter);
            
            // Add new sheet to the list
            sheets.push({ id: newId, meta, data: processedCharacter });
            this.saveSheets(sheets);
            
            // Verify the sheet was saved
            const savedSheets = this.getSheets();
            console.log('Sheets after save:', savedSheets);
            
            // Switch to the new imported sheet
            this.setActiveSheet(newId);
            this.character = processedCharacter;
            
            // Update UI for the new sheet
            this.updateUI();
            this.populateSkills();
            this.updateAllCalculations();
            this.renderCustomResources();
            this.renderAbilities();
            this.renderItems();
            this.renderSpells();
            this.renderPowers();
            this.renderSheetsList();
            
        } catch (error) {
            console.error('Erro na importação:', error);
            this.showError('Erro ao processar dados importados: ' + error.message);
        }
    }

    // Process imported character data with better validation
    processImportedCharacter(defaultCharacter, importedData) {
        const result = JSON.parse(JSON.stringify(defaultCharacter)); // Deep clone
        
        // Basic fields
        if (importedData.nome) result.nome = String(importedData.nome);
        if (importedData.nivel) result.nivel = parseInt(importedData.nivel) || 1;
        if (importedData.raca) result.raca = String(importedData.raca);
        if (importedData.divindade) result.divindade = String(importedData.divindade);
        if (importedData.tendencia) result.tendencia = String(importedData.tendencia);
        if (importedData.origem) result.origem = String(importedData.origem);
        if (importedData.deslocamento) result.deslocamento = parseInt(importedData.deslocamento) || 9;
        if (importedData.defesa) result.defesa = parseInt(importedData.defesa) || 10;
        
        // Classes array
        if (Array.isArray(importedData.classes)) {
            result.classes = importedData.classes.map(c => ({
                nome: String(c.nome || ''),
                nivel: parseInt(c.nivel) || 1
            }));
        }
        
        // Attributes
        if (importedData.atributos && typeof importedData.atributos === 'object') {
            Object.keys(result.atributos).forEach(attr => {
                if (importedData.atributos[attr] !== undefined) {
                    result.atributos[attr] = parseInt(importedData.atributos[attr]) || 10;
                }
            });
        }
        
        // Resources
        if (importedData.recursos && typeof importedData.recursos === 'object') {
            ['vida', 'mana', 'prana'].forEach(res => {
                if (importedData.recursos[res]) {
                    result.recursos[res] = {
                        atual: parseInt(importedData.recursos[res].atual) || 0,
                        maximo: parseInt(importedData.recursos[res].maximo) || 0,
                        cor: importedData.recursos[res].cor || result.recursos[res].cor
                    };
                }
            });
            
            if (Array.isArray(importedData.recursos.recursos_extras)) {
                result.recursos.recursos_extras = importedData.recursos.recursos_extras;
            }
        }
        
        // Skills/Pericias
        if (importedData.pericias && typeof importedData.pericias === 'object') {
            result.pericias = { ...importedData.pericias };
        }
        
        // Inventory
        if (importedData.inventario && typeof importedData.inventario === 'object') {
            if (Array.isArray(importedData.inventario.itens)) {
                result.inventario.itens = importedData.inventario.itens;
            }
            if (importedData.inventario.dinheiro && typeof importedData.inventario.dinheiro === 'object') {
                result.inventario.dinheiro = { ...result.inventario.dinheiro, ...importedData.inventario.dinheiro };
            }
        }
        
        // Spells/Magias
        if (importedData.magias && typeof importedData.magias === 'object') {
            result.magias = { ...result.magias, ...importedData.magias };
        }
        
        // Abilities/Habilidades
        if (Array.isArray(importedData.habilidades)) {
            result.habilidades = importedData.habilidades;
        }
        
        // Powers/Poderes
        if (Array.isArray(importedData.poderes)) {
            result.poderes = importedData.poderes;
        }
        
        // Photo/Foto
        if (importedData.foto) {
            result.foto = importedData.foto;
        }
        
        return result;
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
                    if (!(skillName in newSkills)) {
                        const found = Object.keys(newSkills).find(k => k.toLowerCase() === skillName.toLowerCase());
                        if (found) skillName = found;
                    }
                    if (!(skillName in newSkills)) return; // Ignorar perícias não reconhecidas
                    
                    if (!characterData.pericias[skillName]) characterData.pericias[skillName] = {};
                    
                    // Mapear campos antigos
                    if (typeof oldData === 'object') {
                        characterData.pericias[skillName].treinada = oldData.treinada || false;
                        characterData.pericias[skillName].atributo = oldData.atributo || newSkills[skillName].atributo;
                        
                        // <<<< CORREÇÃO IMPORTANTE >>>>
                        // Prioriza o campo correto 'bonusExtra'.
                        // Usa o campo legado 'bonus' apenas como fallback para fichas antigas.
                        if (typeof oldData.bonusExtra !== 'undefined' && oldData.bonusExtra !== null) {
                            characterData.pericias[skillName].bonusExtra = oldData.bonusExtra;
                        } else if (typeof oldData.bonus !== 'undefined' && oldData.bonus !== null) {
                            characterData.pericias[skillName].bonusExtra = oldData.bonus; // Fallback
                        } else {
                            characterData.pericias[skillName].bonusExtra = '';
                        }

                        characterData.pericias[skillName].desconto = (typeof oldData.penalidade !== 'undefined' && oldData.penalidade !== null)
                            ? Number(oldData.penalidade)
                            : (oldData.desconto || '');
                        
                        // Apaga o campo 'bonus' legado para evitar problemas futuros.
                        delete characterData.pericias[skillName].bonus;
                    }
                });
                
                // Garantir que todas as perícias existam no objeto final
                Object.keys(newSkills).forEach(skillName => {
                    if (!characterData.pericias[skillName]) {
                        characterData.pericias[skillName] = { ...newSkills[skillName] };
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
            
            // Ensure all required arrays exist
            if (!this.character.inventario) this.character.inventario = { armas: [], armaduras: [], itens: [], dinheiro: { 'T$': 0, 'PP': 0, 'PO': 0, 'PE': 0, 'PC': 0 } };
            if (!this.character.inventario.armas) this.character.inventario.armas = [];
            if (!this.character.inventario.armaduras) this.character.inventario.armaduras = [];
            if (!this.character.inventario.itens) this.character.inventario.itens = [];
            if (!this.character.inventario.dinheiro) this.character.inventario.dinheiro = { 'T$': 0, 'PP': 0, 'PO': 0, 'PE': 0, 'PC': 0 };
            if (!this.character.habilidades) this.character.habilidades = [];
            if (!this.character.poderes) this.character.poderes = [];
            
            // Migrate old inventory structure to new format
            this.migrateInventoryStructure();

            // Update UI
            this.updateUI();
            this.updateAllCalculations();
            
            // Garantir que os campos de perícia estejam sincronizados
            this.populateSkills();
            this.updateSkills();
            
            // Re-render dynamic content
            this.renderCustomResources();
            this.renderAbilities();
            this.renderWeapons();
            this.renderArmor();
            this.renderItems();
            this.renderSpells();
            this.renderPowers();
            
            this.isDirty = false;
            this.lastExportedHash = this.getCharacterHash();
            this.saveToLocalStorage();
            
            // Foto: garantir estrutura e compatibilidade
            if (characterData.foto) {
                if (typeof characterData.foto === 'string' && characterData.foto.length > 10) {
                    // Compatibilidade antiga: só base64
                    this.character.foto = {
                        src: characterData.foto,
                        srcOriginal: characterData.foto,
                        zoom: 1,
                        offsetX: 0,
                        offsetY: 0
                    };
                } else if (typeof characterData.foto === 'object' && (characterData.foto.srcOriginal || characterData.foto.src)) {
                    this.character.foto = {
                        src: characterData.foto.src || characterData.foto.srcOriginal,
                        srcOriginal: characterData.foto.srcOriginal || characterData.foto.src,
                        zoom: (typeof characterData.foto.zoom === 'number') ? characterData.foto.zoom : 1,
                        offsetX: (typeof characterData.foto.offsetX === 'number') ? characterData.foto.offsetX : 0,
                        offsetY: (typeof characterData.foto.offsetY === 'number') ? characterData.foto.offsetY : 0
                    };
                } else {
                    this.character.foto = null;
                }
                if (this.character.foto) {
                    this.photoZoom = this.character.foto.zoom;
                    this.photoOffsetX = this.character.foto.offsetX;
                    this.photoOffsetY = this.character.foto.offsetY;
                } else {
                    this.photoZoom = 1;
                    this.photoOffsetX = 0;
                    this.photoOffsetY = 0;
                }
            } else {
                this.character.foto = null;
                this.photoZoom = 1;
                this.photoOffsetX = 0;
                this.photoOffsetY = 0;
            }
            // Atualizar foto
            this.updatePhotoUI();
            
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

            // Foto do personagem
            this.updatePhotoUI();
        } catch (error) {
            console.error('Erro ao atualizar UI:', error);
            this.showError('Erro ao atualizar interface');
        }
    }

    // Migrate old inventory structure to new format
    migrateInventoryStructure() {
        if (!this.character.inventario) {
            this.character.inventario = {
                armas: [],
                armaduras: [],
                itens: [],
                dinheiro: this.character.inventario?.dinheiro || { 'T$': 0, 'PP': 0, 'PO': 0, 'PE': 0, 'PC': 0 }
            };
            return;
        }
        
        // Initialize inventory arrays if they don't exist
        if (!this.character.inventario.armas) this.character.inventario.armas = [];
        if (!this.character.inventario.armaduras) this.character.inventario.armaduras = [];
        if (!this.character.inventario.itens) this.character.inventario.itens = [];
        if (!this.character.inventario.dinheiro) this.character.inventario.dinheiro = { 'T$': 0, 'PP': 0, 'PO': 0, 'PE': 0, 'PC': 0 };
        
        // If old structure exists with mixed items, separate them
        if (Array.isArray(this.character.inventario.itens) && this.character.inventario.itens.length > 0) {
            const weapons = [];
            const armors = [];
            const items = [];
            
            // Common weapon keywords for better detection
            const weaponKeywords = [
                'espada', 'adaga', 'arco', 'machado', 'lança', 'lanç', 'machad', 'machado',
                'cajado', 'cimitarra', 'clava', 'chicote', 'dardo', 'faca', 'foice',
                'lanca', 'machadinha', 'mangual', 'martelo', 'maça', 'montante', 'pique',
                'punhal', 'rapieira', 'sabre', 'tridente', 'azagaia', 'bordão', 'estilete',
                'gladio', 'katana', 'kukri', 'lamin', 'machad', 'machadin', 'machadinha',
                'machado', 'mangual', 'martel', 'picareta', 'sabre', 'soco', 'soco-inglês',
                'tacape', 'taco', 'tacape', 'tacape', 'tridente', 'vara', 'vara'
            ];
            
            // Common armor keywords for better detection
            const armorKeywords = [
                'armadura', 'couro', 'cota', 'escudo', 'peitoral', 'placa', 'brunea',
                'couraça', 'elmo', 'manoplas', 'botas', 'grevas', 'braçadeiras', 'peitoral',
                'gibão', 'túnica', 'capa', 'manto', 'colete', 'cinturão', 'cinto', 'mochila',
                'coldre', 'capa', 'manto', 'túnica', 'veste', 'vestimenta', 'armadura'
            ];
            
            this.character.inventario.itens.forEach(item => {
                if (!item || typeof item !== 'object') return;
                
                const itemName = (item.nome || '').toLowerCase();
                const itemType = (item.tipo || '').toLowerCase();
                
                // Check if item is a weapon
                const isWeapon = itemType === 'arma' || 
                               item.dano || 
                               item.critico || 
                               item.categoria === 'simples' || 
                               item.categoria === 'marcial' || 
                               item.categoria === 'exotica' ||
                               weaponKeywords.some(keyword => itemName.includes(keyword));
                
                // Check if item is armor
                const isArmor = itemType === 'armadura' || 
                              item.defesa !== undefined || 
                              item.ca !== undefined || 
                              item.max_des !== undefined || 
                              item.categoria === 'leve' || 
                              item.categoria === 'pesada' || 
                              item.categoria === 'escudo' ||
                              armorKeywords.some(keyword => itemName.includes(keyword));
                
                // If both flags are true, use the more specific one based on properties
                if (isWeapon && isArmor) {
                    // If it has damage or critical, it's more likely a weapon
                    if (item.dano || item.critico) {
                        isArmor = false;
                    } 
                    // If it has defense/CA, it's more likely armor
                    else if (item.defesa !== undefined || item.ca !== undefined) {
                        isWeapon = false;
                    }
                    // If still both, check name keywords
                    else if (weaponKeywords.some(kw => itemName.includes(kw)) && 
                            !armorKeywords.some(kw => itemName.includes(kw))) {
                        isArmor = false;
                    } else {
                        isWeapon = false;
                    }
                }
                
                // Process as weapon
                if (isWeapon) {
                    // Parse critical from name if it contains critical info
                    let critico = '20/x2';
                    if (item.critico) {
                        critico = String(item.critico).replace(/\s+/g, '').toLowerCase();
                    } else {
                        const criticoMatch = itemName.match(/(\d{1,2})\s*[x/]\s*(x?\d+)/i);
                        if (criticoMatch) {
                            critico = `${criticoMatch[1]}/${criticoMatch[2].startsWith('x') ? criticoMatch[2] : 'x' + criticoMatch[2]}`;
                        }
                    }
                    
                    // Determine weapon category based on name and properties
                    let categoria = item.categoria || 'simples';
                    if (!['simples', 'marcial', 'exotica'].includes(categoria)) {
                        if (itemName.includes('adaga') || itemName.includes('punhal') || 
                            itemName.includes('cajado') || itemName.includes('bordão')) {
                            categoria = 'simples';
                        } else if (itemName.includes('espada') || itemName.includes('machado') || 
                                 itemName.includes('arco') || itemName.includes('lança')) {
                            categoria = 'marcial';
                        } else if (itemName.includes('exotica') || itemName.includes('rara')) {
                            categoria = 'exotica';
                        }
                    }
                    
                    // Determine weapon type (melee or ranged)
                    const tipo = item.alcance && item.alcance > '5' ? 'distancia' : 'corpo-a-corpo';
                    
                    // Create weapon object with all properties
                    const weapon = {
                        nome: String(item.nome || 'Arma sem nome').trim(),
                        categoria: categoria,
                        tipo: tipo,
                        dano: String(item.dano || '1d6').trim(),
                        critico: critico,
                        alcance: String(item.alcance || (tipo === 'distancia' ? '9m' : '1,5m')).trim(),
                        peso: Number(item.peso) || 1,
                        preco: Number(item.preco) || 0,
                        propriedades: Array.isArray(item.propriedades) ? item.propriedades : [],
                        descricao: String(item.efeito || item.descricao || '').trim(),
                        proficiencia: Boolean(item.proficiencia),
                        bonus_ataque: Number(item.bonus_ataque) || 0,
                        bonus_dano: Number(item.bonus_dano) || 0
                    };
                    
                    // Copy any additional properties
                    Object.keys(item).forEach(key => {
                        if (!(key in weapon)) {
                            weapon[key] = item[key];
                        }
                    });
                    
                    weapons.push(weapon);
                }
                // Process as armor
                else if (isArmor) {
                    // Parse CA/defense value
                    let ca = 0;
                    if (item.defesa) {
                        // Try to parse number from defesa field (can be string like "+2" or just "2")
                        const caMatch = String(item.defesa).match(/[+-]?\d+/);
                        if (caMatch) ca = parseInt(caMatch[0], 10);
                    } else if (item.ca !== undefined) {
                        ca = Number(item.ca) || 0;
                    }
                    
                    // Determine armor category
                    let categoria = item.categoria || 'leve';
                    if (!['leve', 'pesada', 'escudo'].includes(categoria)) {
                        if (itemName.includes('escudo')) {
                            categoria = 'escudo';
                        } else if (itemName.includes('couro') || itemName.includes('gibão') || itemName.includes('túnica')) {
                            categoria = 'leve';
                        } else if (itemName.includes('cota') || itemName.includes('placa') || itemName.includes('peitoral')) {
                            categoria = 'pesada';
                        }
                    }
                    
                    // Create armor object with all properties
                    const armor = {
                        nome: String(item.nome || 'Armadura sem nome').trim(),
                        categoria: categoria,
                        ca: ca,
                        max_des: item.max_des !== undefined ? (Number(item.max_des) || 0) : null,
                        penalidade: Number(item.penalidade) || 0,
                        peso: Number(item.peso) || 1,
                        preco: Number(item.preco) || 0,
                        propriedades: Array.isArray(item.propriedades) ? item.propriedades : [],
                        descricao: String(item.efeito || item.descricao || '').trim(),
                        equipada: Boolean(item.equipada)
                    };
                    
                    // Copy any additional properties
                    Object.keys(item).forEach(key => {
                        if (!(key in armor)) {
                            armor[key] = item[key];
                        }
                    });
                    
                    armors.push(armor);
                }
                // Regular item
                else {
                    // Ensure required fields exist
                    const newItem = {
                        nome: String(item.nome || 'Item sem nome').trim(),
                        quantidade: Number(item.quantidade) || 1,
                        peso: Number(item.peso) || 0,
                        preco: Number(item.preco) || 0,
                        descricao: String(item.descricao || item.efeito || '').trim(),
                        tipo: String(item.tipo || 'geral').toLowerCase(),
                        equipado: Boolean(item.equipado)
                    };
                    
                    // Copy any additional properties
                    Object.keys(item).forEach(key => {
                        if (!(key in newItem)) {
                            newItem[key] = item[key];
                        }
                    });
                    
                    items.push(newItem);
                }
            });
            
            // Update inventory structure
            if (weapons.length > 0) {
                this.character.inventario.armas = [...this.character.inventario.armas, ...weapons];
            }
                this.character.inventario.armaduras = [...this.character.inventario.armaduras, ...armors];
                this.character.inventario.itens = items;
                
                console.log(`Migrated ${weapons.length} weapons and ${armors.length} armors from old inventory format`);
            }
        }

    // Export character
    exportCharacter() {
        try {
            // Foto: garantir que srcOriginal seja exportado
            let fotoExport = null;
            if (this.character.foto && (this.character.foto.srcOriginal || this.character.foto.src)) {
                fotoExport = {
                    src: this.character.foto.src || this.character.foto.srcOriginal,
                    srcOriginal: this.character.foto.srcOriginal || this.character.foto.src,
                    zoom: (typeof this.character.foto.zoom === 'number') ? this.character.foto.zoom : 1,
                    offsetX: (typeof this.character.foto.offsetX === 'number') ? this.character.foto.offsetX : 0,
                    offsetY: (typeof this.character.foto.offsetY === 'number') ? this.character.foto.offsetY : 0
                };
            }
            const exportData = {
                character: {
                    ...this.character,
                    foto: fotoExport
                },
                validation_notes: "Exported from Tormenta 20 Character Sheet"
            };
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${this.character.nome || 'personagem'}_tormenta20.json`;
            link.click();
            this.showSuccess('Personagem exportado com sucesso!');
            this.markClean();
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
            this.character.foto = {
                src: e.target.result,
                srcOriginal: e.target.result,
                zoom: 1,
                offsetX: 0,
                offsetY: 0
            };
            this.updatePhotoUI();
            this.markDirty();
            this.saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    }

    updatePhotoUI() {
        const photo = document.getElementById('character-photo');
        if (photo) {
            photo.style.objectFit = 'contain';
        }
        if (this.character.foto && (this.character.foto.srcOriginal || this.character.foto.src)) {
            const src = this.character.foto.srcOriginal || this.character.foto.src;
            photo.src = src;
            photo.style.display = 'block';
            const zoom = (typeof this.character.foto.zoom === 'number') ? this.character.foto.zoom : 1;
            const x = (typeof this.character.foto.offsetX === 'number') ? this.character.foto.offsetX : 0;
            const y = (typeof this.character.foto.offsetY === 'number') ? this.character.foto.offsetY : 0;
            // Centralizar e mostrar a imagem inteira por padrão
            if (zoom === 1 && x === 0 && y === 0) {
                photo.style.transform = 'none';
            } else {
                // Aplicar translate e scale apenas se houver ajuste
                const circle = document.getElementById('character-photo-circle');
                if (circle && photo.complete) {
                    const circleRect = circle.getBoundingClientRect();
                    const imgRect = photo.getBoundingClientRect();
                    const extraW = Math.max(0, imgRect.width - circleRect.width);
                    const extraH = Math.max(0, imgRect.height - circleRect.height);
                    const tx = x * extraW;
                    const ty = y * extraH;
                    photo.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
                } else {
                    photo.style.transform = `translate(${x * 100}%, ${y * 100}%) scale(${zoom})`;
                }
            }
        } else {
            photo.src = '';
            photo.style.display = 'none';
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
        this.markDirty();
        this.saveToLocalStorage();
    }
    updateClassName(idx, value) {
        if (this.character.classes[idx]) {
            this.character.classes[idx].nome = value;
            this.markDirty();
            this.saveToLocalStorage();
        }
    }
    updateClassLevel(idx, value) {
        if (this.character.classes[idx]) {
            this.character.classes[idx].nivel = value;
            this.updateAllCalculations();
            this.markDirty();
            this.saveToLocalStorage();
            this.syncActiveSheetMeta();
        }
    }
    removeClass(idx) {
        if (this.character.classes[idx]) {
            this.character.classes.splice(idx, 1);
            this.updateUI();
            this.updateAllCalculations();
            this.markDirty();
            this.saveToLocalStorage();
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
        this.saveToLocalStorage();
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
        this.saveToLocalStorage();
    }

    // --- Dirty State e Persistência ---
    markDirty() {
        this.isDirty = true;
        this.saveToLocalStorage();
    }
    markClean() {
        this.isDirty = false;
        this.lastExportedHash = this.getCharacterHash();
        this.saveToLocalStorage();
    }
    getCharacterHash() {
        // Simples hash para comparar exportação
        try {
            return btoa(unescape(encodeURIComponent(JSON.stringify(this.character))));
        } catch {
            return '';
        }
    }
    saveToLocalStorageLegacy() {
        try {
            // Salvar o objeto completo, incluindo foto
            localStorage.setItem('t20_last_character', JSON.stringify(this.character));
            localStorage.setItem('t20_last_exported_hash', this.lastExportedHash || '');
        } catch {}
    }
    loadFromLocalStorageLegacy() {
        try {
            const data = localStorage.getItem('t20_last_character');
            if (data) {
                const parsed = JSON.parse(data);
                this.importCharacterData(parsed);
                this.isDirty = false;
                this.lastExportedHash = localStorage.getItem('t20_last_exported_hash') || null;
                console.log('Ficha carregada do localStorage:', this.character);
                return true;
            }
        } catch (e) {
            console.error('Erro ao carregar do localStorage:', e);
        }
        return false;
    }

    // --- Foto do personagem ---
    initPhotoUI() {
        const editBtn = document.getElementById('editPhotoBtn');
        // Remover controles da interface principal (ficam só no modal)
        // Modal elements
        const modal = document.getElementById('photoEditModal');
        const modalBackdrop = document.querySelector('.photo-edit-modal-backdrop');
        const modalContent = document.querySelector('.photo-edit-modal-content');
        const img = document.getElementById('photo-edit-img');
        const circle = document.getElementById('photo-edit-circle');
        const uploadBtn = document.getElementById('photoEditUploadBtn');
        const fileInput = document.getElementById('photoEditInput');
        // Remover slider de zoom e botões de zoom
        // const zoomSlider = document.getElementById('photoEditZoomSlider');
        // const zoomInBtn = document.getElementById('photoEditZoomInBtn');
        // const zoomOutBtn = document.getElementById('photoEditZoomOutBtn');
        const resetBtn = document.getElementById('photoEditResetBtn');
        const removeBtn = document.getElementById('photoEditRemoveBtn');
        const saveBtn = document.getElementById('photoEditSaveBtn');
        const cancelBtn = document.getElementById('photoEditCancelBtn');
        // Dica dinâmica
        const instructions = modalContent.querySelector('.photo-edit-instructions');
        // Estado temporário de edição
        let tempSrc = null;
        let tempZoom = 1;
        let tempOffsetX = 0;
        let tempOffsetY = 0;
        // Detectar mobile
        function isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }
        function updateInstructions() {
            if (instructions) {
                if (isMobile()) {
                    instructions.textContent = 'Arraste para ajustar a posição. Use o gesto de pinça para dar zoom. Clique em "Adicionar ou alterar foto" para trocar a imagem.';
                } else {
                    instructions.textContent = 'Arraste para ajustar a posição. Use o scroll do mouse para dar zoom. Clique em "Adicionar ou alterar foto" para trocar a imagem.';
                }
            }
        }
        // Abrir modal ao clicar no lápis
        if (editBtn) {
            editBtn.onclick = () => {
                if (!this.character.foto || !(this.character.foto.srcOriginal || this.character.foto.src)) {
                    tempSrc = null;
                    tempZoom = 1;
                    tempOffsetX = 0;
                    tempOffsetY = 0;
                    img.src = '';
                    img.style.display = 'none';
                } else {
                    tempSrc = this.character.foto.srcOriginal || this.character.foto.src;
                    tempZoom = (typeof this.character.foto.zoom === 'number') ? this.character.foto.zoom : 1;
                    tempOffsetX = (typeof this.character.foto.offsetX === 'number') ? this.character.foto.offsetX : 0;
                    tempOffsetY = (typeof this.character.foto.offsetY === 'number') ? this.character.foto.offsetY : 0;
                    img.src = tempSrc;
                    img.style.display = 'block';
                    updateImgTransform();
                }
                updateInstructions();
                modal.style.display = 'flex';
            };
        }
        // Fechar modal
        function closeModal() {
            modal.style.display = 'none';
        }
        if (modalBackdrop) modalBackdrop.onclick = closeModal;
        if (cancelBtn) cancelBtn.onclick = closeModal;
        // Upload nova imagem
        if (uploadBtn) uploadBtn.onclick = () => fileInput.click();
        if (fileInput) fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                tempSrc = ev.target.result;
                img.src = tempSrc;
                img.style.display = 'block';
                tempZoom = 1;
                tempOffsetX = 0;
                tempOffsetY = 0;
                updateImgTransform();
            };
            reader.readAsDataURL(file);
        };
        // Resetar posição
        if (resetBtn) resetBtn.onclick = () => {
            tempZoom = 1;
            tempOffsetX = 0;
            tempOffsetY = 0;
            updateImgTransform();
        };
        // Remover foto
        if (removeBtn) removeBtn.onclick = () => {
            tempSrc = null;
            img.src = '';
            img.style.display = 'none';
            tempZoom = 1;
            tempOffsetX = 0;
            tempOffsetY = 0;
            updateImgTransform();
        };
        // Arrastar imagem
        let dragging = false;
        let startX = 0, startY = 0;
        let originX = 0, originY = 0;
        const onPointerDown = (e) => {
            if (!tempSrc) return;
            dragging = true;
            img.classList.add('dragging');
            startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            startY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
            originX = tempOffsetX;
            originY = tempOffsetY;
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('touchmove', onPointerMove, { passive: false });
            document.addEventListener('touchend', onPointerUp);
        };
        const onPointerMove = (e) => {
            if (!dragging) return;
            e.preventDefault && e.preventDefault();
            const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
            const dx = (clientX - startX) / circle.offsetWidth;
            const dy = (clientY - startY) / circle.offsetHeight;
            // Limite dinâmico baseado no tamanho exibido da imagem (contain + zoom)
            let maxOffsetX = 0, maxOffsetY = 0;
            if (img && circle) {
                const circleRect = circle.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();
                maxOffsetX = Math.max(0, (imgRect.width - circleRect.width) / (2 * circleRect.width));
                maxOffsetY = Math.max(0, (imgRect.height - circleRect.height) / (2 * circleRect.height));
            }
            tempOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, originX + dx));
            tempOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, originY + dy));
            updateImgTransform();
        };
        const onPointerUp = () => {
            dragging = false;
            img.classList.remove('dragging');
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('touchmove', onPointerMove);
            document.removeEventListener('touchend', onPointerUp);
        };
        if (circle) {
            circle.addEventListener('mousedown', onPointerDown);
            circle.addEventListener('touchstart', onPointerDown);
        }
        // Zoom com scroll do mouse (desktop)
        if (circle) {
            circle.addEventListener('wheel', function(e) {
                if (!tempSrc) return;
                e.preventDefault();
                let delta = e.deltaY < 0 ? 0.08 : -0.08;
                tempZoom = Math.max(1, Math.min(3, tempZoom + delta));
                updateImgTransform();
            }, { passive: false });
        }
        // Zoom com gesto de pinça (mobile)
        let lastPinchDist = null;
        if (circle) {
            circle.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    lastPinchDist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                }
            });
            circle.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2 && lastPinchDist !== null) {
                    e.preventDefault();
                    const newDist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    let scaleChange = (newDist - lastPinchDist) / 120; // Sensibilidade
                    tempZoom = Math.max(1, Math.min(3, tempZoom + scaleChange));
                    lastPinchDist = newDist;
                    updateImgTransform();
                }
            }, { passive: false });
            circle.addEventListener('touchend', function(e) {
                if (e.touches.length < 2) {
                    lastPinchDist = null;
                }
            });
        }
        function updateImgTransform() {
            if (!img) return;
            if (!tempSrc) {
                img.style.transform = 'none';
                return;
            }
            const circle = document.getElementById('photo-edit-circle');
            if (circle && img.complete) {
                const circleRect = circle.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();
                const extraW = Math.max(0, imgRect.width - circleRect.width);
                const extraH = Math.max(0, imgRect.height - circleRect.height);
                const tx = tempOffsetX * extraW;
                const ty = tempOffsetY * extraH;
                img.style.transform = `translate(${tx}px, ${ty}px) scale(${tempZoom})`;
            } else {
                if (tempZoom === 1 && tempOffsetX === 0 && tempOffsetY === 0) {
                    img.style.transform = 'none';
                } else {
                    img.style.transform = `translate(${tempOffsetX * 100}%, ${tempOffsetY * 100}%) scale(${tempZoom})`;
                }
            }
            if (uploadBtn) uploadBtn.style.zIndex = 2001;
        }
        // Salvar ajustes
        if (saveBtn) saveBtn.onclick = () => {
            if (!tempSrc) {
                this.removePhoto();
                closeModal();
                return;
            }
            // Salvar os valores ajustados no objeto foto
            this.character.foto = {
                src: tempSrc,
                srcOriginal: tempSrc,
                zoom: tempZoom,
                offsetX: tempOffsetX,
                offsetY: tempOffsetY
            };
            this.updatePhotoUI();
            this.markDirty();
            this.saveToLocalStorage();
            closeModal();
        };
        let imgNaturalWidth = 1, imgNaturalHeight = 1;
        img.onload = function() {
            imgNaturalWidth = img.naturalWidth;
            imgNaturalHeight = img.naturalHeight;
            updateImgTransform();
        };
        // Adicionar bind para input de foto principal
        const mainPhotoInput = document.getElementById('photoInput');
        if (mainPhotoInput) {
            mainPhotoInput.onchange = (e) => this.handlePhotoUpload(e);
        }
    }
    // --- Fim foto personagem ---

    // Atualizar atributo da perícia
    updateSkillAttribute(skillName, atributo) {
        if (!this.character.pericias[skillName]) this.character.pericias[skillName] = {};
        this.character.pericias[skillName].atributo = atributo;
        this.updateSkills();
        this.markDirty();
        this.saveToLocalStorage();
    }
}

// Initialize the application
const app = new TormentaCharacterSheet();

// Global functions for inline event handlers
window.app = app;

// Adicionar alerta de confirmação ao sair
window.addEventListener('beforeunload', function (e) {
    // Só exibir se houver alterações não exportadas
    if (app.isDirty) {
        e.preventDefault();
        e.returnValue = 'Você fez alterações na ficha que não foram exportadas. Tem certeza que deseja sair?';
        return 'Você fez alterações na ficha que não foram exportadas. Tem certeza que deseja sair?';
    }
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

// Adicionar lógica para o botão Zerar Ficha
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.onclick = function() {
        if (confirm('Tem certeza que deseja zerar a ficha? Esta ação não pode ser desfeita!')) {
            app.character = app.getDefaultCharacter();
            app.saveToLocalStorage();
            app.updateUI();
            app.updateAllCalculations();
            app.populateSkills();
            app.updateSkills();
            app.renderCustomResources();
            app.renderAbilities();
            app.renderItems();
            app.renderSpells();
            app.renderPowers();
            app.updatePhotoUI();
            app.isDirty = false;
        }
    };
}
